import { buildListingPublicApiPathFromRoute, buildProjectPublicApiPath } from '@/utils/propertyCity';
import { mapUnitToPropertyCard } from '@/utils/mapUnitToProperty';
import { getBuildingDetailRoute, getUnitDetailRoute } from '@/utils/propertyRoutes';

const LISTING_HASH_PATTERN = /^[a-f0-9]{8}$/i;
const BUILDING_CARD_ID_PATTERN = /^building-(\d+)$/i;

function listingRefFromProperty(property = {}) {
    return String(property.listingRef || property.unitSlug || '').trim();
}

function numericUnitId(property = {}) {
    if (property.id == null) {
        return null;
    }

    const raw = String(property.id).trim();
    if (BUILDING_CARD_ID_PATTERN.test(raw)) {
        return null;
    }

    const parsed = parseInt(raw, 10);
    return Number.isNaN(parsed) ? null : parsed;
}

function buildingIdFromProperty(property = {}) {
    if (property.buildingId != null) {
        const parsed = parseInt(property.buildingId, 10);
        return Number.isNaN(parsed) ? null : parsed;
    }

    const raw = String(property.id || '').trim();
    const match = raw.match(BUILDING_CARD_ID_PATTERN);
    if (!match) {
        return null;
    }

    const parsed = parseInt(match[1], 10);
    return Number.isNaN(parsed) ? null : parsed;
}

function projectFromPropertyCard(property = {}) {
    return {
        project_name: property.propertyName,
        city: property.city,
        slug: property.propertySlug,
        is_private_on_website: property.is_private_on_website,
    };
}

function unitFromPropertyCard(property = {}) {
    const ref = listingRefFromProperty(property);

    return {
        id: numericUnitId(property),
        slug: ref || undefined,
        project_city: property.city,
        project_name: property.propertyName,
        is_private_on_website: property.is_private_on_website,
    };
}

function buildingFromPropertyCard(property = {}) {
    const ref = listingRefFromProperty(property);

    return {
        id: buildingIdFromProperty(property),
        slug: ref || undefined,
        listingRef: ref || undefined,
        project_city: property.city,
        project_name: property.propertyName,
        is_private_on_website: property.is_private_on_website,
    };
}

function segmentPathFromListingRoute(route) {
    if (route?.name !== 'property-listing-detail') {
        return null;
    }

    const { citySlug, projectSlug, listingRef } = route.params || {};
    return buildListingPublicApiPathFromRoute(citySlug, projectSlug, listingRef);
}

function pathFromDetailTo(detailTo) {
    if (!detailTo?.params) {
        return null;
    }

    const params = detailTo.params;

    if (detailTo.name === 'unit-detail-legacy' && params.legacySlug) {
        return `/units/public/${encodeURIComponent(params.legacySlug)}`;
    }

    if (detailTo.name === 'property-listing-detail') {
        return buildListingPublicApiPathFromRoute(
            params.citySlug,
            params.projectSlug,
            params.listingRef,
        );
    }

    return null;
}

function collectListingApiPaths(property = {}) {
    const paths = [];
    const seen = new Set();

    const add = (path) => {
        const normalized = String(path || '').trim();
        if (!normalized || seen.has(normalized)) {
            return;
        }

        seen.add(normalized);
        paths.push(normalized);
    };

    const project = projectFromPropertyCard(property);
    const listingRef = listingRefFromProperty(property);

    if (property.isWholeBuilding) {
        const route = getBuildingDetailRoute(buildingFromPropertyCard(property), project);
        add(segmentPathFromListingRoute(route));
    } else {
        const route = getUnitDetailRoute(unitFromPropertyCard(property), project);
        add(segmentPathFromListingRoute(route));

        if (route?.name === 'unit-detail-legacy' && route.params?.legacySlug) {
            add(`/units/public/${encodeURIComponent(route.params.legacySlug)}`);
        }
    }

    add(pathFromDetailTo(property.detailTo));

    if (LISTING_HASH_PATTERN.test(listingRef) && !property.isWholeBuilding) {
        add(`/units/public/${encodeURIComponent(listingRef)}`);
    }

    return paths;
}

