/**
 * Resolve uploaded media URLs for the public site.
 * - Rewrites legacy `/api/uploads/` → `/uploads/` (uploads are not under /api).
 * - In dev only, rewrites API-origin `/uploads` paths to same-origin so Vite can proxy them.
 */
export function resolveMediaUrl(url) {
    const value = String(url || '').trim();
    if (!value) return '';

    const normalized = value.replace(/\/api\/uploads\//gi, '/uploads/');

    if (import.meta.env.DEV) {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const apiOrigin = apiBase.replace(/\/api\/?$/, '');

        if (normalized.startsWith(`${apiOrigin}/uploads/`)) {
            return normalized.slice(apiOrigin.length);
        }
    }

    return normalized;
}

const BLOCKED_LINK_HOST =
    /(?:^|\.)((?:chatgpt|chat\.openai|openai)\.com|oaiusercontent\.com|files\.oaiusercontent\.com)$/i;

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg)(\?|#|$)/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i;
const PDF_EXT = /\.pdf(\?|#|$)/i;
const OFFICE_EXT = /\.(docx?|xlsx?|pptx?)(\?|#|$)/i;
const DOCUMENT_EXT = /\.(pdf|docx?|xlsx?|pptx?|txt|csv|rtf)(\?|#|$)/i;
const FILE_EXT = /\.([a-z0-9]{2,8})(\?|#|$)/i;
const PAGE_EXT = /\.(html?|php|asp|aspx)(\?|#|$)/i;
const IMAGE_HOST =
    /(?:^|\.)((?:images\.)?unsplash\.com|i\.imgur\.com|(?:[a-z0-9-]+\.)?cloudinary\.com)$/i;

const MARKDOWN_LINK = /!?\[([^\]]*)\]\(([^)\s]+)\)/g;
const MARKDOWN_IMAGE = /!\[([^\]]*)\]\(([^)\s]+)\)/g;
const BARE_URL = /https?:\/\/[^\s<>)\]"']+/gi;

export function isBlockedUrl(url) {
    if (!url || typeof url !== 'string') return true;

    try {
        const { hostname, protocol } = new URL(url.trim());
        if (protocol !== 'http:' && protocol !== 'https:') return true;
        return BLOCKED_LINK_HOST.test(hostname);
    } catch {
        return true;
    }
}

function trimTrailingPunctuation(url) {
    return url.replace(/[.,;:!?)]+$/, '');
}

function parseYouTubeId(url) {
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/^www\./, '');

        if (host === 'youtu.be') {
            return parsed.pathname.slice(1).split('/')[0] || null;
        }

        if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
            if (parsed.pathname.startsWith('/watch')) {
                return parsed.searchParams.get('v');
            }
            if (parsed.pathname.startsWith('/embed/') || parsed.pathname.startsWith('/shorts/')) {
                return parsed.pathname.split('/')[2] || null;
            }
        }
    } catch {
        return null;
    }

    return null;
}

function parseVimeoId(url) {
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/^www\./, '');

        if (host === 'vimeo.com' || host === 'player.vimeo.com') {
            const parts = parsed.pathname.split('/').filter(Boolean);
            const id = parts.find((part) => /^\d+$/.test(part));
            return id || null;
        }
    } catch {
        return null;
    }

    return null;
}

export function getVideoEmbedUrl(url) {
    const cleanUrl = trimTrailingPunctuation(String(url || '').trim());
    const youtubeId = parseYouTubeId(cleanUrl);
    if (youtubeId) {
        return `https://www.youtube.com/embed/${youtubeId}`;
    }

    const vimeoId = parseVimeoId(cleanUrl);
    if (vimeoId) {
        return `https://player.vimeo.com/video/${vimeoId}`;
    }

    return null;
}

