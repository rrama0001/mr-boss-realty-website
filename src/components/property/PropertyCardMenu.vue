<template>
    <div ref="root" class="property-card-menu">
        <button
            ref="trigger"
            type="button"
            class="property-card-menu__trigger"
            :aria-expanded="open ? 'true' : 'false'"
            aria-haspopup="menu"
            aria-label="Listing actions"
            @click.stop="toggleMenu"
        >
            <i class="ti ti-menu-2" aria-hidden="true"></i>
        </button>

        <Teleport to="#app">
            <div
                v-if="open"
                ref="panel"
                class="property-card-menu__panel"
                :class="{ 'property-card-menu__panel--above': panelPlacement === 'above' }"
                role="menu"
                :style="panelStyle"
                @click.stop
            >
                <button
                    type="button"
                    class="property-card-menu__item"
                    role="menuitem"
                    :disabled="!canCopyReference"
                    @click="copyReferenceId"
                >
                    <i class="ti ti-copy" aria-hidden="true"></i>
                    <span>Copy reference ID</span>
                </button>
                <button
                    type="button"
                    class="property-card-menu__item"
                    role="menuitem"
                    @click="shareListing"
                >
                    <i class="ti ti-share" aria-hidden="true"></i>
                    <span>Share</span>
                </button>
                <button
                    v-if="showClearSelection"
                    type="button"
                    class="property-card-menu__item"
                    role="menuitem"
                    @click="clearSelection"
                >
                    <i class="ti ti-x" aria-hidden="true"></i>
                    <span>Clear selection</span>
                </button>
                <button
                    type="button"
                    class="property-card-menu__item"
                    role="menuitem"
                    :disabled="isCompareDisabled"
                    @click="compareListing"
                >
                    <i class="ti ti-columns" aria-hidden="true"></i>
                    <span>{{ compareMenuLabel }}</span>
                </button>
                <button
                    type="button"
                    class="property-card-menu__item"
                    role="menuitem"
                    :disabled="isCompareSimilarDisabled"
                    @click="compareSimilarListing"
                >
                    <i class="ti ti-arrows-diff" aria-hidden="true"></i>
                    <span>Compare similar</span>
                </button>
            </div>
        </Teleport>

        <PropertyShareModal
            :open="shareSheetOpen"
            :property="property"
            :url="shareUrl"
            @close="closeShareSheet"
            @copied="onShareCopied"
        />

        <p v-if="feedback" class="property-card-menu__feedback" role="status">{{ feedback }}</p>
    </div>
</template>

<script>
import {
    copyTextToClipboard,
    getPropertyReferenceId,
    resolvePropertyDetailUrl,
} from '@/utils/propertyCardActions';
import { canCompareListing, canCompareSimilar, resolveCompareSimilarProperty } from '@/utils/fetchListingForCompare';
import {
    clearCompareAnchor,
    compareBus,
    COMPARE_EVENTS,
    getCompareAnchor,
    isSameListing,
    openPropertyCompare,
    openSimilarPropertyCompare,
    setCompareAnchor,
} from '@/utils/propertyCompare';
import PropertyShareModal from '@/components/property/PropertyShareModal.vue';

