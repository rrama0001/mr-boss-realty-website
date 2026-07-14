import mitt from 'mitt';
import { getPropertyReferenceId } from '@/utils/propertyCardActions';
import { canCompareListing } from '@/utils/fetchListingForCompare';

const ANCHOR_STORAGE_KEY = 'mr-boss-realty-compare-anchor';

export const compareBus = mitt();

export const COMPARE_EVENTS = {
    anchorChanged: 'anchor-changed',
    open: 'open',
};

export const COMPARE_MODES = {
    manual: 'manual',
    similar: 'similar',
};

export const SIMILAR_COMPARE_CRITERIA = {
    type: 'type',
    price: 'price',
    size: 'size',
};

function readAnchorPayload() {
    try {
        const raw = sessionStorage.getItem(ANCHOR_STORAGE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!parsed?.property) return null;

        return parsed;
    } catch {
        return null;
    }
}

function writeAnchorPayload(payload) {
    if (!payload) {
        sessionStorage.removeItem(ANCHOR_STORAGE_KEY);
        return;
    }

    sessionStorage.setItem(ANCHOR_STORAGE_KEY, JSON.stringify(payload));
}

export function getCompareAnchor() {
    const payload = readAnchorPayload();
    if (payload && !canCompareListing(payload.property)) {
        writeAnchorPayload(null);
        return null;
    }

    return payload;
}

export function setCompareAnchor(property = {}) {
    if (!canCompareListing(property)) {
        throw new Error('This listing cannot be compared yet.');
    }

    const referenceId = getPropertyReferenceId(property);
    if (!referenceId) {
        throw new Error('This listing does not have a reference ID yet.');
    }

    const payload = {
        referenceId,
        property: { ...property },
        selectedAt: Date.now(),
    };

    writeAnchorPayload(payload);
    compareBus.emit(COMPARE_EVENTS.anchorChanged, payload);

    return payload;
}

export function clearCompareAnchor() {
    writeAnchorPayload(null);
    compareBus.emit(COMPARE_EVENTS.anchorChanged, null);
}

export function isSameListing(a = {}, b = {}) {
    const aRef = getPropertyReferenceId(a);
    const bRef = getPropertyReferenceId(b);

    return Boolean(aRef && bRef && aRef === bRef);
}

export function openPropertyCompare(anchorProperty, currentProperty) {
    compareBus.emit(COMPARE_EVENTS.open, {
        mode: COMPARE_MODES.manual,
        anchor: anchorProperty,
        current: currentProperty,
    });
}

export function openSimilarPropertyCompare(property) {
    compareBus.emit(COMPARE_EVENTS.open, {
        mode: COMPARE_MODES.similar,
        anchor: property,
    });
}
