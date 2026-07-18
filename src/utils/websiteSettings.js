import api from '@/plugins/axios';

export const DEFAULT_PROPERTY_PAGE_SIZE = 15;
const MIN_PROPERTY_PAGE_SIZE = 1;
const MAX_PROPERTY_PAGE_SIZE = 100;

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
                };
                return cachedSettings;
            })
            .catch((err) => {
                console.error('Failed to load website settings:', err);
                cachedSettings = {
                    property_page_records_per_page: DEFAULT_PROPERTY_PAGE_SIZE,
                };
                return cachedSettings;
            });
    }

    return loadPromise;
}