export default {
    name: 'PropertyCardMenu',
    components: {
        PropertyShareModal,
    },
    props: {
        property: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            open: false,
            panelStyle: null,
            panelPlacement: 'below',
            feedback: '',
            feedbackTimer: null,
            anchorVersion: 0,
            shareSheetOpen: false,
            shareUrl: '',
        };
    },
    computed: {
        referenceId() {
            return getPropertyReferenceId(this.property);
        },
        canCopyReference() {
            return Boolean(this.referenceId);
        },
        compareAnchor() {
            this.anchorVersion;
            return getCompareAnchor();
        },
        isSelectedForCompare() {
            if (!this.compareAnchor?.property) return false;
            return isSameListing(this.compareAnchor.property, this.property);
        },
        compareMenuLabel() {
            if (!this.compareAnchor?.property) {
                return 'Compare';
            }

            if (this.isSelectedForCompare) {
                return 'Selected for compare';
            }

            return 'Compare with selected';
        },
        isCompareDisabled() {
            if (!canCompareListing(this.property)) return true;
            return this.isSelectedForCompare;
        },
        isCompareSimilarDisabled() {
            return !canCompareSimilar(this.property);
        },
        showClearSelection() {
            return this.isSelectedForCompare;
        },
    },
    mounted() {
        this.onAnchorChanged = () => {
            this.anchorVersion += 1;
        };
        compareBus.on(COMPARE_EVENTS.anchorChanged, this.onAnchorChanged);
    },
    beforeUnmount() {
        compareBus.off(COMPARE_EVENTS.anchorChanged, this.onAnchorChanged);
        this.closeMenu();
        this.closeShareSheet();
        this.clearFeedbackTimer();
    },
    methods: {
        updatePanelPosition() {
            const trigger = this.$refs.trigger;
            if (!trigger) {
                return;
            }

            const viewportPadding = 8;
            const gap = 6;
            const rect = trigger.getBoundingClientRect();
            const panel = this.$refs.panel;
            const panelHeight = panel?.offsetHeight || 0;
            const estimatedHeight = panelHeight || 232;

            const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding;
            const spaceAbove = rect.top - gap - viewportPadding;
            const fitsBelow = estimatedHeight <= spaceBelow;
            const fitsAbove = estimatedHeight <= spaceAbove;

            let placement = 'below';
            if (!fitsBelow && fitsAbove) {
                placement = 'above';
            } else if (!fitsBelow && !fitsAbove) {
                placement = spaceAbove > spaceBelow ? 'above' : 'below';
            }

            let top;
            let transform;

            if (placement === 'above') {
                top = rect.top - gap;
                transform = 'translate(-100%, -100%)';
            } else {
                top = rect.bottom + gap;
                transform = 'translateX(-100%)';
            }

            if (panelHeight) {
                if (placement === 'below') {
                    const overflow = (top + panelHeight) - (window.innerHeight - viewportPadding);
                    if (overflow > 0) {
                        top -= overflow;
                    }
                } else {
                    const overflow = viewportPadding - (top - panelHeight);
                    if (overflow > 0) {
                        top += overflow;
                    }
                }
            }

            this.panelPlacement = placement;
            this.panelStyle = {
                position: 'fixed',
                top: `${Math.round(top)}px`,
                left: `${Math.round(rect.right)}px`,
                transform,
                // Below chat (1300), header (1030), modals — above raised cards (20)
                zIndex: '40',
            };
        },
        toggleMenu() {
            if (this.open) {
                this.closeMenu();
                return;
            }

            this.open = true;
            this.$nextTick(() => {
                requestAnimationFrame(() => {
                    this.updatePanelPosition();
                    requestAnimationFrame(() => {
                        this.updatePanelPosition();
                    });
                });
                this.addOutsideListener();
            });
        },
        closeMenu() {
            this.open = false;
            this.panelStyle = null;
            this.panelPlacement = 'below';
            this.removeOutsideListener();
        },
        addOutsideListener() {
            document.addEventListener('click', this.handleOutsideClick);
            document.addEventListener('keydown', this.handleEscape);
            window.addEventListener('scroll', this.handleReposition, true);
            window.addEventListener('resize', this.handleReposition);
        },
        removeOutsideListener() {
            document.removeEventListener('click', this.handleOutsideClick);
            document.removeEventListener('keydown', this.handleEscape);
            window.removeEventListener('scroll', this.handleReposition, true);
            window.removeEventListener('resize', this.handleReposition);
        },
        handleReposition() {
            if (!this.open) {
                return;
            }

            this.updatePanelPosition();
        },
        handleOutsideClick(event) {
            const panel = this.$refs.panel;
            if (!this.$refs.root?.contains(event.target) && !panel?.contains(event.target)) {
                this.closeMenu();
            }
        },
        handleEscape(event) {
            if (event.key === 'Escape') {
                this.closeMenu();
            }
        },
        showFeedback(message) {
            this.feedback = message;
            this.clearFeedbackTimer();
            this.feedbackTimer = window.setTimeout(() => {
                this.feedback = '';
                this.feedbackTimer = null;
            }, 2200);
        },
        clearFeedbackTimer() {
            if (this.feedbackTimer) {
                window.clearTimeout(this.feedbackTimer);
                this.feedbackTimer = null;
            }
        },
        copyReferenceId() {
            this.closeMenu();

            if (!this.canCopyReference) {
                this.showFeedback('No reference ID available.');
                return;
            }

            try {
                copyTextToClipboard(this.referenceId);
                this.showFeedback('Reference ID copied.');
            } catch {
                this.showFeedback('Could not copy reference ID.');
            }
        },
        shareListing() {
            const url = resolvePropertyDetailUrl(
                this.$router,
                this.property.detailTo,
                this.property,
            );
            this.closeMenu();
            this.shareUrl = url;
            this.shareSheetOpen = true;
        },
        closeShareSheet() {
            this.shareSheetOpen = false;
            this.shareUrl = '';
        },
        onShareCopied() {
            this.showFeedback('Link copied.');
        },
        compareListing() {
            this.closeMenu();

            if (this.isCompareDisabled) {
                return;
            }

            if (!canCompareListing(this.property)) {
                this.showFeedback('This listing cannot be compared yet.');
                return;
            }

            if (!this.compareAnchor?.property) {
                try {
                    setCompareAnchor(this.property);
                    this.showFeedback('Listing selected. Choose another to compare.');
                } catch {
                    this.showFeedback('Could not select this listing.');
                }
                return;
            }

            openPropertyCompare(this.compareAnchor.property, this.property);
            clearCompareAnchor();
        },
        async compareSimilarListing() {
            this.closeMenu();

            if (this.isCompareSimilarDisabled) {
                return;
            }

            try {
                const property = await resolveCompareSimilarProperty(this.$api, this.property);
                openSimilarPropertyCompare(property);
            } catch {
                this.showFeedback('Could not start compare similar.');
            }
        },
        clearSelection() {
            this.closeMenu();
            clearCompareAnchor();
            this.showFeedback('Selection cleared.');
        },
    },
};
</script>
