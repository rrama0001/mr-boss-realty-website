/**
 * Cloudflare Pages Function: inject Open Graph tags for /properties/* URLs.
 * Facebook/LinkedIn crawlers do not run the Vue SPA, so meta must be in the HTML response.
 *
 * Env (Pages → Settings → Environment variables):
 *   API_URL=https://api.mrbossrealty.com/api
 *   WEBSITE_URL=https://www.mrbossrealty.com
 */

const DEFAULT_API = 'https://api.mrbossrealty.com/api';
const DEFAULT_SITE = 'https://www.mrbossrealty.com';
const DEFAULT_TITLE = 'Mr. Boss Realty | Find Your Dream Home in the Philippines';
const DEFAULT_DESCRIPTION =
    'Browse quality properties for sale and rent across the Philippines with AI-assisted search and expert guidance.';

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function toAbsoluteUrl(url, siteUrl) {
    const value = String(url || '').trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith('//')) return `https:${value}`;
    if (value.startsWith('/')) return `${siteUrl}${value}`;
    return `${siteUrl}/${value}`;
}

function stripHtml(value = '') {
    return String(value || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function upsertMeta(html, attr, key, content) {
    const safe = escapeHtml(content);
    const pattern = new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]*>`, 'i');
    if (pattern.test(html)) {
        return html.replace(pattern, `<meta ${attr}="${key}" content="${safe}">`);
    }
    return html.replace(/<\/head>/i, `    <meta ${attr}="${key}" content="${safe}">\n</head>`);
}

function upsertTitle(html, title) {
    const safe = escapeHtml(title);
    if (/<title>[\s\S]*?<\/title>/i.test(html)) {
        return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safe}</title>`);
    }
    return html.replace(/<\/head>/i, `    <title>${safe}</title>\n</head>`);
}

function upsertCanonical(html, href) {
    const safe = escapeHtml(href);
    if (/<link[^>]+rel=["']canonical["'][^>]*>/i.test(html)) {
        return html.replace(
            /<link[^>]+rel=["']canonical["'][^>]*>/i,
            `<link rel="canonical" href="${safe}">`,
        );
    }
    return html.replace(/<\/head>/i, `    <link rel="canonical" href="${safe}">\n</head>`);
}

function injectShareMeta(html, meta) {
    let next = html;
    next = upsertTitle(next, meta.title);
    next = upsertCanonical(next, meta.url);
    next = upsertMeta(next, 'name', 'description', meta.description);
    next = upsertMeta(next, 'property', 'og:type', 'website');
    next = upsertMeta(next, 'property', 'og:site_name', 'Mr. Boss Realty');
    next = upsertMeta(next, 'property', 'og:title', meta.title);
    next = upsertMeta(next, 'property', 'og:description', meta.description);
    next = upsertMeta(next, 'property', 'og:url', meta.url);
    next = upsertMeta(next, 'property', 'og:image', meta.image);
    next = upsertMeta(next, 'name', 'twitter:card', 'summary_large_image');
    next = upsertMeta(next, 'name', 'twitter:title', meta.title);
    next = upsertMeta(next, 'name', 'twitter:description', meta.description);
    next = upsertMeta(next, 'name', 'twitter:image', meta.image);
    return next;
}

async function fetchJson(url) {
    try {
        const res = await fetch(url, {
            headers: { Accept: 'application/json' },
            cf: { cacheTtl: 60, cacheEverything: true },
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

function buildListingMeta(data, pageUrl, siteUrl) {
    const isBuilding = Boolean(data?.is_whole_property_listing);
    const titleBase = isBuilding
        ? (data.building_name || 'Property listing')
        : (data.unit_label || data.unit_type || 'Unit listing');
    const propertyName = data.project_name || 'Mr. Boss Realty';
    const city = data.project_city || '';

    return {
        title: `${titleBase} | ${propertyName}`,
        description: [
            titleBase,
            propertyName ? `at ${propertyName}` : '',
            city ? `in ${city}.` : '',
            'View pricing and details with Mr. Boss Realty.',
        ].filter(Boolean).join(' '),
        url: pageUrl,
        image: toAbsoluteUrl(data.image || data.logo, siteUrl) || `${siteUrl}/og-default.png`,
    };
}

function buildPropertyMeta(data, pageUrl, siteUrl) {
    const name = data.project_name || data.name || 'Property';
    const city = data.city || '';
    const description = stripHtml(data.description)
        || `Explore ${name}${city ? ` in ${city}` : ''} with Mr. Boss Realty.`;

    return {
        title: `${name} | Mr. Boss Realty`,
        description: description.slice(0, 200),
        url: pageUrl,
        image: toAbsoluteUrl(data.image || data.logo || data.cover_image_url, siteUrl)
            || `${siteUrl}/og-default.png`,
    };
}

async function resolveMeta(pathname, env, requestOrigin) {
    const apiBase = String(env.API_URL || env.VITE_API_URL || DEFAULT_API).replace(/\/$/, '');
    const siteUrl = String(env.WEBSITE_URL || env.VITE_SITE_URL || requestOrigin || DEFAULT_SITE)
        .replace(/\/$/, '');
    const cleanPath = pathname.replace(/\/$/, '') || '/';
    // Prefer the exact host being scraped (mrbossrealty.com vs www).
    const pageHost = String(requestOrigin || siteUrl).replace(/\/$/, '');
    const pageUrl = `${pageHost}${cleanPath}`;
    const parts = cleanPath.split('/').filter(Boolean);
    // ["properties", city, project, listingRef?]

    if (parts[0] === 'properties' && parts.length >= 4) {
        const [, citySlug, projectSlug, listingRef] = parts;
        const data = await fetchJson(
            `${apiBase}/projects/public/${encodeURIComponent(citySlug)}/${encodeURIComponent(projectSlug)}/${encodeURIComponent(listingRef)}`,
        );
        if (data) return buildListingMeta(data, pageUrl, siteUrl);
    }

    if (parts[0] === 'properties' && parts.length === 3) {
        const [, citySlug, projectSlug] = parts;
        const data = await fetchJson(
            `${apiBase}/projects/public/${encodeURIComponent(citySlug)}/${encodeURIComponent(projectSlug)}`,
        );
        if (data) return buildPropertyMeta(data, pageUrl, siteUrl);
    }

    return {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        url: pageUrl,
        image: `${siteUrl}/og-default.png`,
    };
}

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // Only enrich document navigations; let asset requests fall through if any.
    const accept = request.headers.get('Accept') || '';
    if (accept.includes('text/css') || accept.includes('application/javascript')) {
        return context.next();
    }

    const indexResponse = await env.ASSETS.fetch(new Request(new URL('/index.html', url.origin)));
    let html = await indexResponse.text();

    try {
        const meta = await resolveMeta(url.pathname, env, url.origin);
        html = injectShareMeta(html, meta);
    } catch (err) {
        console.error('OG inject failed:', err);
    }

    return new Response(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=60',
        },
    });
}
