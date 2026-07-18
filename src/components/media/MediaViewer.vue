<template>
    <Teleport to="body">
        <div
            v-if="item"
            class="media-viewer"
            :class="{
                'media-viewer--image': isImageView,
                'media-viewer--embed': isEmbedView || isDirectVideo,
            }"
            role="dialog"
            aria-modal="true"
            :aria-label="item.label"
            @click.self="close"
        >
            <button
                type="button"
                class="media-viewer__close"
                aria-label="Close viewer"
                @click="close"
            >
                <i class="ti ti-x"></i>
            </button>

            <template v-if="hasGallery">
                <button
                    type="button"
                    class="media-viewer__nav media-viewer__nav--prev"
                    aria-label="Previous media"
                    title="Previous"
                    @click.stop="showPrev"
                >
                    <i class="ti ti-chevron-left" aria-hidden="true"></i>
                </button>
                <button
                    type="button"
                    class="media-viewer__nav media-viewer__nav--next"
                    aria-label="Next media"
                    title="Next"
                    @click.stop="showNext"
                >
                    <i class="ti ti-chevron-right" aria-hidden="true"></i>
                </button>
                <div class="media-viewer__counter" aria-live="polite">
                    {{ currentIndex + 1 }} / {{ items.length }}
                </div>
            </template>

            <div
                class="media-viewer__panel"
                :class="{
                    'media-viewer__panel--image': isImageView,
                    'media-viewer__panel--embed': isEmbedView || isDirectVideo,
                }"
            >
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

                    <div
                        ref="imageStage"
                        class="media-viewer__image-stage"
                        :class="{
                            'media-viewer__image-stage--pannable': canPan,
                            'media-viewer__image-stage--panning': isPanning,
                        }"
                        @wheel="onWheelZoom"
                        @pointerdown="onPanStart"
                    >
                        <div class="media-viewer__image-wrap">
                            <img
                                ref="image"
                                :key="item.url"
                                :src="item.url"
                                :alt="item.label"
                                class="media-viewer__image"
                                :class="{ 'media-viewer__image--animated': zoomAnimated }"
                                :style="imageZoomStyle"
                                draggable="false"
                                @load="onImageReady"
                                @transitionend="onZoomTransitionEnd"
                                @error="imageFailed = true"
                                @dragstart.prevent
                            />
                        </div>
                    </div>
                </template>

                <iframe
                    v-else-if="isEmbedView"
                    :key="`embed-${item.url}`"
                    :src="embedUrl"
                    class="media-viewer__frame"
                    :title="item.label"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                ></iframe>

                <video
                    v-else-if="isDirectVideo"
                    :key="`video-${item.url}`"
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
const WHEEL_ZOOM_SENSITIVITY = 0.0018;

