export function normalizeHtml(content) {
    const trimmed = String(content || '').trim();
    if (!trimmed) return '';

    if (/<(p|ul|ol|div|h[1-6])[\s>]/i.test(trimmed)) {
        return trimmed;
    }

    return `<p>${trimmed}</p>`;
}
