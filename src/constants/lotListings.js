/** Building types treated as lots / land on the public website. */
export const LOT_BUILDING_TYPES = [
    'Agricultural Land',
    'Commercial Lot',
    'Land',
    'Lot',
    'Residential Lot',
    'Vacant Lot',
];

/** Sale vs lease filter options for the lots page. */
export const LOT_LISTING_TYPE_OPTIONS = [
    { value: 'sale', label: 'For Sale' },
    { value: 'lease', label: 'For Lease' },
];

const LOT_TYPE_SET = new Set(LOT_BUILDING_TYPES.map((name) => name.toLowerCase()));

/**
 * True when a building/listing type is a lot or land (not a house-and-lot building).
 */
export function isLotBuildingType(buildingType) {
    const value = String(buildingType || '').trim();
    if (!value) return false;

    const normalized = value.toLowerCase();
    if (LOT_TYPE_SET.has(normalized)) return true;

    // "House & Lot" / "House and Lot" are house listings, not vacant lots.
    if (/\bhouse\s*(?:&|and)\s*lot\b/i.test(value)) {
        return false;
    }

    return /\b(?:vacant\s+)?lot\b|\bland\b/i.test(value);
}

export function isLotListing(item = {}) {
    return isLotBuildingType(item.building_type);
}

/**
 * Normalize listing_type for lots UI.
 * DB uses sale/rent; lots page shows For Sale / For Lease.
 */
export function getLotListingTypeValue(item = {}) {
    const value = String(item.listing_type || 'sale').trim().toLowerCase();
    return value === 'rent' ? 'lease' : 'sale';
}

export function getLotListingTypeLabel(item = {}) {
    return getLotListingTypeValue(item) === 'lease' ? 'For Lease' : 'For Sale';
}

export function sortLotTypes(types = []) {
    const rank = new Map(LOT_BUILDING_TYPES.map((name, index) => [name.toLowerCase(), index]));

    return [...types].sort((a, b) => {
        const aRank = rank.has(String(a).toLowerCase())
            ? rank.get(String(a).toLowerCase())
            : LOT_BUILDING_TYPES.length;
        const bRank = rank.has(String(b).toLowerCase())
            ? rank.get(String(b).toLowerCase())
            : LOT_BUILDING_TYPES.length;

        if (aRank !== bRank) return aRank - bRank;
        return String(a).localeCompare(String(b));
    });
}
