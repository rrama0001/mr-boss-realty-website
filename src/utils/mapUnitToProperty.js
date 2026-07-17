import { formatProjectStatus, getProjectDisplayCity } from '@/utils/mapProjectToProperty';
import { getListingCity } from '@/utils/propertyCity';
import { getWebsitePropertyDisplayName } from '@/utils/propertyDisplayName';
import { getPropertyDetailRoute, getUnitDetailRoute } from '@/utils/propertyRoutes';
import { resolveUnitListingRef } from '@/utils/unitSlug';
import { classifyMediaUrl, resolveMediaUrl } from '@/utils/mediaUrls';
import {
    buildUnitPriceSuffix,
    formatUnitRentMetaLabel,
    getUnitListingStatus,
    isUnitRentListing,
    pickUnitDisplayPrice,
} from '@/utils/unitListing';
import unitDefaultImage from '@/assets/images/unit-default-image.jpg';

const DEFAULT_UNIT_IMAGE = unitDefaultImage;

function getUnitCardImage(unit = {}) {
    const candidate = unit.image;
    if (candidate && classifyMediaUrl(candidate)?.type === 'image') {
        return resolveMediaUrl(candidate) || DEFAULT_UNIT_IMAGE;
    }

    return DEFAULT_UNIT_IMAGE;
}

function listingProjectFromCard(unit, project = {}) {
    return {
        project_name: project.project_name || unit.project_name,
        city: project.city || unit.project_city,
        is_private_on_website: Boolean(project.is_private_on_website ?? unit.is_private_on_website),
    };
}

export function mapUnitToPropertyCard(unit, project = {}, options = {}) {
    const metaItems = [];

    if (unit.unit_size) {
        metaItems.push({ icon: 'ti ti-ruler', text: unit.unit_size });
    }

    if (unit.bedrooms != null) {
        metaItems.push({ icon: 'ti ti-bed', text: `${unit.bedrooms} Br` });
    }

    if (unit.bathrooms != null) {
        metaItems.push({ icon: 'ti ti-bath', text: `${unit.bathrooms} Ba` });
    }

    if (unit.building_name) {
        metaItems.push({ icon: 'ti ti-building', text: unit.building_name });
    }

    if (unit.floor != null) {
        metaItems.push({ icon: 'ti ti-stairs', text: `Floor ${unit.floor}` });
    }

    if (isUnitRentListing(unit)) {
        metaItems.push({ icon: 'ti ti-calendar', text: formatUnitRentMetaLabel(unit) });
    }

    const projectId = project.id || unit.project_id;
    const projectName = getWebsitePropertyDisplayName({
        is_private_on_website: project.is_private_on_website ?? unit.is_private_on_website,
        project_name: project.project_name || unit.project_name,
    });
    const listingCity = getListingCity({ city: project.city || unit.project_city });
    const locationDetail = [
        unit.building_name,
        unit.floor != null ? `Floor ${unit.floor}` : '',
    ].filter(Boolean).join(' · ');

    const locationParts = [
        listingCity || getProjectDisplayCity({ city: project.city || unit.project_city }),
        unit.building_name,
        unit.floor != null ? `Floor ${unit.floor}` : '',
    ].filter(Boolean);

    const unitLabel = unit.unit_label || unit.unit_type;
    const isRent = isUnitRentListing(unit);
    const price = pickUnitDisplayPrice(unit);

    return {
        id: unit.id,
        title: unitLabel,
        propertyName: projectName,
        is_private_on_website: Boolean(project.is_private_on_website ?? unit.is_private_on_website),
        city: listingCity,
        locationDetail,
        location: locationParts.join(' · ') || projectName || 'Philippines',
        price,
        priceSuffix: isRent ? buildUnitPriceSuffix(unit) : '',
        priceLabel: isRent && !price ? 'Rent on request' : undefined,
        priceFrom: false,
        beds: unit.bedrooms ?? null,
        baths: unit.bathrooms ?? null,
        status: getUnitListingStatus(unit, formatProjectStatus(unit.building_status || project.status)),
        listing_type: unit.listing_type || 'sale',
        image: getUnitCardImage(unit),
        metaItems,
        detailTo: options.linkToProject
            ? getPropertyDetailRoute(listingProjectFromCard(unit, project))
            : getUnitDetailRoute({ ...unit, slug: resolveUnitListingRef(unit) }, project),
        listingRef: resolveUnitListingRef(unit),
        unitSlug: resolveUnitListingRef(unit),
    };
}

export function mapPublicUnitToPropertyCard(unit, options = {}) {
    return mapUnitToPropertyCard(unit, {
        id: unit.project_id,
        slug: unit.project_slug,
        project_name: unit.project_name,
        is_private_on_website: unit.is_private_on_website,
        city: unit.project_city,
        location: unit.project_location,
        status: unit.project_status,
    }, options);
}
