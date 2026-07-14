import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { isBlockedUrl, stripMediaFromMarkdown } from '@/utils/mediaUrls';

marked.setOptions({
    gfm: true,
    breaks: true,
});

function stripBlockedMarkdownLinks(text) {
    return String(text)
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
            if (isBlockedUrl(url)) return alt || '';
            return match;
        })
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
            if (isBlockedUrl(url)) return label;
            return match;
        });
}

export function renderMarkdown(text) {
    if (!text) return '';

    const withoutMedia = stripMediaFromMarkdown(text);
    const sanitizedInput = stripBlockedMarkdownLinks(withoutMedia);
    const html = marked.parse(sanitizedInput, { async: false });

    DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
        if (
            (data.attrName === 'href' || data.attrName === 'src') &&
            isBlockedUrl(data.attrValue)
        ) {
            data.keepAttr = false;
        }
    });

    const clean = DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ['target', 'rel'],
    });

    DOMPurify.removeHook('uponSanitizeAttribute');

    return clean.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
}
