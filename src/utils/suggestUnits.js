import { getProjectDisplayCity } from '@/utils/mapProjectToProperty';

const DEFAULT_LIMIT = 6;

function isSameUnit(a, b) {    if (!a || !b) return false;
    if (a.id != null && b.id != null) return String(a.id) === String(b.id);
    if (a.slug && b.slug) return String(a.slug).toLowerCase() === String(b.slug).toLowerCase();
    return false;
}

function parseSize(size) {
    if (size == null || size === '') return null;
    const match = String(size).match(/[\d.]+/);
    return match ? parseFloat(match[0]) : null;
}

function isSameUnitType(a, b) {
    return Boolean(
        a.unit_type
        && b.unit_type
        && String(a.unit_type).toLowerCase() === String(b.unit_type).toLowerCase(),
    );
}

function isSameCity(a, b) {
    return Boolean(
        a.project_city
        && b.project_city
        && String(a.project_city).toLowerCase() === String(b.project_city).toLowerCase(),
    );
}

function getUnitComparablePrice(unit = {}) {
    if (String(unit.listing_type || 'sale').toLowerCase() === 'rent') {
        if (unit.monthly_rent > 0) return Number(unit.monthly_rent);
        if (unit.daily_rent > 0) return Number(unit.daily_rent);
        if (unit.hourly_rent > 0) return Number(unit.hourly_rent);
        if (unit.display_price > 0) return Number(unit.display_price);
        return 0;
    }

    return Number(unit.unit_price) || 0;
}

/**
 * Pick the floor/ceiling scale from the price magnitude:
 * million+ → 1,000,000; hundred thousand → 100,000; ten thousand → 10,000; etc.
 */
function getSimilarPriceScale(value) {
    if (value >= 1_000_000) return 1_000_000;
    if (value >= 100_000) return 100_000;
    if (value >= 10_000) return 10_000;
    if (value >= 1_000) return 1_000;
    if (value >= 100) return 100;
    if (value >= 10) return 10;
    return 1;
}

/**
 * Similar-price band: [floor(base), ceiling(base) - 1] using the magnitude scale.
 * Example: ₱15,123,456 → [₱15,000,000, ₱15,999,999]
 * Example: ₱450,000 → [₱400,000, ₱499,999]
 */
function getSimilarPriceBand(price) {
    const value = Math.floor(Math.abs(Number(price)));
    if (!Number.isFinite(value) || value <= 0) return null;

    const scale = getSimilarPriceScale(value);
    const floor = Math.floor(value / scale) * scale;
    let ceiling = Math.ceil(value / scale) * scale;
    // Exact boundary (e.g. ₱15,000,000): ceil === floor, so move to the next bucket.
    if (ceiling === floor) {
        ceiling = floor + scale;
    }

    return {
        min: floor,
        max: ceiling - 1,
    };
}

function getPriceSimilarity(candidate, current) {
    const candidatePrice = getUnitComparablePrice(candidate);
    const currentPrice = getUnitComparablePrice(current);

    if (candidatePrice <= 0 || currentPrice <= 0) {
        return { match: false, score: 0 };
    }

    const band = getSimilarPriceBand(currentPrice);
    if (!band) {
        return { match: false, score: 0 };
    }

    const inBand = candidatePrice >= band.min && candidatePrice <= band.max;
    if (!inBand) {
        return { match: false, score: 0 };
    }

    const priceDiff = Math.abs(candidatePrice - currentPrice) / currentPrice;
    if (priceDiff <= 0.15) return { match: true, score: 4 };
    if (priceDiff <= 0.3) return { match: true, score: 2 };
    return { match: true, score: 1 };
}

export function scoreCrossProjectSimilarity(candidate, current) {
    let score = 0;

    if (isSameUnitType(candidate, current)) score += 5;
    if (isSameCity(candidate, current)) score += 4;
    score += getPriceSimilarity(candidate, current).score;

    return score;
}

function matchesCrossProjectSimilarity(candidate, current) {
    if (isSameUnitType(candidate, current)) return true;
    if (isSameCity(candidate, current)) return true;
    return getPriceSimilarity(candidate, current).match;
}

export function scoreUnitSimilarity(candidate, current) {
    let score = 0;

    if (
        candidate.bedrooms != null
        && current.bedrooms != null
        && Number(candidate.bedrooms) === Number(current.bedrooms)
    ) {
        score += 4;
    }

    if (
        candidate.bathrooms != null
        && current.bathrooms != null
        && Number(candidate.bathrooms) === Number(current.bathrooms)
    ) {
        score += 4;
    }

    if (
        candidate.unit_type
        && current.unit_type
        && String(candidate.unit_type).toLowerCase() === String(current.unit_type).toLowerCase()
    ) {
        score += 3;
    }

    const candidateSize = parseSize(candidate.unit_size);
    const currentSize = parseSize(current.unit_size);
    if (candidateSize != null && currentSize != null) {
        const sizeDiff = Math.abs(candidateSize - currentSize) / Math.max(currentSize, 1);
        if (sizeDiff <= 0.1) score += 3;
        else if (sizeDiff <= 0.25) score += 1;
    }

    const candidatePrice = Number(candidate.unit_price);
    const currentPrice = Number(current.unit_price);
    if (candidatePrice > 0 && currentPrice > 0) {
        const priceDiff = Math.abs(candidatePrice - currentPrice) / currentPrice;
        if (priceDiff <= 0.15) score += 2;
        else if (priceDiff <= 0.3) score += 1;
    }

    if (
        candidate.project_city
        && current.project_city
        && String(candidate.project_city).toLowerCase() === String(current.project_city).toLowerCase()
    ) {
        score += 2;
    }

    if (
        candidate.building_type
        && current.building_type
        && String(candidate.building_type).toLowerCase() === String(current.building_type).toLowerCase()
    ) {
        score += 1;
    }

    return score;
}

