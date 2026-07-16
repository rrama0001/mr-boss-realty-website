const DEFAULT_SITE_URL = 'https://www.mrbossrealty.com';
const DEFAULT_API_URL = 'http://localhost:3000/api';
const DEFAULT_TITLE = 'Mr. Boss Realty | Find Your Dream Home in the Philippines';
const DEFAULT_DESCRIPTION =
    'Browse quality properties for sale and rent across the Philippines with AI-assisted search and expert guidance.';

const LISTING_PATH = /^\/properties\/([^/]+)\/([^/]+)\/([^/]+)\/?$/i;
const PROPERTY_PATH = /^\/properties\/([^/]+)\/([^/]+)\/?$/i;

function getSiteUrl() {
    return String(process.env.WEBSITE_URL || process.env.VITE_SITE_URL || DEFAULT_SITE_URL)
        .trim()
        .replace(/\/$/, '');
}

function getApiBaseUrl() {
    const raw = String(process.env.API_URL || process.env.VITE_API_URL || DEFAULT_API_URL).trim();
    if (!raw) return DEFAULT_API_URL;
    if (/\/api\/?$/i.test(raw)) {
        return raw.replace(/\/$/, '');
    }
    return `${raw.replace(/\/$/, '')}/api`;
}

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function toAbsoluteUrl(url, siteUrl = getSiteUrl()) {
    const value = String(url || '').trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith('//')) return `https:${value}`;
    if (value.startsWith('/')) return `${siteUrl}${value}`;
    return `${siteUrl}/${value}`;
}

function defaultOgImage(siteUrl = getSiteUrl()) {
    return `${siteUrl}/og-default.png`;
}

function stripHtml(value = '') {
    return String(value || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

async function fetchJson(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    try {
        const res = await fetch(url, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    } finally {
        clearTimeout(timer);
    }
}

function buildListingMeta(data, pageUrl) {
    const siteUrl = getSiteUrl();
    const isBuilding = Boolean(data?.is_whole_property_listing);
    const titleBase = isBuilding
        ? (data.building_name || 'Property listing')
        : (data.unit_label || data.unit_type || 'Unit listing');
    const propertyName = data.project_name || 'Mr. Boss Realty';
    const city = data.project_city || '';
    const title = `${titleBase} | ${propertyName}`;
    const description = [
        titleBase,
        propertyName ? `at ${propertyName}` : '',
        city ? `in ${city}.` : '',
        'View pricing and details with Mr. Boss Realty.',
    ].filter(Boolean).join(' ');

    return {
        title,
        description,
        url: pageUrl,
        image: toAbsoluteUrl(data.image || data.logo, siteUrl) || defaultOgImage(siteUrl),
        type: 'website',
    };
}

function buildPropertyMeta(data, pageUrl) {
    const siteUrl = getSiteUrl();
    const name = data.project_name || data.name || 'Property';
    const city = data.city || '';
    const description = stripHtml(data.description)
        || `Explore ${name}${city ? ` in ${city}` : ''} with Mr. Boss Realty.`;

    return {
        title: `${name} | Mr. Boss Realty`,
        description: description.slice(0, 200),
        url: pageUrl,
        image: toAbsoluteUrl(data.image || data.logo || data.cover_image_url, siteUrl)
            || defaultOgImage(siteUrl),
        type: 'website',
    };
}

function buildHomeMeta(pageUrl) {
    const siteUrl = getSiteUrl();
    return {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        url: pageUrl || `${siteUrl}/`,
        image: defaultOgImage(siteUrl),
        type: 'website',
    };
}

async function resolveShareMeta(urlPath = '/') {
    const siteUrl = getSiteUrl();
    const apiBase = getApiBaseUrl();
    const pathname = String(urlPath || '/').split('?')[0] || '/';
    const pageUrl = `${siteUrl}${pathname === '/' ? '/' : pathname.replace(/\/$/, '') || '/'}`;

    const listingMatch = pathname.match(LISTING_PATH);
    if (listingMatch) {
        const [, citySlug, projectSlug, listingRef] = listingMatch;
        const data = await fetchJson(
            `${apiBase}/projects/public/${encodeURIComponent(citySlug)}/${encodeURIComponent(projectSlug)}/${encodeURIComponent(listingRef)}`,
        );
        if (data) {
            return buildListingMeta(data, pageUrl);
        }
    }

    const propertyMatch = pathname.match(PROPERTY_PATH);
    if (propertyMatch) {
        const [, citySlug, projectSlug] = propertyMatch;
        const data = await fetchJson(
            `${apiBase}/projects/public/${encodeURIComponent(citySlug)}/${encodeURIComponent(projectSlug)}`,
        );
        if (data) {
            return buildPropertyMeta(data, pageUrl);
        }
    }

    if (pathname === '/' || pathname === '') {
        return buildHomeMeta(pageUrl);
    }

    return {
        title: 'Mr. Boss Realty',
        description: DEFAULT_DESCRIPTION,
        url: pageUrl,
        image: defaultOgImage(siteUrl),
        type: 'website',
    };
}

function upsertMeta(html, attr, key, content) {
    const safe = escapeHtml(content);
    const pattern = new RegExp(
        `<meta[^>]+${attr}=["']${key}["'][^>]*>`,
        'i',
    );

    if (pattern.test(html)) {
        return html.replace(
            pattern,
            `<meta ${attr}="${key}" content="${safe}">`,
        );
    }

    return html.replace(
        /<\/head>/i,
        `    <meta ${attr}="${key}" content="${safe}">\n</head>`,
    );
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
    next = upsertMeta(next, 'property', 'og:type', meta.type || 'website');
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

async function renderIndexWithShareMeta(indexHtml, urlPath) {
    const meta = await resolveShareMeta(urlPath);
    return injectShareMeta(indexHtml, meta);
}

module.exports = {
    resolveShareMeta,
    renderIndexWithShareMeta,
    getSiteUrl,
    getApiBaseUrl,
    defaultOgImage,
    toAbsoluteUrl,
};
