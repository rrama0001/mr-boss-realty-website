import { getPropertyDetailRoute } from '@/utils/propertyRoutes';
import { getListingCity } from '@/utils/propertyCity';
import { getWebsitePropertyDisplayName } from '@/utils/propertyDisplayName';
import { getWebsiteDeveloperDisplay } from '@/utils/developerDisplay';
import { buildPropertyInterestMessage } from '@/utils/siteChat';

const DEFAULT_PROPERTY_IMAGE =
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

const STATUS_LABELS = {
    under_construction: 'Under Construction',
    pre_selling: 'Pre-Selling',
    rfo: 'RFO',
    mixed_phases: 'Multiple Phases',
};

export function formatProjectStatus(status) {
    if (!status) return 'Contact for details';

    const key = String(status).trim().toLowerCase();
    if (STATUS_LABELS[key]) return STATUS_LABELS[key];

    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getProjectDisplayCity(project = {}) {
    const city = (project.city || project.project_city || '').trim();
    return city || 'Philippines';
}

export function mapProjectToProperty(project) {
    const metaItems = [];

    if (project.buildingCount > 0) {
        metaItems.push({
            icon: 'ti ti-building',
            text: `${project.buildingCount} Building${project.buildingCount === 1 ? '' : 's'}`,
        });
    }

    if (project.unitCount > 0) {
        metaItems.push({
            icon: 'ti ti-home',
            text: `${project.unitCount} Unit${project.unitCount === 1 ? '' : 's'}`,
        });
    }

    if (project.unitTypes?.length) {
        const preview = project.unitTypes.slice(0, 2).join(', ');
        const suffix = project.unitTypes.length > 2 ? '…' : '';
        metaItems.push({
            icon: 'ti ti-layout-grid',
            text: `${preview}${suffix}`,
        });
    }

    metaItems.push({
        icon: 'ti ti-building-estate',
        text: getWebsiteDeveloperDisplay(project.developer),
    });

    return {
        id: project.id,
        slug: project.slug || '',
        listingRef: project.slug || '',
        propertySlug: project.slug || '',
        interestMessage: buildPropertyInterestMessage(project.slug),
        is_private_on_website: Boolean(project.is_private_on_website),
        title: getWebsitePropertyDisplayName(project),
        location: getProjectDisplayCity(project),
        city: getListingCity(project) || '',
        address: project.location || '',
        developer: getWebsiteDeveloperDisplay(project.developer),
        description: project.description,
        amenities: project.amenities || '',
        unitTypes: project.unitTypes || [],
        buildingCount: project.buildingCount || 0,
        unitCount: project.unitCount || 0,
        price: project.minPrice || 0,
        priceFrom: Boolean(project.minPrice),
        status: formatProjectStatus(project.status),
        statusKey: project.status,
        buildingTypes: project.buildingTypes || [],
        image: project.image || DEFAULT_PROPERTY_IMAGE,
        metaItems,
        detailTo: getPropertyDetailRoute(project),
        isProjectCard: true,
    };
}
