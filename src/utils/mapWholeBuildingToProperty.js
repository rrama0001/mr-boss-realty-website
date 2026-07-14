import { formatProjectStatus, getProjectDisplayCity } from '@/utils/mapProjectToProperty';
import { getListingCity } from '@/utils/propertyCity';
import { getWebsitePropertyDisplayName } from '@/utils/propertyDisplayName';
import { getBuildingDetailRoute, getPropertyDetailRoute } from '@/utils/propertyRoutes';
import { buildBuildingInterestMessage } from '@/utils/siteChat';

const DEFAULT_BUILDING_IMAGE =
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

function formatRentPriceLabel(building = {}) {
    const parts = [];

    if (building.monthly_rent > 0) {
        parts.push('Monthly');
    }
    if (building.daily_rent > 0) {
        parts.push('Daily');
    }
    if (building.hourly_rent > 0) {
        parts.push('Hourly');
    }

    return parts.length ? parts.join(' · ') : 'Rent on request';
}

function pickWholeBuildingPrice(building = {}) {
    if (building.listing_type === 'sale') {
        return building.sale_price || 0;
    }

    if (building.monthly_rent > 0) return building.monthly_rent;
    if (building.daily_rent > 0) return building.daily_rent;
    if (building.hourly_rent > 0) return building.hourly_rent;

    return 0;
}

function buildWholeBuildingPriceLabel(building = {}) {
    if (building.listing_type === 'sale') {
        return '';
    }

    if (building.monthly_rent > 0) {
        return '';
    }

    if (building.daily_rent > 0) {
        return ' / day';
    }

    if (building.hourly_rent > 0) {
        return ' / hr';
    }

    return '';
}

function listingProjectFromCard(building, project = {}) {
    return {
        project_name: project.project_name || building.project_name,
        city: project.city || building.project_city,
        is_private_on_website: Boolean(project.is_private_on_website ?? building.is_private_on_website),
    };
}

export function mapWholeBuildingToPropertyCard(building, project = {}, options = {}) {
    const metaItems = [];

    if (building.building_type) {
        metaItems.push({ icon: 'ti ti-building-estate', text: building.building_type });
    }

    if (building.bedrooms != null) {
        metaItems.push({ icon: 'ti ti-bed', text: `${building.bedrooms} Br` });
    }

    if (building.bathrooms != null) {
        metaItems.push({ icon: 'ti ti-bath', text: `${building.bathrooms} Ba` });
    }

    if (building.stories != null) {
        metaItems.push({ icon: 'ti ti-stairs', text: `${building.stories} ${building.stories === 1 ? 'story' : 'stories'}` });
    }

    if (building.total_floor_area) {
        metaItems.push({ icon: 'ti ti-ruler', text: building.total_floor_area });
    }

    if (building.listing_type === 'rent') {
        metaItems.push({ icon: 'ti ti-calendar', text: formatRentPriceLabel(building) });
    }

    const projectName = getWebsitePropertyDisplayName({
        is_private_on_website: project.is_private_on_website ?? building.is_private_on_website,
        project_name: project.project_name || building.project_name,
    });

    const listingCity = getListingCity({ city: project.city || building.project_city });
    const locationDetail = building.building_name || '';

    const projectCity = getProjectDisplayCity({
        city: project.city || building.project_city,
    });

    const isRent = building.listing_type === 'rent';
    const price = pickWholeBuildingPrice(building);
    const priceSuffix = buildWholeBuildingPriceLabel(building);

    const projectSlug = project.slug || building.project_slug;

    return {
        id: `building-${building.id}`,
        buildingId: building.id,
        isWholeBuilding: true,
        title: building.building_name || 'Whole Property',
        propertyName: projectName,
        is_private_on_website: Boolean(project.is_private_on_website ?? building.is_private_on_website),
        city: listingCity,
        locationDetail,
        location: [projectCity, building.building_name].filter(Boolean).join(' · ') || projectName || 'Philippines',
        price,
        priceLabel: priceSuffix ? `${new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 0,
        }).format(price)}${priceSuffix}` : '',
        priceFrom: false,
        beds: null,
        baths: null,
        status: isRent ? 'For Rent' : 'For Sale',
        image: building.image || project.image || DEFAULT_BUILDING_IMAGE,
        metaItems,
        detailTo: options.linkToProject
            ? getPropertyDetailRoute(listingProjectFromCard(building, project))
            : getBuildingDetailRoute(building, project),
        listingRef: building.slug || '',
        propertySlug: projectSlug || '',
        interestMessage: buildBuildingInterestMessage(building.building_name, projectSlug),
        unitSlug: '',
    };
}

export function mapPublicWholeBuildingToPropertyCard(building, options = {}) {
    return mapWholeBuildingToPropertyCard(building, {
        id: building.project_id,
        slug: building.project_slug,
        project_name: building.project_name,
        is_private_on_website: building.is_private_on_website,
        city: building.project_city,
        location: building.project_location,
        status: building.project_status,
        image: building.image,
    }, options);
}

export function mapPublicListingToPropertyCard(item) {
    if (item.listing_kind === 'whole_building') {
        return mapPublicWholeBuildingToPropertyCard(item);
    }

    return null;
}
