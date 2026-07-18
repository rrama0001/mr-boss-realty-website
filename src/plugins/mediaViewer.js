import mitt from 'mitt';
import MediaViewer from '@/components/media/MediaViewer.vue';
import { createMediaItem } from '@/utils/mediaUrls';

export const mediaViewerBus = mitt();

function normalizeOpenPayload(itemOrUrl, label) {
    if (itemOrUrl && Array.isArray(itemOrUrl.items)) {
        const items = itemOrUrl.items.filter(Boolean);
        if (!items.length) return null;

        const index = Number.isInteger(itemOrUrl.index)
            ? Math.min(Math.max(0, itemOrUrl.index), items.length - 1)
            : 0;

        return { items, index };
    }

    const item =
        typeof itemOrUrl === 'string' ? createMediaItem(itemOrUrl, label || '') : itemOrUrl;
    if (!item) return null;

    return { items: [item], index: 0 };
}

export default {
    install(app) {
        app.component('MediaViewer', MediaViewer);

        app.config.globalProperties.$openMediaViewer = (itemOrUrl, label) => {
            const payload = normalizeOpenPayload(itemOrUrl, label);
            if (payload) {
                mediaViewerBus.emit('open', payload);
            }
        };

        app.config.globalProperties.$closeMediaViewer = () => {
            mediaViewerBus.emit('close');
        };
    },
};