export function pickProjectSiblingUnits(units, currentUnit, limit = DEFAULT_LIMIT) {
    return (units || [])
        .filter((unit) => !isSameUnit(unit, currentUnit))
        .sort((a, b) => scoreUnitSimilarity(b, currentUnit) - scoreUnitSimilarity(a, currentUnit))
        .slice(0, limit);
}

export function pickSimilarUnits(allListings, currentUnit, limit = DEFAULT_LIMIT) {
    const currentProjectId = currentUnit.project_id;
    const currentProjectSlug = currentUnit.project_slug;

    return (allListings || [])
        .filter((item) => item.listing_kind !== 'whole_building')
        .filter((item) => !isSameUnit(item, currentUnit))
        .filter((item) => {
            if (currentProjectId != null && item.project_id != null) {
                return String(item.project_id) !== String(currentProjectId);
            }
            if (currentProjectSlug && item.project_slug) {
                return String(item.project_slug) !== String(currentProjectSlug);
            }
            return true;
        })
        .map((item) => ({ item, score: scoreCrossProjectSimilarity(item, currentUnit) }))
        .filter(({ item }) => matchesCrossProjectSimilarity(item, currentUnit))
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return (Number(b.item.unit_price) || 0) - (Number(a.item.unit_price) || 0);
        })
        .slice(0, limit)
        .map(({ item }) => item);
}

export function buildSimilarUnitsSubtitle(currentUnit, similarUnits, formatPrice) {
    if (!similarUnits?.length || !currentUnit) {
        return 'Units with similar specs you may also like.';
    }

    const parts = [];
    const hasTypeMatch = similarUnits.some((unit) => isSameUnitType(unit, currentUnit));
    const hasCityMatch = similarUnits.some((unit) => isSameCity(unit, currentUnit));
    const hasPriceMatch = similarUnits.some((unit) => getPriceSimilarity(unit, currentUnit).match);

    if (hasTypeMatch && currentUnit.unit_type) {
        parts.push(currentUnit.unit_type);
    }

    if (hasCityMatch) {
        const city = getProjectDisplayCity({ city: currentUnit.project_city });
        if (city) {
            parts.push(`in ${city}`);
        }
    }

    if (hasPriceMatch) {
        const comparablePrice = getUnitComparablePrice(currentUnit);
        if (comparablePrice > 0 && typeof formatPrice === 'function') {
            const suffix = String(currentUnit.listing_type || 'sale') === 'rent'
                ? (currentUnit.monthly_rent > 0 ? ' / mo' : currentUnit.daily_rent > 0 ? ' / day' : currentUnit.hourly_rent > 0 ? ' / hr' : '')
                : '';
            parts.push(`${formatPrice(comparablePrice)}${suffix}`.trim());
        } else {
            parts.push('price');
        }
    }

    if (!parts.length) {
        return 'Units with similar specs you may also like.';
    }

    if (parts.length === 1) {
        return `Units with similar specs (${parts[0]}) you may also like.`;
    }

    const last = parts.pop();
    return `Units with similar specs (${parts.join(', ')}, and ${last}) you may also like.`;
}

function matchesSimilarSize(candidate, current) {
    const candidateSize = parseSize(candidate.unit_size);
    const currentSize = parseSize(current.unit_size);
    if (candidateSize == null || currentSize == null) return false;

    const sizeDiff = Math.abs(candidateSize - currentSize) / Math.max(currentSize, 1);
    return sizeDiff <= 0.25;
}

function sortSimilarUnits(matches = []) {
    return [...matches].sort((a, b) => {
        const aKey = a.id != null ? String(a.id) : String(a.slug || '');
        const bKey = b.id != null ? String(b.id) : String(b.slug || '');
        return aKey.localeCompare(bKey);
    });
}

function filterSimilarUnitsByCriterion(pool, currentUnit, criterion = 'type') {
    if (criterion === 'type') {
        return pool.filter((item) => isSameUnitType(item, currentUnit));
    }

    if (criterion === 'price') {
        return pool.filter((item) => getPriceSimilarity(item, currentUnit).match);
    }

    if (criterion === 'size') {
        return pool.filter((item) => matchesSimilarSize(item, currentUnit));
    }

    return pool;
}

export function findSimilarUnitsByCriterion(allListings, currentUnit, criterion = 'type') {
    const pool = (allListings || [])
        .filter((item) => item.listing_kind !== 'whole_building')
        .filter((item) => !isSameUnit(item, currentUnit));

    return sortSimilarUnits(filterSimilarUnitsByCriterion(pool, currentUnit, criterion));
}

const SIMILAR_CRITERION_PRIORITY = ['type', 'price', 'size'];

function anchorSupportsSimilarCriterion(currentUnit, criterion) {
    if (!currentUnit) return false;

    if (criterion === 'type') {
        return Boolean(currentUnit.unit_type);
    }

    if (criterion === 'price') {
        return getUnitComparablePrice(currentUnit) > 0;
    }

    if (criterion === 'size') {
        return parseSize(currentUnit.unit_size) != null;
    }

    return false;
}

export function resolveDefaultSimilarCriterion(allListings, currentUnit) {
    for (const criterion of SIMILAR_CRITERION_PRIORITY) {
        if (findSimilarUnitsByCriterion(allListings, currentUnit, criterion).length > 0) {
            return criterion;
        }
    }

    const emptyFallbackOrder = ['price', 'size', 'type'];
    for (const criterion of emptyFallbackOrder) {
        if (anchorSupportsSimilarCriterion(currentUnit, criterion)) {
            return criterion;
        }
    }

    return 'price';
}