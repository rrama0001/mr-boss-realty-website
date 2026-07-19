import api from '@/plugins/axios';

export const DEFAULT_PROPERTY_PAGE_SIZE = 15;
const MIN_PROPERTY_PAGE_SIZE = 1;
const MAX_PROPERTY_PAGE_SIZE = 100;
const MIN_CHAT_IDLE_TTL_HOURS = 1;
const MAX_CHAT_IDLE_TTL_HOURS = 720;

let cachedSettings = null;
let loadPromise = null;

function normalizePageSize(value) {
    const parsed = Number(value);
    if (
        !Number.isInteger(parsed)
        || parsed < MIN_PROPERTY_PAGE_SIZE
        || parsed > MAX_PROPERTY_PAGE_SIZE
    ) {
        return DEFAULT_PROPERTY_PAGE_SIZE;
    }
    return parsed;
}

/** Empty/null = idle auto-delete disabled. */
export function normalizeChatIdleTtlHours(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    const parsed = Number(value);
    if (
        !Number.isInteger(parsed)
        || parsed < MIN_CHAT_IDLE_TTL_HOURS
        || parsed > MAX_CHAT_IDLE_TTL_HOURS
    ) {
        return null;
    }
    return parsed;
}

export function isChatIdleExpired(lastActivityAt, idleTtlHours, now = Date.now()) {
    const hours = normalizeChatIdleTtlHours(idleTtlHours);
    if (!hours) return false;

    const last = Number(lastActivityAt);
    if (!Number.isFinite(last) || last <= 0) return false;

    return now - last >= hours * 60 * 60 * 1000;
}

export async function loadWebsiteSettings() {
    if (cachedSettings) return cachedSettings;

    if (!loadPromise) {
        loadPromise = api
            .get('/website-settings')
            .then((res) => {
                cachedSettings = {
                    property_page_records_per_page: normalizePageSize(
                        res.data?.property_page_records_per_page,
                    ),
                    chat_idle_ttl_hours: normalizeChatIdleTtlHours(
                        res.data?.chat_idle_ttl_hours,
                    ),
                };
                return cachedSettings;
            })
            .catch((err) => {
                console.error('Failed to load website settings:', err);
                cachedSettings = {
                    property_page_records_per_page: DEFAULT_PROPERTY_PAGE_SIZE,
                    chat_idle_ttl_hours: null,
                };
                return cachedSettings;
            });
    }

    return loadPromise;
}
