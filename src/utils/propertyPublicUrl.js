export const PUBLIC_PRIVATE_PROJECT_SEGMENT = 'private-property';

export function cityToSlug(city = '') {
    return String(city)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function deriveNameSegmentFromDbSlug(dbSlug, city) {
    const citySlug = cityToSlug(city);
    if (!dbSlug) return 'property';
    if (!citySlug) return dbSlug;

    const suffix = `-${citySlug}`;
    if (dbSlug.endsWith(suffix)) {
        return dbSlug.slice(0, -suffix.length) || 'property';
    }

    const pattern = new RegExp(`^(.+)${suffix.replace(/-/g, '\\-')}-(\\d+)$`);
    const match = dbSlug.match(pattern);
    if (match) {
        return `${match[1]}-${match[2]}`;
    }

    return dbSlug;
}

export function deriveProjectSlugSegment(project = {}) {
    if (project.is_private_on_website) {
        return PUBLIC_PRIVATE_PROJECT_SEGMENT;
    }

    const nameSegment = cityToSlug(project.project_name || project.name);
    if (nameSegment) {
        return nameSegment;
    }

    return deriveNameSegmentFromDbSlug(
        project.slug || project.project_slug,
        project.city || project.project_city,
    );
}

export function getProjectUrlSegments(project = {}) {
    const citySlug = cityToSlug(project.city || project.project_city);

    return {
        citySlug,
        projectSlug: deriveProjectSlugSegment(project),
    };
}

export function projectMatchesUrlSegments(project = {}, citySlug = '', projectSlug = '') {
    const segments = getProjectUrlSegments(project);
    return segments.citySlug === cityToSlug(citySlug)
        && segments.projectSlug === cityToSlug(projectSlug);
}

export function buildPropertyDetailPath(project = {}) {
    const { citySlug, projectSlug } = getProjectUrlSegments(project);
    if (!citySlug || !projectSlug) return '/properties';
    return `/properties/${citySlug}/${projectSlug}`;
}

export function buildListingDetailPath(project = {}, listingRef = '') {
    const ref = String(listingRef || '').trim();
    if (!ref) return buildPropertyDetailPath(project);

    const { citySlug, projectSlug } = getProjectUrlSegments(project);
    if (!citySlug || !projectSlug) return '/properties';
    return `/properties/${citySlug}/${projectSlug}/${ref}`;
}

export function buildProjectPublicApiPath(project = {}) {
    const { citySlug, projectSlug } = getProjectUrlSegments(project);
    if (!citySlug || !projectSlug) return null;

    return `/projects/public/${encodeURIComponent(citySlug)}/${encodeURIComponent(projectSlug)}`;
}

export function buildListingPublicApiPath(project = {}, listingRef = '') {
    const { citySlug, projectSlug } = getProjectUrlSegments(project);
    const ref = String(listingRef || '').trim();
    if (!citySlug || !projectSlug || !ref) return null;

    return `/projects/public/${encodeURIComponent(citySlug)}/${encodeURIComponent(projectSlug)}/${encodeURIComponent(ref)}`;
}

export function buildListingPublicApiPathFromRoute(citySlug = '', projectSlug = '', listingRef = '') {
    const city = String(citySlug || '').trim();
    const project = String(projectSlug || '').trim();
    const ref = String(listingRef || '').trim();
    if (!city || !project || !ref) return null;

    return `/projects/public/${encodeURIComponent(city)}/${encodeURIComponent(project)}/${encodeURIComponent(ref)}`;
}

export function resolveCityFromSlug(slug = '', cities = []) {
    const normalized = String(slug || '').trim().toLowerCase();
    if (!normalized) return null;

    return cities.find((city) => cityToSlug(city) === normalized) || null;
}

export function getListingCity(property = {}) {
    const city = (property.city || property.project_city || '').trim();
    return city || null;
}
