import { getWebsitePropertyDisplayName } from '@/utils/propertyDisplayName';
import { getPropertyDetailRoute } from '@/utils/propertyRoutes';
import { resolveMediaUrl } from '@/utils/mediaUrls';

export function mapPublicProjectToPartner(project = {}) {
    const logoUrl = resolveMediaUrl(project.logo);

    return {
        id: project.id,
        slug: project.slug || '',
        name: getWebsitePropertyDisplayName(project),
        city: project.city?.trim() || '',
        logoUrl,
        detailTo: getPropertyDetailRoute(project),
        is_private_on_website: Boolean(project.is_private_on_website),
    };
}

export function isTrustedPartnerCandidate(project = {}) {
    if (!project?.slug || project.is_private_on_website) return false;

    return Boolean(resolveMediaUrl(project.logo));
}
