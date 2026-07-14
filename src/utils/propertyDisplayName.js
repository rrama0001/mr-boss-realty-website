export const PRIVATE_PROPERTY_LABEL = 'Private Property';

export function isPrivateOnWebsite(property = {}) {
    return Boolean(property.is_private_on_website);
}

/**
 * Display name for property/owner on the public website.
 * Uses the API flag so we never rely on a leaked real name in the payload.
 */
export function getWebsitePropertyDisplayName(property = {}) {
    if (isPrivateOnWebsite(property)) {
        return PRIVATE_PROPERTY_LABEL;
    }

    return property.project_name || property.title || property.propertyName || '';
}
