<template>
    <div id="app" @click.capture="onMediaClick">
        <router-view />
        <MediaViewer />
        <ConfirmDialog />
        <PropertyCompareModal />
        <!-- Chat last so it stacks above every modal/dialog in #app. -->
        <MrBossAiChatWidget v-if="showAiChat" />
    </div>
</template>

<script>
import MediaViewer from '@/components/media/MediaViewer.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import PropertyCompareModal from '@/components/property/PropertyCompareModal.vue';
import MrBossAiChatWidget from '@/components/chat/MrBossAiChatWidget.vue';
import { createMediaItem } from '@/utils/mediaUrls';

export default {
    name: 'App',
    components: {
        MediaViewer,
        ConfirmDialog,
        PropertyCompareModal,
        MrBossAiChatWidget,
    },
    computed: {
        showAiChat() {
            return !this.$route.meta?.hideAiChat;
        },
    },
    methods: {
        onMediaClick(event) {
            if (event.defaultPrevented) return;
            if (event.target.closest('.media-viewer')) return;

            // Unit/building galleries and chat previews open the viewer themselves.
            if (event.target.closest('.unit-detail__gallery-thumb, .media-previews__item')) {
                return;
            }

            // Only listing card media should use this global click handler.
            const listingMedia = event.target.closest(
                '.property-card__media, .featured-property-card__media',
            );
            if (!listingMedia) return;

            const link = event.target.closest('a[href]');
            if (link && event.target.tagName !== 'IMG') {
                const href = link.getAttribute('href');
                const item = createMediaItem(href, (link.textContent || '').trim());
                if (item) {
                    event.preventDefault();
                    this.$openMediaViewer(item);
                }
                return;
            }

            if (event.target.tagName === 'IMG') {
                const src = event.target.currentSrc || event.target.src;
                const item = createMediaItem(src, event.target.alt || 'Image');
                if (item?.type === 'image') {
                    event.preventDefault();
                    this.$openMediaViewer(item);
                }
            }
        },
    },
};
</script>