export function getOfficeEmbedUrl(url) {
    const cleanUrl = trimTrailingPunctuation(String(url || '').trim());
    if (!cleanUrl) return null;
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(cleanUrl)}`;
}

function isLikelyImageUrl(url) {
    if (IMAGE_EXT.test(url)) return true;

    try {
        const { hostname } = new URL(url);
        return IMAGE_HOST.test(hostname.replace(/^www\./, ''));
    } catch {
        return false;
    }
}

export function classifyMediaUrl(url, label = '') {
    const cleanUrl = trimTrailingPunctuation(String(url || '').trim());
    if (!cleanUrl || isBlockedUrl(cleanUrl)) return null;

    const youtubeId = parseYouTubeId(cleanUrl);
    if (youtubeId) {
        return {
            type: 'video',
            url: cleanUrl,
            thumbnail: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
            label: label || 'Video',
        };
    }

    const vimeoId = parseVimeoId(cleanUrl);
    if (vimeoId) {
        return {
            type: 'video',
            url: cleanUrl,
            thumbnail: `https://vumbnail.com/${vimeoId}.jpg`,
            label: label || 'Video',
        };
    }

    if (VIDEO_EXT.test(cleanUrl)) {
        return {
            type: 'video',
            url: cleanUrl,
            thumbnail: null,
            label: label || 'Video',
        };
    }

    if (isLikelyImageUrl(cleanUrl)) {
        return {
            type: 'image',
            url: cleanUrl,
            thumbnail: cleanUrl,
            label: label || 'Image',
        };
    }

    if (PDF_EXT.test(cleanUrl)) {
        return {
            type: 'pdf',
            url: cleanUrl,
            thumbnail: null,
            label: label || 'PDF document',
        };
    }

    if (OFFICE_EXT.test(cleanUrl)) {
        return {
            type: 'document',
            url: cleanUrl,
            thumbnail: null,
            label: label || 'Document',
            embedUrl: getOfficeEmbedUrl(cleanUrl),
        };
    }

    if (DOCUMENT_EXT.test(cleanUrl)) {
        return {
            type: 'document',
            url: cleanUrl,
            thumbnail: null,
            label: label || 'Document',
            embedUrl: null,
        };
    }

    if (FILE_EXT.test(cleanUrl) && !PAGE_EXT.test(cleanUrl)) {
        return {
            type: 'file',
            url: cleanUrl,
            thumbnail: null,
            label: label || 'File',
        };
    }

    return null;
}

export function createMediaItem(url, label = '') {
    return classifyMediaUrl(url, label);
}

export function getPreviewIconClass(type) {
    switch (type) {
        case 'video':
            return 'ti ti-video';
        case 'pdf':
            return 'ti ti-file-type-pdf';
        case 'document':
            return 'ti ti-file-text';
        case 'file':
            return 'ti ti-file';
        default:
            return 'ti ti-photo';
    }
}

function addPreview(url, label, seen, items) {
    const preview = classifyMediaUrl(url, label);
    if (!preview || seen.has(preview.url)) return;

    seen.add(preview.url);
    items.push(preview);
}

export function extractMediaPreviews(text) {
    if (!text) return [];

    const source = String(text);
    const seen = new Set();
    const items = [];

    for (const match of source.matchAll(MARKDOWN_IMAGE)) {
        addPreview(match[2].trim(), match[1], seen, items);
    }

    for (const match of source.matchAll(MARKDOWN_LINK)) {
        addPreview(match[2].trim(), match[1], seen, items);
    }

    for (const match of source.matchAll(BARE_URL)) {
        addPreview(trimTrailingPunctuation(match[0]), '', seen, items);
    }

    return items;
}

export function stripMediaFromMarkdown(text) {
    let result = String(text);

    result = result.replace(MARKDOWN_IMAGE, (match, alt, url) => {
        if (isBlockedUrl(url)) return alt || '';
        if (classifyMediaUrl(url, alt)) return '';
        return match;
    });

    result = result.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, url) => {
        if (isBlockedUrl(url)) return label;
        if (classifyMediaUrl(url, label)) return '';
        return match;
    });

    result = result.replace(BARE_URL, (match) => {
        const url = trimTrailingPunctuation(match);
        if (isBlockedUrl(url)) return '';
        if (classifyMediaUrl(url)) return '';
        return match;
    });

    return result.replace(/\n{3,}/g, '\n\n').trim();
}
