import { formatProjectStatus } from '@/utils/mapProjectToProperty';
import { formatCurrency } from '@/utils/formatCurrency';
import { getUnitDetailRoute, getBuildingDetailRoute } from '@/utils/propertyRoutes';
import {
    buildUnitPriceSuffix,
    isUnitRentListing,
    pickUnitDisplayPrice,
} from '@/utils/unitListing';

function formatYesNo(value) {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    return null;
}

function displayValue(value, fallback = '—') {
    if (value === null || value === undefined || value === '') return fallback;
    return value;
}

function normalizeSpecItems(items = [], { keepEmpty = false } = {}) {
    return items
        .map((item) => ({
            ...item,
            value: displayValue(item.value, '—'),
        }))
        .filter((item) => keepEmpty || item.value !== '—');
}

export function formatUnitListingPrice(unit = {}) {
    const price = pickUnitDisplayPrice(unit);
    if (!price) {
        return isUnitRentListing(unit) ? 'Rent on request' : formatCurrency(unit?.unit_price);
    }

    const formatted = formatCurrency(price);
    const suffix = buildUnitPriceSuffix(unit);
    return suffix ? `${formatted}${suffix}` : formatted;
}

export function formatBuildingListingPrice(building = {}) {
    if (!building) return '';

    if (building.listing_type === 'sale') {
        return formatCurrency(building.sale_price, { fallback: 'Price on request' });
    }

    const parts = [];
    if (building.monthly_rent > 0) {
        parts.push(`${formatCurrency(building.monthly_rent, { fallback: '' })} / mo`);
    }
    if (building.daily_rent > 0) {
        parts.push(`${formatCurrency(building.daily_rent, { fallback: '' })} / day`);
    }
    if (building.hourly_rent > 0) {
        parts.push(`${formatCurrency(building.hourly_rent, { fallback: '' })} / hr`);
    }

    return parts.filter(Boolean).join(' · ') || 'Price on request';
}

export function formatListingPrice(kind, listing = {}) {
    if (kind === 'building') {
        return formatBuildingListingPrice(listing);
    }

    return formatUnitListingPrice(listing);
}

export function formatUnitListingTitle(unit = {}) {
    return unit.unit_label || unit.unit_type || 'Unit';
}

export function formatBuildingListingTitle(building = {}) {
    return building.building_name || 'Whole Property';
}

export function formatListingTitle(kind, listing = {}) {
    if (kind === 'building') {
        return formatBuildingListingTitle(listing);
    }

    return formatUnitListingTitle(listing);
}

export function getListingDetailRoute(kind, listing = {}) {
    if (kind === 'building') {
        return getBuildingDetailRoute(listing);
    }

    return getUnitDetailRoute(listing);
}

export function buildUnitSpecItems(unit = {}) {
    const items = [
        {
            key: 'listing-type',
            label: 'Listing Type',
            value: isUnitRentListing(unit) ? 'For Rent' : 'For Sale',
        },
        {
            key: 'unit-type',
            label: 'Unit Type',
            value: unit.unit_type,
        },
        {
            key: 'size',
            label: 'Size',
            value: unit.unit_size,
        },
        {
            key: 'payment-terms',
            label: 'Payment Terms',
            value: unit.payment_terms,
        },
        {
            key: 'building',
            label: 'Building',
            value: unit.building_name,
        },
        {
            key: 'building-type',
            label: 'Building Type',
            value: unit.building_type,
        },
        {
            key: 'pet-allowed',
            label: 'Pets Allowed',
            value: formatYesNo(unit.is_pet_allowed),
        },
        {
            key: 'smoking',
            label: 'Smoking Allowed',
            value: formatYesNo(unit.is_allowed_smoking),
        },
        {
            key: 'amenities',
            label: 'Amenities',
            value: unit.amenities,
            fullWidth: true,
        },
    ];

    return normalizeSpecItems(items, { keepEmpty: true });
}

export function buildBuildingSpecItems(building = {}) {
    const items = [
        {
            key: 'listing-type',
            label: 'Listing Type',
            value: building.listing_type === 'rent'
                ? 'For Rent'
                : (building.listing_type === 'sale' ? 'For Sale' : null),
        },
        {
            key: 'building-type',
            label: 'Building Type',
            value: building.building_type,
        },
        {
            key: 'size',
            label: 'Size',
            value: building.total_floor_area,
        },
        {
            key: 'payment-terms',
            label: 'Payment Terms',
            value: building.payment_terms,
        },
        {
            key: 'building',
            label: 'Building',
            value: building.building_name,
        },
        {
            key: 'pet-allowed',
            label: 'Pets Allowed',
            value: formatYesNo(building.is_pet_allowed),
        },
        {
            key: 'smoking',
            label: 'Smoking Allowed',
            value: formatYesNo(building.is_allowed_smoking),
        },
        {
            key: 'amenities',
            label: 'Amenities',
            value: building.amenities,
            fullWidth: true,
        },
    ];

    return normalizeSpecItems(items, { keepEmpty: true });
}

export function buildListingSpecItems(kind, listing = {}) {
    if (kind === 'building') {
        return buildBuildingSpecItems(listing);
    }

    return buildUnitSpecItems(listing);
}

export function formatListingStatus(kind, listing = {}) {
    if (kind === 'building') {
        if (listing.listing_type === 'rent') return 'For Rent';
        if (listing.listing_type === 'sale') return 'For Sale';
        return formatProjectStatus(listing.building_status || listing.project_status);
    }

    return formatProjectStatus(listing.building_status || listing.project_status);
}
