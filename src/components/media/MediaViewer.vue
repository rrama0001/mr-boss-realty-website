<template>
    <Teleport to="body">
        <div
            v-if="item"
            class="media-viewer"
            :class="{
                'media-viewer--image': isImageView,
                'media-viewer--embed': isEmbedView,
            }"
            role="dialog"
            aria-modal="true"
            :aria-label="item.label"
            @click.self="close"
        >
            <div
                class="media-viewer__panel"
                :class="{
                    'media-viewer__panel--image': isImageView,
                    'media-viewer__panel--embed': isEmbedView,
                }"
            >
                <button
                    type="button"
                    class="media-viewer__close"
                    aria-label="Close viewer"
                    @click="close"
                >
                    <i class="ti ti-x"></i>
                </button>

                <template v-if="isImageView">
                    <div class="media-viewer__toolbar">
                        <button
                            type="button"
                            class="media-viewer__toolbar-btn"
                            aria-label="Zoom out"
                            title="Zoom out"
                            :disabled="zoomLevel <= minZoom"
                            @click="zoomOut"
                        >
                            <i class="ti ti-zoom-out"></i>
                        </button>
                        <span class="media-viewer__zoom-label">{{ zoomPercent }}%</span>
                        <button
                            type="button"
                            class="media-viewer__toolbar-btn"
                            aria-label="Zoom in"
                            title="Zoom in"
                            :disabled="zoomLevel >= maxZoom"
                            @click="zoomIn"
                        >
                            <i class="ti ti-zoom-in"></i>
                        </button>
                        <button
                            type="button"
                            class="media-viewer__toolbar-btn"
                            aria-label="Reset zoom"
                            title="Reset zoom"
                            :disabled="zoomLevel === 1"
                            @click="resetZoom"
                        >
                            <i class="ti ti-zoom-reset"></i>
                        </button>
                    </div>

                    <div ref="imageStage" class="media-viewer__image-stage">
                        <div class="media-viewer__image-wrap">
                            <img
                                ref="image"
                                :src="item.url"
                                :alt="item.label"
                                class="media-viewer__image"
                                :style="imageZoomStyle"
                                @load="onImageReady"
                                @transitionend="centerImageView"
                                @error="imageFailed = true"
                            />
                        </div>
                    </div>
                </template>

                <iframe
                    v-else-if="isEmbedView"
                    :src="embedUrl"
                    class="media-viewer__frame"
                    :title="item.label"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                ></iframe>

                <video
                    v-else-if="isDirectVideo"
                    :src="item.url"
                    class="media-viewer__video"
                    controls
                    playsinline
                ></video>

                <div v-else class="media-viewer__fallback">
                    <span class="media-viewer__fallback-icon" aria-hidden="true">
                        <i :class="fallbackIconClass"></i>
                    </span>
                    <p class="media-viewer__fallback-title">{{ item.label }}</p>
                    <p v-if="imageFailed" class="media-viewer__fallback-note">Could not load this preview.</p>
                    <div class="media-viewer__fallback-actions">
                        <a
                            :href="item.url"
                            class="btn btn-primary btn-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open file
                        </a>
                        <a
                            :href="item.url"
                            class="btn btn-outline-light btn-sm"
                            download
                        >
                            Download
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script>
import { mediaViewerBus } from '@/plugins/mediaViewer';
import {
    getOfficeEmbedUrl,
    getPreviewIconClass,
    getVideoEmbedUrl,
} from '@/utils/mediaUrls';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

