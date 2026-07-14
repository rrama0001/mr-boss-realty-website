import { formatProjectStatus } from '@/utils/mapProjectToProperty';

/**
 * Collect searchable text from a mapped property card object (project listing).
 */
export function getPropertySearchableText(property = {}) {
    const parts = [
        property.title,
        property.slug,
        property.developer,
        property.city,
        property.location,
        property.address,
        property.description,
        property.amenities,
        property.status,
        property.statusKey,
        formatProjectStatus(property.statusKey),
    ];

    if (property.buildingCount > 0) {
        parts.push(`${property.buildingCount} building${property.buildingCount === 1 ? '' : 's'}`);
    }

    if (property.unitCount > 0) {
        parts.push(`${property.unitCount} unit${property.unitCount === 1 ? '' : 's'}`);
    }

    (property.buildingTypes || []).forEach((value) => parts.push(value));
    (property.unitTypes || []).forEach((value) => parts.push(value));
    (property.metaItems || []).forEach((item) => parts.push(item?.text));

    return parts
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
}

export function propertyMatchesSearch(property, query) {
    const normalizedQuery = String(query || '').trim().toLowerCase();
    if (!normalizedQuery) return true;

    return getPropertySearchableText(property).includes(normalizedQuery);
}
