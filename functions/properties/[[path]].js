/**
 * Cloudflare Pages Function: inject Open Graph tags for /properties/* URLs.
 * Uses the public API listing payload (image URLs point at Cloudflare R2).
 *
 * Runtime env (optional — falls back to VITE_* then defaults):
 *   VITE_API_URL / API_URL
 *   VITE_SITE_URL / WEBSITE_URL
 */

const DEFAULT_API = 'https://api.mrbossrealty.com/api';
const DEFAULT_SITE = 'https://mrbossrealty.com';
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

function apiOriginFromBase(apiBase) {
    return String(apiBase || DEFAULT_API).replace(/\/api\/?$/i, '').replace(/\/$/, '');
}

/**
 * Media lives on R2 and is served via the API app (`/uploads/*`).
 * Absolute R2 / API URLs are kept; relative `/uploads` paths resolve to the API origin.
 */
function toAbsoluteMediaUrl(url, { siteUrl, apiOrigin }) {
    const value = String(url || '').trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith('//')) return `https:${value}`;

    const uploadPath = value.replace(/^\/api\/uploads\//i, '/uploads/');
    if (uploadPath.startsWith('/uploads/')) {
        return `${apiOrigin}${uploadPath}`;
    }
    if (value.startsWith('/')) return `${siteUrl}${value}`;
    return `${siteUrl}/${value}`;
}

function stripHtml(value = '') {
    return String(value || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeApiBase(value) {
    const raw = String(value || '').trim().replace(/\/$/, '');
    if (!raw) return DEFAULT_API;
    if (/\/api$/i.test(raw)) return raw;
    return `${raw}/api`;
}

function normalizeSiteUrl(value, fallback) {
    return String(value || fallback || DEFAULT_SITE).trim().replace(/\/$/, '');
}

/**
 * Prefer listing cover/default image from API (R2 public URL or API /uploads proxy).
 * Prefer JPG/PNG among gallery candidates; fall back to WebP cover; logo last.
 */
function pickShareImage(data = {}, { siteUrl = DEFAULT_SITE, apiOrigin } = {}) {
    const origin = apiOrigin || apiOriginFromBase(DEFAULT_API);
    const resolve = (url) => toAbsoluteMediaUrl(url, { siteUrl, apiOrigin: origin });

    const gallery = [
        data.image,
        data.cover_image_url,
        ...(Array.isArray(data.asset_images) ? data.asset_images : []),
    ]
        .map(resolve)
        .filter(Boolean);

    if (gallery.length) {
        const preferred = gallery.find((url) => /\.(jpe?g|png)(\?|#|$)/i.test(url));
        return preferred || gallery[0];
    }

    const logo = resolve(data.logo);
    return logo || `${siteUrl}/og-default.png`;
}

function upsertMeta(html, attr, key, content) {
    const safe = escapeHtml(content);
    // Support single-line and multiline <meta> tags in index.html.
    const pattern = new RegExp(
        `<meta\\b[^>]*?\\b${attr}=["']${key}["'][^>]*>`,
        'is',
    );
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
    next = upsertMeta(next, 'property', 'og:image:secure_url', meta.image);
    next = upsertMeta(next, 'name', 'twitter:card', 'summary_large_image');
    next = upsertMeta(next, 'name', 'twitter:title', meta.title);
    next = upsertMeta(next, 'name', 'twitter:description', meta.description);
    next = upsertMeta(next, 'name', 'twitter:image', meta.image);
    return next;
}

async function fetchJson(url) {
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'User-Agent': 'MrBossRealty-OG/1.0',
            },
        });
        if (!res.ok) {
            console.error('OG API fetch failed', res.status, url);
            return null;
        }
        return res.json();
    } catch (err) {
        console.error('OG API fetch error', url, err);
        return null;
    }
}

function buildListingMeta(data, pageUrl, siteUrl, apiOrigin) {
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
        image: pickShareImage(data, { siteUrl, apiOrigin }),
    };
}

function buildPropertyMeta(data, pageUrl, siteUrl, apiOrigin) {
    const name = data.project_name || data.name || 'Property';
    const city = data.city || '';
    const description = stripHtml(data.description)
        || `Explore ${name}${city ? ` in ${city}` : ''} with Mr. Boss Realty.`;

    return {
        title: `${name} | Mr. Boss Realty`,
        description: description.slice(0, 200),
        url: pageUrl,
        image: pickShareImage(data, { siteUrl, apiOrigin }),
    };
}

async function resolveMeta(pathname, env, requestOrigin) {
    const apiBase = normalizeApiBase(env.API_URL || env.VITE_API_URL || DEFAULT_API);
    const apiOrigin = apiOriginFromBase(apiBase);
    const siteUrl = normalizeSiteUrl(
        env.WEBSITE_URL || env.VITE_SITE_URL,
        requestOrigin || DEFAULT_SITE,
    );
    const cleanPath = pathname.replace(/\/$/, '') || '/';
    const pageHost = normalizeSiteUrl(requestOrigin, siteUrl);
    const pageUrl = `${pageHost}${cleanPath}`;
    const parts = cleanPath.split('/').filter(Boolean);

    if (parts[0] === 'properties' && parts.length >= 4) {
        const [, citySlug, projectSlug, listingRef] = parts;
        const data = await fetchJson(
            `${apiBase}/projects/public/${encodeURIComponent(citySlug)}/${encodeURIComponent(projectSlug)}/${encodeURIComponent(listingRef)}`,
        );
        if (data) return buildListingMeta(data, pageUrl, siteUrl, apiOrigin);
    }

    if (parts[0] === 'properties' && parts.length === 3) {
        const [, citySlug, projectSlug] = parts;
        const data = await fetchJson(
            `${apiBase}/projects/public/${encodeURIComponent(citySlug)}/${encodeURIComponent(projectSlug)}`,
        );
        if (data) return buildPropertyMeta(data, pageUrl, siteUrl, apiOrigin);
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

    // Debug helper: /properties/...?og_debug=1 returns resolved meta JSON.
    if (url.searchParams.get('og_debug') === '1') {
        const meta = await resolveMeta(url.pathname, env, url.origin);
        return Response.json({
            meta,
            apiBase: normalizeApiBase(env.API_URL || env.VITE_API_URL || DEFAULT_API),
            siteUrl: normalizeSiteUrl(env.WEBSITE_URL || env.VITE_SITE_URL, url.origin),
        });
    }

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
