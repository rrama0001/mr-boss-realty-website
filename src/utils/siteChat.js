export const SITE_CHAT_INTEREST_EVENT = 'mrboss:chat-unit-interest';
export const SITE_CHAT_MESSAGE_EVENT = 'mrboss:chat-message';
export const SITE_CHAT_CONVERSATION_EVENT = 'mrboss:chat-conversation';
export const SITE_CHAT_STORAGE_KEY = 'mrboss-website-hero-chat';

function isStoredChatIdleExpired(saved) {
    const hours = Number(saved?.chatIdleTtlHours);
    if (!Number.isInteger(hours) || hours < 1) return false;

    const last = Number(saved?.lastActivityAt);
    if (!Number.isFinite(last) || last <= 0) return false;

    return Date.now() - last >= hours * 60 * 60 * 1000;
}

export function buildUnitInterestMessage(unitSlug) {
    const slug = String(unitSlug || '').trim();
    if (!slug) return '';
    return `I am interested in unit ${slug}`;
}

export function buildPropertyInterestMessage(propertySlug) {
    const slug = String(propertySlug || '').trim();
    if (!slug) return '';
    return `I am interested in property ${slug}`;
}

export function buildBuildingInterestMessage(buildingName, propertySlug) {
    const name = String(buildingName || '').trim();
    const slug = String(propertySlug || '').trim();
    if (name && slug) return `I am interested in ${name} at property ${slug}`;
    if (slug) return `I am interested in property ${slug}`;
    if (name) return `I am interested in ${name}`;
    return '';
}

export const UNITS_LISTING_INTEREST_MESSAGE = 'I am interested in available units';

export function dispatchUnitInterest(message) {
    const text = String(message || '').trim();
    if (!text) return;

    window.dispatchEvent(new CustomEvent(SITE_CHAT_INTEREST_EVENT, {
        detail: { message: text, silent: true },
    }));
}

/** Open the site chat widget and submit a user message (home hero search, etc.). */
export function dispatchSiteChatMessage(text) {
    const message = String(text || '').trim();
    if (!message) return;

    window.dispatchEvent(new CustomEvent(SITE_CHAT_MESSAGE_EVENT, {
        detail: { message },
    }));
}

export function hasStoredSiteChatConversation() {
    try {
        const raw = sessionStorage.getItem(SITE_CHAT_STORAGE_KEY);
        if (!raw) return false;
        const saved = JSON.parse(raw);
        if (isStoredChatIdleExpired(saved)) {
            sessionStorage.removeItem(SITE_CHAT_STORAGE_KEY);
            return false;
        }
        return Array.isArray(saved?.messages) && saved.messages.length > 0;
    } catch {
        return false;
    }
}

export function dispatchSiteChatConversationChange(hasConversation) {
    window.dispatchEvent(new CustomEvent(SITE_CHAT_CONVERSATION_EVENT, {
        detail: { hasConversation: Boolean(hasConversation) },
    }));
}
