<template>
    <div v-if="items.length" class="media-previews">
        <button
            v-for="(item, index) in items"
            :key="`${item.url}-${index}`"
            type="button"
            class="media-previews__item"
            :class="[
                `media-previews__item--${item.type}`,
                { 'media-previews__item--fallback': !item.thumbnail || brokenThumbs.has(item.url) },
            ]"
            :aria-label="`View ${item.label}`"
            @click="openViewer(item)"
        >
            <img
                v-if="item.thumbnail && !brokenThumbs.has(item.url)"
                :src="item.thumbnail"
                :alt="item.label"
                class="media-previews__thumb"
                loading="lazy"
                @error="markBroken(item.url)"
            />
            <span v-else class="media-previews__fallback" aria-hidden="true">
                <i :class="previewIconClass(item.type)"></i>
            </span>
            <span v-if="item.type === 'video'" class="media-previews__play" aria-hidden="true">
                <i class="ti ti-player-play" aria-hidden="true"></i>
            </span>
        </button>
    </div>
</template>

<script>
import { extractMediaPreviews, getPreviewIconClass } from '@/utils/mediaUrls';

export default {
    name: 'ChatMediaPreviews',
    props: {
        content: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            brokenThumbs: new Set(),
        };
    },
    computed: {
        items() {
            return extractMediaPreviews(this.content);
        },
    },
    methods: {
        previewIconClass(type) {
            return getPreviewIconClass(type);
        },
        markBroken(url) {
            this.brokenThumbs.add(url);
            this.brokenThumbs = new Set(this.brokenThumbs);
        },
        openViewer(item) {
            this.$openMediaViewer(item);
        },
    },
};
</script>
