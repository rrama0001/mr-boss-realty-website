export const UNAVAILABLE_DEVELOPER_LABEL = 'Not Available';

export function getWebsiteDeveloperDisplay(developer) {
    const trimmed = String(developer || '').trim();
    return trimmed || UNAVAILABLE_DEVELOPER_LABEL;
}
