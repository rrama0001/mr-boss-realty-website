import { getSiteUrl } from '@/utils/seo';

export function getPropertyReferenceId(property = {}) {
    const ref = property.listingRef || property.unitSlug || property.referenceId || '';
    if (ref) {
        return String(ref).trim();
    }

    if (property.slug) {
        return String(property.slug).trim();
    }

    if (property.id != null) {
        return String(property.id).trim();
    }

    return '';
}

function toSitePath(value = '') {
    const raw = String(value || '').trim();
    if (!raw) return '';

    try {
        if (/^https?:\/\//i.test(raw)) {
            const parsed = new URL(raw);
            return `${parsed.pathname}${parsed.search}` || '/';
        }
    } catch {
        return '';
    }

    return raw.startsWith('/') ? raw : `/${raw}`;
}

export function resolvePropertyDetailUrl(router, detailTo, property = {}) {
    try {
        if (typeof detailTo === 'string' && detailTo.trim()) {
            const path = toSitePath(detailTo);
            if (path) return getSiteUrl(path);
        }

        const routeTarget = detailTo || property.detailTo;
        if (router && routeTarget) {
            const resolved = router.resolve(routeTarget);
            const path = toSitePath(resolved?.path || resolved?.fullPath || resolved?.href || '');
            if (path && path !== '/') {
                return getSiteUrl(path);
            }
        }
    } catch {
        // Fall through to properties index.
    }

    return getSiteUrl('/properties');
}

/**
 * Synchronous copy only. Avoid navigator.clipboard / navigator.share —
 * both have frozen Chromium tabs on Windows in this app.
 */
export function copyTextToClipboard(text) {
    const value = String(text || '').trim();
    if (!value) {
        throw new Error('Nothing to copy.');
    }

    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.setAttribute('aria-hidden', 'true');
    textarea.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;';
    document.body.appendChild(textarea);

    const selection = document.getSelection();
    const previousRange = selection && selection.rangeCount > 0
        ? selection.getRangeAt(0)
        : null;

    textarea.select();
    textarea.setSelectionRange(0, value.length);

    let copied = false;
    try {
        copied = document.execCommand('copy');
    } finally {
        document.body.removeChild(textarea);
        if (selection) {
            selection.removeAllRanges();
            if (previousRange) {
                selection.addRange(previousRange);
            }
        }
    }

    if (!copied) {
        throw new Error('Could not copy.');
    }
}

export function sharePropertyLink(router, property = {}) {
    const url = resolvePropertyDetailUrl(router, property.detailTo, property);
    copyTextToClipboard(url);
    return { mode: 'copy', url };
}

export function buildPropertyShareText(property = {}, url = '') {
    const title = String(property.title || property.propertyName || 'Property listing').trim();
    const referenceId = getPropertyReferenceId(property);
    const parts = [title];

    if (referenceId) {
        parts.push(`Ref: ${referenceId}`);
    }

    if (url) {
        parts.push(url);
    }

    return parts.join('\n');
}

export function getPropertyShareTargets(url = '', text = '', title = 'Property listing') {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    const encodedTitle = encodeURIComponent(title || 'Property listing');
    const encodedWhatsApp = encodeURIComponent(text || url);

    return [
        {
            key: 'whatsapp',
            label: 'WhatsApp',
            icon: 'ti ti-brand-whatsapp',
            tone: 'whatsapp',
            href: `https://wa.me/?text=${encodedWhatsApp}`,
        },
        {
            key: 'copy',
            label: 'Copy link',
            icon: 'ti ti-link',
            tone: 'copy',
            action: 'copy',
        },
        {
            key: 'facebook',
            label: 'Facebook',
            icon: 'ti ti-brand-facebook',
            tone: 'facebook',
            // `u` is the unit/property detail URL Facebook should attach by default.
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
            popup: true,
            windowName: 'fbShare',
        },
        {
            key: 'x',
            label: 'Twitter',
            icon: 'ti ti-brand-x',
            tone: 'x',
            href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            popup: true,
            windowName: 'xShare',
        },
        {
            key: 'linkedin',
            label: 'LinkedIn',
            icon: 'ti ti-brand-linkedin',
            tone: 'linkedin',
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            popup: true,
            windowName: 'liShare',
        },
        {
            key: 'telegram',
            label: 'Telegram',
            icon: 'ti ti-brand-telegram',
            tone: 'telegram',
            href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
            popup: true,
            windowName: 'tgShare',
        },
        {
            key: 'email',
            label: 'Email',
            icon: 'ti ti-mail',
            tone: 'email',
            href: `mailto:?subject=${encodedTitle}&body=${encodedText}`,
        },
        {
            key: 'reddit',
            label: 'Reddit',
            icon: 'ti ti-brand-reddit',
            tone: 'reddit',
            href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
            popup: true,
            windowName: 'redditShare',
        },
    ];
}

export function openShareTarget(href, { popup = false, windowName = 'propertyShare' } = {}) {
    if (!href) return;

    if (href.startsWith('mailto:')) {
        window.location.assign(href);
        return;
    }

    if (!popup) {
        window.open(href, '_blank', 'noopener,noreferrer');
        return;
    }

    const width = 680;
    const height = 720;
    const left = Math.max(0, Math.round((window.screen.width - width) / 2));
    const top = Math.max(0, Math.round((window.screen.height - height) / 2));
    const features = [
        'popup=yes',
        `width=${width}`,
        `height=${height}`,
        `left=${left}`,
        `top=${top}`,
        'resizable=yes',
        'scrollbars=yes',
    ].join(',');

    const shareWindow = window.open(href, windowName, features);
    if (shareWindow) {
        shareWindow.focus();
    }
}