export default {
    name: 'MediaViewer',
    data() {
        return {
            item: null,
            items: [],
            currentIndex: 0,
            imageFailed: false,
            zoomLevel: 1,
            minZoom: MIN_ZOOM,
            maxZoom: MAX_ZOOM,
            baseWidth: 0,
            baseHeight: 0,
            zoomAnimated: true,
            skipCenterOnZoom: false,
            wheelZoomIdleTimer: null,
            isPanning: false,
            panPointerId: null,
            panLastX: 0,
            panLastY: 0,
        };
    },
    computed: {
        hasGallery() {
            return this.items.length > 1;
        },
        isImageView() {
            return this.item?.type === 'image' && !this.imageFailed;
        },
        canPan() {
            return this.isImageView && this.zoomLevel > 1;
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
            if (this.zoomLevel <= 1) {
                this.stopPanning();
            }
            if (this.skipCenterOnZoom) return;
            this.centerImageView();
        },
    },
    mounted() {
        mediaViewerBus.on('open', this.openItem);
        mediaViewerBus.on('close', this.close);
        window.addEventListener('keydown', this.onKeydown);
        window.addEventListener('resize', this.onWindowResize);
        window.addEventListener('pointermove', this.onPanMove);
        window.addEventListener('pointerup', this.onPanEnd);
        window.addEventListener('pointercancel', this.onPanEnd);
    },
    beforeUnmount() {
        mediaViewerBus.off('open', this.openItem);
        mediaViewerBus.off('close', this.close);
        window.removeEventListener('keydown', this.onKeydown);
        window.removeEventListener('resize', this.onWindowResize);
        window.removeEventListener('pointermove', this.onPanMove);
        window.removeEventListener('pointerup', this.onPanEnd);
        window.removeEventListener('pointercancel', this.onPanEnd);
        window.clearTimeout(this.wheelZoomIdleTimer);
        this.stopPanning();
        document.body.classList.remove('media-viewer-open');
    },
    methods: {
        openItem(payload) {
            if (payload?.items && Array.isArray(payload.items) && payload.items.length) {
                this.items = payload.items;
                this.currentIndex = Math.min(
                    Math.max(0, Number(payload.index) || 0),
                    this.items.length - 1,
                );
                this.item = this.items[this.currentIndex];
                return;
            }

            // Backward-compatible: open a single media item.
            if (payload && payload.url) {
                this.items = [payload];
                this.currentIndex = 0;
                this.item = payload;
                return;
            }

            this.items = [];
            this.currentIndex = 0;
            this.item = null;
        },
        close() {
            this.stopPanning();
            this.item = null;
            this.items = [];
            this.currentIndex = 0;
        },
        showPrev() {
            if (!this.hasGallery) return;
            this.stopPanning();
            this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
            this.item = this.items[this.currentIndex];
        },
        showNext() {
            if (!this.hasGallery) return;
            this.stopPanning();
            this.currentIndex = (this.currentIndex + 1) % this.items.length;
            this.item = this.items[this.currentIndex];
        },
        resetViewState() {
            this.stopPanning();
            this.imageFailed = false;
            this.zoomLevel = 1;
            this.baseWidth = 0;
            this.baseHeight = 0;
            this.zoomAnimated = true;
            this.skipCenterOnZoom = false;
            window.clearTimeout(this.wheelZoomIdleTimer);
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
        onZoomTransitionEnd() {
            if (!this.skipCenterOnZoom) {
                this.centerImageView();
            }
        },
        clampZoom(value) {
            return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
        },
        zoomIn() {
            this.zoomAnimated = true;
            this.zoomLevel = this.clampZoom(this.roundZoom(this.zoomLevel + ZOOM_STEP));
        },
        zoomOut() {
            this.zoomAnimated = true;
            this.zoomLevel = this.clampZoom(this.roundZoom(this.zoomLevel - ZOOM_STEP));
        },
        resetZoom() {
            this.zoomAnimated = true;
            this.zoomLevel = 1;
        },
        roundZoom(value) {
            return Math.round(value / ZOOM_STEP) * ZOOM_STEP;
        },
        onWheelZoom(event) {
            if (!this.isImageView || !this.baseWidth) return;

            // Desktop mouse / trackpad only — leave touch scrolling alone.
            if (window.matchMedia('(pointer: coarse)').matches && !event.ctrlKey) {
                return;
            }

            event.preventDefault();

            const stage = this.$refs.imageStage;
            if (!stage) return;

            let delta = event.deltaY;
            if (event.deltaMode === 1) delta *= 16;
            if (event.deltaMode === 2) delta *= stage.clientHeight;

            const oldZoom = this.zoomLevel;
            const nextZoom = this.clampZoom(oldZoom * Math.exp(-delta * WHEEL_ZOOM_SENSITIVITY));
            if (Math.abs(nextZoom - oldZoom) < 0.0005) return;

            const rect = stage.getBoundingClientRect();
            const cursorX = event.clientX - rect.left;
            const cursorY = event.clientY - rect.top;
            const contentX = (stage.scrollLeft + cursorX) / oldZoom;
            const contentY = (stage.scrollTop + cursorY) / oldZoom;

            this.zoomAnimated = false;
            this.skipCenterOnZoom = true;
            this.zoomLevel = nextZoom;

            this.$nextTick(() => {
                requestAnimationFrame(() => {
                    stage.scrollLeft = contentX * nextZoom - cursorX;
                    stage.scrollTop = contentY * nextZoom - cursorY;
                });
            });

            window.clearTimeout(this.wheelZoomIdleTimer);
            this.wheelZoomIdleTimer = window.setTimeout(() => {
                this.zoomAnimated = true;
                this.skipCenterOnZoom = false;
            }, 140);
        },
        onPanStart(event) {
            if (!this.canPan || event.button !== 0) return;
            if (event.target.closest('button, a')) return;

            const stage = this.$refs.imageStage;
            if (!stage) return;

            event.preventDefault();
            this.isPanning = true;
            this.panPointerId = event.pointerId;
            this.panLastX = event.clientX;
            this.panLastY = event.clientY;

            try {
                stage.setPointerCapture(event.pointerId);
            } catch {
                // Ignore browsers that reject capture on this element.
            }
        },
        onPanMove(event) {
            if (!this.isPanning || event.pointerId !== this.panPointerId) return;

            const stage = this.$refs.imageStage;
            if (!stage) return;

            const dx = event.clientX - this.panLastX;
            const dy = event.clientY - this.panLastY;
            this.panLastX = event.clientX;
            this.panLastY = event.clientY;

            stage.scrollLeft -= dx;
            stage.scrollTop -= dy;
        },
        onPanEnd(event) {
            if (!this.isPanning) return;
            if (event?.pointerId != null && event.pointerId !== this.panPointerId) return;
            this.stopPanning();
        },
        stopPanning() {
            const stage = this.$refs.imageStage;
            if (stage && this.panPointerId != null) {
                try {
                    stage.releasePointerCapture(this.panPointerId);
                } catch {
                    // Pointer may already be released.
                }
            }

            this.isPanning = false;
            this.panPointerId = null;
            this.panLastX = 0;
            this.panLastY = 0;
        },
        onKeydown(event) {
            if (!this.item) return;

            if (event.key === 'Escape') {
                this.close();
                return;
            }

            if (this.hasGallery && event.key === 'ArrowLeft') {
                event.preventDefault();
                this.showPrev();
                return;
            }

            if (this.hasGallery && event.key === 'ArrowRight') {
                event.preventDefault();
                this.showNext();
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
