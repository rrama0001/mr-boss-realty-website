import { appName } from '@/config/app';
import { CONTACT_INFO } from '@/config/homeContent';
import { getCachedCompanyTagline } from '@/utils/companyProfile';
import logoUrl from '@/assets/images/mr-boss-realty-logo.png';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.mrbossrealty.com').replace(/\/$/, '');
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'https://api.mrbossrealty.com/api')
    .replace(/\/api\/?$/i, '')
    .replace(/\/$/, '');

const DEFAULT_DESCRIPTION =
    'Mr. Boss Realty helps you find condominiums, houses, and commercial properties across the Philippines with trusted guidance from inquiry to closing.';

export function getSiteUrl(path = '/') {
    if (!path || path === '/') return SITE_URL;
    return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Absolute media URLs for OG tags. Uploads live on R2 / API `/uploads`, not the website host.
 */
function toAbsoluteUrl(url) {
    const value = String(url || '').trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith('//')) return `https:${value}`;

    const uploadPath = value.replace(/^\/api\/uploads\//i, '/uploads/');
    if (uploadPath.startsWith('/uploads/')) {
        return `${API_ORIGIN}${uploadPath}`;
    }
    if (value.startsWith('/')) return `${SITE_URL}${value}`;
    if (value.startsWith('data:') || value.startsWith('blob:')) return value;
    // Bundled assets (e.g. logo import) are site-relative after Vite build.
    return `${SITE_URL}/${value.replace(/^\.\//, '')}`;
}

export function setMetaTag(attr, key, content) {
    if (content === undefined || content === null || content === '') return;

    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

export function setCanonical(href) {
    let el = document.querySelector('link[rel="canonical"]');
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
    }
    el.setAttribute('href', href);
}

export function updatePageMeta(meta = {}) {
    const title = meta.title || appName;
    const description = meta.description || DEFAULT_DESCRIPTION;
    const canonical = meta.canonical || getSiteUrl(meta.path || '/');
    const robots = meta.robots || 'index, follow';
    const ogImage = toAbsoluteUrl(meta.ogImage || logoUrl) || getSiteUrl('/og-default.png');

    document.title = title;
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', robots);
    setCanonical(canonical);

    setMetaTag('property', 'og:type', meta.ogType || 'website');
    setMetaTag('property', 'og:site_name', appName);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonical);
    setMetaTag('property', 'og:image', ogImage);

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);
}

export function getDefaultPageMeta(tagline) {
    const resolvedTagline = String(tagline || getCachedCompanyTagline() || CONTACT_INFO.tagline).trim()
        || CONTACT_INFO.tagline;

    return {
        title: `${appName} | ${resolvedTagline}`,
        description: DEFAULT_DESCRIPTION,
        path: '/',
        canonical: getSiteUrl('/'),
        ogImage: getSiteUrl('/og-default.png'),
    };
}

export function buildFaqPageJsonLd(faqs = []) {
    const items = Array.isArray(faqs) ? faqs : [];

    return {
        '@type': 'FAQPage',
        '@id': `${getSiteUrl('/')}#faq`,
        url: getSiteUrl('/'),
        mainEntity: items.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}
