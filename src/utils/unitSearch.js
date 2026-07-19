import { formatProjectStatus } from '@/utils/mapProjectToProperty';
import { resolveUnitListingRef } from '@/utils/unitSlug';

/**
 * Normalize text for loose matching (case, punctuation, spacing).
 */
export function normalizeSearchText(value) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Every query word must appear as a substring (e.g. "flex" matches "flexi unit").
 */
export function textMatchesSearch(haystack, query) {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return true;

    const text = normalizeSearchText(haystack);
    if (!text) return false;

    const tokens = normalizedQuery.split(' ').filter(Boolean);
    return tokens.every((token) => text.includes(token));
}

/**
 * Collect searchable text from a unit on a property detail page.
 */
export function getUnitSearchableText(unit = {}, project = {}) {
    const listingRef = resolveUnitListingRef(unit);

    const parts = [
        unit.unit_type,
        unit.unit_label,
        unit.room_number,
        unit.slug,
        listingRef,
        unit.listingRef,
        unit.unit_size,
        unit.payment_terms,
        unit.building_name,
        unit.building_type,
        unit.building_status,
        unit.building_slug,
        formatProjectStatus(unit.building_status),
        project.project_name,
        project.city,
        project.location,
        unit.project_name,
        unit.project_city,
        unit.project_location,
        unit.project_slug,
        unit.amenities,
        project.amenities,
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
        .join(' ');
}

export function unitMatchesSearch(unit, query, project = {}) {
    return textMatchesSearch(getUnitSearchableText(unit, project), query);
}

export function buildingMatchesSearch(building = {}, query = '', project = {}) {
    const haystack = [
        building.building_name,
        building.building_type,
        building.listing_type,
        building.project_name,
        building.project_city,
        project.project_name,
        project.city,
        project.amenities,
        building.amenities,
    ].filter(Boolean).join(' ');

    return textMatchesSearch(haystack, query);
}
