export function getPropertyReferenceId(property = {}) {
    const ref = property.listingRef || property.unitSlug || property.referenceId || '';
    if (ref) {
        return String(ref).trim();
    }

    if (property.slug) {
        return String(property.slug).trim();
    }

    if (property.id != null) {
        return String(property.id).trim();
    }

    return '';
}

export function resolvePropertyDetailUrl(router, detailTo) {
    if (!router) {
        return window.location.href;
    }

    if (!detailTo) {
        return new URL('/properties', window.location.origin).href;
    }

    const resolved = router.resolve(detailTo);
    return new URL(resolved.href, window.location.origin).href;
}

export async function copyTextToClipboard(text) {
    const value = String(text || '').trim();
    if (!value) {
        throw new Error('Nothing to copy.');
    }

    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

export async function sharePropertyLink(router, property = {}) {
    const url = resolvePropertyDetailUrl(router, property.detailTo);
    const title = property.title || 'Property listing';
    const referenceId = getPropertyReferenceId(property);

    if (navigator.share) {
        await navigator.share({
            title,
            text: referenceId ? `${title} (${referenceId})` : title,
            url,
        });
        return { mode: 'share' };
    }

    await copyTextToClipboard(url);
    return { mode: 'copy' };
}
