<template>
    <Teleport to="#app">
        <div
            v-if="open"
            class="property-share-modal"
            @click.self="close"
        >
            <div
                class="property-share-modal__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="property-share-modal-title"
                @click.stop
            >
                <div class="property-share-modal__header">
                    <h2 id="property-share-modal-title">Share listing</h2>
                    <button
                        type="button"
                        class="property-share-modal__close"
                        aria-label="Close"
                        @click="close"
                    >
                        <i class="ti ti-x" aria-hidden="true"></i>
                    </button>
                </div>

                <div class="property-share-modal__preview">
                    <img
                        class="property-share-modal__thumb"
                        :src="previewImage"
                        :alt="previewTitle"
                        width="120"
                        height="68"
                        @error="onImageError"
                    />
                    <div class="property-share-modal__preview-body">
                        <p class="property-share-modal__preview-title">{{ previewTitle }}</p>
                        <div class="property-share-modal__brand">
                            <img
                                class="property-share-modal__brand-logo"
                                :src="brandLogo"
                                alt=""
                                width="18"
                                height="18"
                            />
                            <span>Mr. Boss Realty</span>
                            <i class="ti ti-rosette-discount-check" aria-hidden="true"></i>
                        </div>
                    </div>
                </div>

                <div class="property-share-modal__targets" role="list">
                    <button
                        v-for="target in shareTargets"
                        :key="target.key"
                        type="button"
                        class="property-share-modal__target"
                        role="listitem"
                        @click="onTargetClick(target)"
                    >
                        <span
                            class="property-share-modal__target-icon"
                            :class="`property-share-modal__target-icon--${target.tone}`"
                        >
                            <i :class="target.icon" aria-hidden="true"></i>
                        </span>
                        <span class="property-share-modal__target-label">{{ target.label }}</span>
                    </button>
                </div>

                <p v-if="statusMessage" class="property-share-modal__status" role="status">
                    {{ statusMessage }}
                </p>
            </div>
        </div>
    </Teleport>
</template>

<script>
import {
    buildPropertyShareText,
    copyTextToClipboard,
    getPropertyShareTargets,
    openShareTarget,
    resolvePropertyDetailUrl,
} from '@/utils/propertyCardActions';
import { getWebsitePropertyDisplayName } from '@/utils/propertyDisplayName';
import { resolveMediaUrl } from '@/utils/mediaUrls';
import brandLogo from '@/assets/images/mr-boss-realty-logo.png';
import fallbackCoverImage from '@/assets/images/hero-bg-03-apartment-towers.jpg';

export default {
    name: 'PropertyShareModal',
    props: {
        open: {
            type: Boolean,
            default: false,
        },
        property: {
            type: Object,
            default: () => ({}),
        },
        url: {
            type: String,
            default: '',
        },
    },
    emits: ['close', 'copied'],
    data() {
        return {
            brandLogo,
            imageFailed: false,
            statusMessage: '',
            statusTimer: null,
        };
    },
    computed: {
        shareUrl() {
            if (this.url) return this.url;
            return resolvePropertyDetailUrl(this.$router, this.property.detailTo, this.property);
        },
        shareText() {
            return buildPropertyShareText(this.property, this.shareUrl);
        },
        shareTargets() {
            return getPropertyShareTargets(this.shareUrl, this.shareText, this.previewTitle);
        },
        previewTitle() {
            if (this.property.propertyName) {
                return this.property.title || getWebsitePropertyDisplayName(this.property);
            }

            return getWebsitePropertyDisplayName(this.property) || this.property.title || 'Property listing';
        },
        previewImage() {
            if (this.imageFailed) {
                return fallbackCoverImage;
            }

            return resolveMediaUrl(this.property.image) || fallbackCoverImage;
        },
    },
    watch: {
        open(isOpen) {
            if (isOpen) {
                this.imageFailed = false;
                this.clearStatus();
                document.addEventListener('keydown', this.onKeydown);
                return;
            }

            document.removeEventListener('keydown', this.onKeydown);
            this.clearStatus();
        },
        'property.image'() {
            this.imageFailed = false;
        },
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.onKeydown);
        this.clearStatusTimer();
    },
    methods: {
        close() {
            this.$emit('close');
        },
        onKeydown(event) {
            if (event.key === 'Escape') {
                this.close();
            }
        },
        onImageError() {
            this.imageFailed = true;
        },
        showStatus(message) {
            this.statusMessage = message;
            this.clearStatusTimer();
            this.statusTimer = window.setTimeout(() => {
                this.statusMessage = '';
                this.statusTimer = null;
            }, 2200);
        },
        clearStatus() {
            this.statusMessage = '';
            this.clearStatusTimer();
        },
        clearStatusTimer() {
            if (this.statusTimer) {
                window.clearTimeout(this.statusTimer);
                this.statusTimer = null;
            }
        },
        onTargetClick(target) {
            if (target.action === 'copy') {
                try {
                    copyTextToClipboard(this.shareUrl);
                    this.showStatus('Link copied.');
                    this.$emit('copied');
                } catch {
                    this.showStatus('Could not copy link. Try another option.');
                }
                return;
            }

            openShareTarget(target.href, {
                popup: Boolean(target.popup),
                windowName: target.windowName || 'propertyShare',
            });
        },
    },
};
</script>