export function buildPropertyListingApiPath(property = {}) {
    return collectListingApiPaths(property)[0] ?? null;
}

export function canCompareListing(property = {}) {
    return collectListingApiPaths(property).length > 0;
}

export function isProjectPropertyCard(property = {}) {
    if (property.isProjectCard) {
        return true;
    }

    return property.detailTo?.name === 'property-detail'
        && !property.isWholeBuilding
        && !canCompareListing(property);
}

export function canCompareSimilar(property = {}) {
    if (property.isWholeBuilding) {
        return false;
    }

    if (canCompareListing(property)) {
        return true;
    }

    return isProjectPropertyCard(property) && Number(property.unitCount) > 0;
}

function projectRecordFromPropertyCard(property = {}) {
    return {
        project_name: property.propertyName || property.title,
        city: property.city,
        slug: property.propertySlug || property.slug,
        is_private_on_website: property.is_private_on_website,
    };
}

function pickRepresentativeProjectUnit(units = []) {
    const candidates = (units || []).filter((unit) => unit?.slug || unit?.id != null);
    if (!candidates.length) {
        return null;
    }

    const sorted = [...candidates].sort((a, b) => {
        const aPrice = Number(a.unit_price || a.monthly_rent || a.daily_rent || a.hourly_rent || 0);
        const bPrice = Number(b.unit_price || b.monthly_rent || b.daily_rent || b.hourly_rent || 0);

        if (aPrice > 0 && bPrice > 0 && aPrice !== bPrice) {
            return aPrice - bPrice;
        }

        if (aPrice > 0 && !bPrice) {
            return -1;
        }

        if (!aPrice && bPrice > 0) {
            return 1;
        }

        return Number(a.id || 0) - Number(b.id || 0);
    });

    return sorted[0];
}

export async function resolveCompareSimilarProperty(api, property = {}) {
    if (canCompareListing(property)) {
        return property;
    }

    if (!isProjectPropertyCard(property) || Number(property.unitCount) <= 0) {
        throw new Error('This listing cannot be compared yet.');
    }

    const projectRecord = projectRecordFromPropertyCard(property);
    const segmentPath = buildProjectPublicApiPath(projectRecord);
    const slug = String(property.propertySlug || property.slug || '').trim();
    const paths = [
        segmentPath,
        slug ? `/projects/public/${encodeURIComponent(slug)}` : null,
    ].filter(Boolean);

    let projectDetail = null;
    let lastError = null;

    for (const path of paths) {
        try {
            const { data } = await api.get(path);
            projectDetail = data;
            break;
        } catch (err) {
            if (err?.response?.status === 404) {
                lastError = err;
                continue;
            }

            throw err;
        }
    }

    if (!projectDetail) {
        throw lastError ?? new Error('Could not load this property.');
    }

    const unit = pickRepresentativeProjectUnit(projectDetail.units);
    if (!unit) {
        throw new Error('No unit listings are available for this property yet.');
    }

    return mapUnitToPropertyCard(unit, {
        id: projectDetail.id,
        slug: projectDetail.slug,
        project_name: projectDetail.project_name || property.title,
        city: projectDetail.city || property.city,
        is_private_on_website: projectDetail.is_private_on_website ?? property.is_private_on_website,
    });
}

export function resolveListingKind(data = {}) {
    return data.is_whole_property_listing ? 'building' : 'unit';
}

export async function fetchPropertyListingDetail(api, property = {}) {
    const paths = collectListingApiPaths(property);
    if (!paths.length) {
        throw new Error('Could not resolve this listing.');
    }

    let lastError = null;

    for (const path of paths) {
        try {
            const { data } = await api.get(path);

            return {
                kind: resolveListingKind(data),
                data,
            };
        } catch (err) {
            if (err?.response?.status === 404) {
                lastError = err;
                continue;
            }

            throw err;
        }
    }

    throw lastError ?? new Error('Could not resolve this listing.');
}