export default {
    name: 'MediaViewer',
    data() {
        return {
            item: null,
            imageFailed: false,
            zoomLevel: 1,
            minZoom: MIN_ZOOM,
            maxZoom: MAX_ZOOM,
            baseWidth: 0,
            baseHeight: 0,
        };
    },
    computed: {
        isImageView() {
            return this.item?.type === 'image' && !this.imageFailed;
        },
        isDirectVideo() {
            return this.item?.type === 'video' && !getVideoEmbedUrl(this.item.url);
        },
        isEmbedView() {
            return Boolean(this.embedUrl) && !this.isImageView && !this.isDirectVideo;
        },
        embedUrl() {
            if (!this.item) return null;

            if (this.item.type === 'video') {
                return getVideoEmbedUrl(this.item.url);
            }

            if (this.item.type === 'pdf') {
                return this.item.url;
            }

            if (this.item.type === 'document') {
                return this.item.embedUrl || getOfficeEmbedUrl(this.item.url);
            }

            return null;
        },
        fallbackIconClass() {
            return getPreviewIconClass(this.item?.type);
        },
        zoomPercent() {
            return Math.round(this.zoomLevel * 100);
        },
        imageZoomStyle() {
            if (!this.baseWidth || !this.baseHeight) {
                return {
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                    width: 'auto',
                    height: 'auto',
                };
            }

            return {
                width: `${this.baseWidth * this.zoomLevel}px`,
                height: `${this.baseHeight * this.zoomLevel}px`,
                maxWidth: 'none',
            };
        },
    },
    watch: {
        item(nextItem) {
            this.resetViewState();
            if (nextItem) {
                document.body.classList.add('media-viewer-open');
                this.$nextTick(() => this.measureImageDisplay());
            } else {
                document.body.classList.remove('media-viewer-open');
            }
        },
        zoomLevel() {
            this.centerImageView();
        },
    },
    mounted() {
        mediaViewerBus.on('open', this.openItem);
        mediaViewerBus.on('close', this.close);
        window.addEventListener('keydown', this.onKeydown);
        window.addEventListener('resize', this.onWindowResize);
    },
    beforeUnmount() {
        mediaViewerBus.off('open', this.openItem);
        mediaViewerBus.off('close', this.close);
        window.removeEventListener('keydown', this.onKeydown);
        window.removeEventListener('resize', this.onWindowResize);
        document.body.classList.remove('media-viewer-open');
    },
    methods: {
        openItem(item) {
            this.item = item;
        },
        close() {
            this.item = null;
        },
        resetViewState() {
            this.imageFailed = false;
            this.zoomLevel = 1;
            this.baseWidth = 0;
            this.baseHeight = 0;
        },
        measureImageDisplay() {
            const img = this.$refs.image;
            if (!img?.naturalWidth || !img?.naturalHeight) return;

            const maxWidth = window.innerWidth;
            const maxHeight = window.innerHeight;
            const aspect = img.naturalWidth / img.naturalHeight;

            let width = maxWidth;
            let height = width / aspect;

            if (height > maxHeight) {
                height = maxHeight;
                width = height * aspect;
            }

            this.baseWidth = width;
            this.baseHeight = height;
            this.centerImageView();
        },
        onImageReady() {
            this.measureImageDisplay();
        },
        onWindowResize() {
            if (!this.isImageView) return;
            this.measureImageDisplay();
        },
        centerImageView() {
            this.$nextTick(() => {
                requestAnimationFrame(() => {
                    const stage = this.$refs.imageStage;
                    if (!stage) return;

                    stage.scrollLeft = Math.max(0, (stage.scrollWidth - stage.clientWidth) / 2);
                    stage.scrollTop = Math.max(0, (stage.scrollHeight - stage.clientHeight) / 2);
                });
            });
        },
        zoomIn() {
            this.zoomLevel = Math.min(MAX_ZOOM, this.roundZoom(this.zoomLevel + ZOOM_STEP));
        },
        zoomOut() {
            this.zoomLevel = Math.max(MIN_ZOOM, this.roundZoom(this.zoomLevel - ZOOM_STEP));
        },
        resetZoom() {
            this.zoomLevel = 1;
        },
        roundZoom(value) {
            return Math.round(value / ZOOM_STEP) * ZOOM_STEP;
        },
        onKeydown(event) {
            if (!this.item) return;

            if (event.key === 'Escape') {
                this.close();
                return;
            }

            if (!this.isImageView) return;

            if (event.key === '+' || event.key === '=') {
                event.preventDefault();
                this.zoomIn();
            } else if (event.key === '-') {
                event.preventDefault();
                this.zoomOut();
            } else if (event.key === '0') {
                event.preventDefault();
                this.resetZoom();
            }
        },
    },
};
</script>
