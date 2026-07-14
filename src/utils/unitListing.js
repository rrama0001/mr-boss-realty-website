export function isUnitRentListing(unit = {}) {
    return String(unit.listing_type || 'sale').toLowerCase() === 'rent';
}

export function pickUnitDisplayPrice(unit = {}) {
    if (!isUnitRentListing(unit)) {
        return Number(unit.unit_price) || 0;
    }

    if (unit.monthly_rent > 0) return unit.monthly_rent;
    if (unit.daily_rent > 0) return unit.daily_rent;
    if (unit.hourly_rent > 0) return unit.hourly_rent;
    if (unit.display_price > 0) return unit.display_price;

    return 0;
}

export function buildUnitPriceSuffix(unit = {}) {
    if (!isUnitRentListing(unit)) {
        return '';
    }

    if (unit.monthly_rent > 0) {
        return ' / mo';
    }

    if (unit.daily_rent > 0) {
        return ' / day';
    }

    if (unit.hourly_rent > 0) {
        return ' / hr';
    }

    return ' / mo';
}

export function formatUnitRentMetaLabel(unit = {}) {
    const parts = [];

    if (unit.monthly_rent > 0) parts.push('Monthly');
    if (unit.daily_rent > 0) parts.push('Daily');
    if (unit.hourly_rent > 0) parts.push('Hourly');

    return parts.length ? parts.join(' · ') : 'Rent on request';
}

export function getUnitListingStatus(unit = {}, fallbackStatus = 'For Sale') {
    if (isUnitRentListing(unit)) {
        return 'For Rent';
    }

    return fallbackStatus;
}
