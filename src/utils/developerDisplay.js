export const UNAVAILABLE_DEVELOPER_LABEL = 'Not Available';

export function getWebsiteDeveloperDisplay(developer) {
    const trimmed = String(developer || '').trim();
    return trimmed || UNAVAILABLE_DEVELOPER_LABEL;
}

/** Card-friendly developer label; empty when private, unknown, or unavailable. */
export function getCardDeveloperDisplay(isPrivate, ...candidates) {
    if (isPrivate) {
        return '';
    }

    const display = getWebsiteDeveloperDisplay(
        candidates.find((value) => String(value || '').trim())
    );
    return display === UNAVAILABLE_DEVELOPER_LABEL ? '' : display;
}
