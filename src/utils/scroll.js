import { nextTick } from 'vue';

const SCROLL_STORAGE_PREFIX = 'mr-scroll:';
const RESTORE_RETRY_MS = 50;
const RESTORE_MAX_ATTEMPTS = 24;

let skipNextScrollToTop = false;
let pendingRestore = null;
let scrollPersistenceInitialized = false;

export function scrollToPageTop() {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
}

export async function scrollToPageTopAfterRender() {
    if (shouldSkipScrollToTop()) {
        return;
    }

    await nextTick();
    scrollToPageTop();
    requestAnimationFrame(() => {
        scrollToPageTop();
    });
}

export function markScrollRestoreNavigation() {
    skipNextScrollToTop = true;
}

export function shouldSkipScrollToTop() {
    if (!skipNextScrollToTop) {
        return false;
    }

    skipNextScrollToTop = false;
    return true;
}

function getScrollStorageKey(fullPath = '/') {
    return `${SCROLL_STORAGE_PREFIX}${fullPath || '/'}`;
}

export function saveScrollForRoute(fullPath = '/') {
    if (typeof window === 'undefined' || !fullPath) {
        return;
    }

    try {
        sessionStorage.setItem(getScrollStorageKey(fullPath), String(window.scrollY));
    } catch {
        // Ignore storage failures (private mode, quota, etc.).
    }
}

export function readSavedScroll(fullPath = '/') {
    if (typeof window === 'undefined' || !fullPath) {
        return null;
    }

    try {
        const raw = sessionStorage.getItem(getScrollStorageKey(fullPath));
        if (raw == null) {
            return null;
        }

        const value = Number(raw);
        return Number.isFinite(value) && value >= 0 ? value : null;
    } catch {
        return null;
    }
}

export function isPageReload() {
    if (typeof window === 'undefined') {
        return false;
    }

    const entry = performance.getEntriesByType('navigation')[0];
    return entry?.type === 'reload';
}

function canRestoreScrollTop(top) {
    const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
    );

    return top <= maxScroll + 8;
}

function applyScrollPosition(position = {}) {
    const top = Math.max(0, Number(position.top) || 0);
    const left = Math.max(0, Number(position.left) || 0);

    window.scrollTo({ top, left, behavior: 'auto' });
    document.documentElement.scrollTop = top;
    document.body.scrollTop = top;

    return { top, left };
}

export function restoreScrollPosition(position = {}, { attempts = RESTORE_MAX_ATTEMPTS } = {}) {
    const target = {
        top: Math.max(0, Number(position.top) || 0),
        left: Math.max(0, Number(position.left) || 0),
    };

    pendingRestore = target;

    return new Promise((resolve) => {
        const attemptRestore = async (remaining) => {
            await nextTick();
            applyScrollPosition(target);

            requestAnimationFrame(() => {
                applyScrollPosition(target);

                if (canRestoreScrollTop(target.top) || remaining <= 0) {
                    pendingRestore = null;
                    resolve(target);
                    return;
                }

                window.setTimeout(() => {
                    attemptRestore(remaining - 1);
                }, RESTORE_RETRY_MS);
            });
        };

        attemptRestore(attempts);
    });
}

export function flushPendingScrollRestore() {
    if (!pendingRestore) {
        return Promise.resolve(null);
    }

    return restoreScrollPosition(pendingRestore);
}

export function setupScrollPersistence(router) {
    if (typeof window === 'undefined' || scrollPersistenceInitialized || !router) {
        return;
    }

    scrollPersistenceInitialized = true;

    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    router.beforeEach((to, from) => {
        if (from?.fullPath) {
            saveScrollForRoute(from.fullPath);
        }

        return true;
    });

    let throttleId = 0;
    const onScroll = () => {
        if (throttleId) {
            return;
        }

        throttleId = window.setTimeout(() => {
            throttleId = 0;
            saveScrollForRoute(router.currentRoute.value.fullPath);
        }, 150);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', () => {
        saveScrollForRoute(router.currentRoute.value.fullPath);
    });
}
