import {
    buildListingDetailPath,
    buildPropertyDetailPath,
    cityToSlug,
    getProjectUrlSegments,
} from '@/utils/propertyPublicUrl';
import { resolveUnitListingRef } from '@/utils/unitSlug';

export function getPropertyDetailRoute(project = {}) {
    const { citySlug, projectSlug } = getProjectUrlSegments(project);
    if (!citySlug || !projectSlug) {
        return { name: 'properties' };
    }

    return {
        name: 'property-detail',
        params: { citySlug, projectSlug },
    };
}

export function getPropertyDetailPath(project = {}) {
    return buildPropertyDetailPath(project);
}

export function getPropertiesByCityRoute(city = '') {
    const slug = cityToSlug(city);
    if (!slug) {
        return { name: 'properties' };
    }

    return {
        name: 'property-segment',
        params: { slug },
    };
}

export function getPropertiesByCityPath(city = '') {
    const slug = cityToSlug(city);
    if (!slug) return '/properties';
    return `/properties/${slug}`;
}

function buildListingProject(project = {}, unit = {}, building = {}) {
    return {
        project_name: unit.project_name
            || building.project_name
            || project.project_name
            || project.name,
        city: unit.project_city || building.project_city || project.city || project.project_city,
        is_private_on_website: Boolean(
            unit.is_private_on_website
            ?? building.is_private_on_website
            ?? project.is_private_on_website,
        ),
    };
}

export function getUnitDetailRoute(unit = {}, project = {}) {
    const listingRef = resolveUnitListingRef(unit);
    const listingProject = buildListingProject(project, unit);
    const { citySlug, projectSlug } = getProjectUrlSegments(listingProject);

    if (citySlug && projectSlug && listingRef) {
        return {
            name: 'property-listing-detail',
            params: {
                citySlug,
                projectSlug,
                listingRef,
            },
        };
    }

    if (unit.id != null) {
        return {
            name: 'unit-detail-legacy',
            params: { legacySlug: String(unit.id) },
        };
    }

    return { name: 'properties' };
}

export function getUnitDetailPath(unit = {}, project = {}) {
    const listingProject = buildListingProject(project, unit);
    return buildListingDetailPath(listingProject, resolveUnitListingRef(unit));
}

export function getBuildingDetailRoute(building = {}, project = {}) {
    const listingRef = building.slug || building.listingRef;
    const listingProject = buildListingProject(project, {}, building);
    const { citySlug, projectSlug } = getProjectUrlSegments(listingProject);

    if (citySlug && projectSlug && listingRef) {
        return {
            name: 'property-listing-detail',
            params: {
                citySlug,
                projectSlug,
                listingRef: String(listingRef),
            },
        };
    }

    return { name: 'properties' };
}

export function getBuildingDetailPath(building = {}, project = {}) {
    const listingProject = buildListingProject(project, {}, building);
    const listingRef = building.slug || building.listingRef;
    return buildListingDetailPath(listingProject, listingRef);
}
