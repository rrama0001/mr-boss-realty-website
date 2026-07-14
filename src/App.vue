<template>
    <div id="app" @click.capture="onMediaClick">
        <router-view />
        <MediaViewer />
        <ConfirmDialog />
        <PropertyCompareModal />
        <!-- Chat last so it stacks above every modal/dialog in #app. -->
        <MrBossAiChatWidget />
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
    methods: {
        onMediaClick(event) {
            if (event.defaultPrevented) return;
            if (event.target.closest('.media-previews__item')) return;
            if (event.target.closest('.media-viewer')) return;
            if (event.target.closest('.site-header__brand, .site-footer__brand-block, .property-detail__logo-wrap')) {
                return;
            }

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
                const parentLink = event.target.closest('a[href]');
                if (parentLink && !createMediaItem(parentLink.getAttribute('href'), '')) {
                    return;
                }

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
