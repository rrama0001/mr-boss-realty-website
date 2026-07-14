import { formatProjectStatus } from '@/utils/mapProjectToProperty';

/**
 * Collect searchable text from a unit on a property detail page.
 */
export function getUnitSearchableText(unit = {}, project = {}) {
    const parts = [
        unit.unit_type,
        unit.room_number,
        unit.slug,
        unit.unit_size,
        unit.payment_terms,
        unit.building_name,
        unit.building_type,
        unit.building_status,
        formatProjectStatus(unit.building_status),
        project.project_name,
        project.city,
        project.location,
        unit.project_name,
        unit.project_city,
        unit.project_location,
        unit.project_slug,
    ];

    if (unit.bedrooms != null) {
        parts.push(`${unit.bedrooms} br`, `${unit.bedrooms} bedroom`);
    }

    if (unit.bathrooms != null) {
        parts.push(`${unit.bathrooms} ba`, `${unit.bathrooms} bathroom`);
    }

    if (unit.floor != null) {
        parts.push(`floor ${unit.floor}`);
    }

    if (unit.unit_price > 0) {
        parts.push(String(unit.unit_price));
    }

    return parts
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
}

export function unitMatchesSearch(unit, query, project = {}) {
    const normalizedQuery = String(query || '').trim().toLowerCase();
    if (!normalizedQuery) return true;

    return getUnitSearchableText(unit, project).includes(normalizedQuery);
}
