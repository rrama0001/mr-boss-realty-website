import mitt from 'mitt';
import MediaViewer from '@/components/media/MediaViewer.vue';
import { createMediaItem } from '@/utils/mediaUrls';

export const mediaViewerBus = mitt();

export default {
    install(app) {
        app.component('MediaViewer', MediaViewer);

        app.config.globalProperties.$openMediaViewer = (itemOrUrl, label) => {
            const item =
                typeof itemOrUrl === 'string' ? createMediaItem(itemOrUrl, label || '') : itemOrUrl;
            if (item) {
                mediaViewerBus.emit('open', item);
            }
        };

        app.config.globalProperties.$closeMediaViewer = () => {
            mediaViewerBus.emit('close');
        };
    },
};
