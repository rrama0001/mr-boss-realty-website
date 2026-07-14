<template>
    <Teleport to="body">
        <div
            v-if="open"
            class="listing-compare-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="listing-compare-modal-title"
            @click.self="close"
        >
            <div
                ref="panel"
                class="listing-compare-modal__panel"
                @click.capture="onPanelLinkClick"
            >
                <button
                    type="button"
                    class="media-viewer__close listing-compare-modal__close"
                    aria-label="Close compare listings"
                    @click="close"
                >
                    <i class="ti ti-x" aria-hidden="true"></i>
                </button>

                <header class="listing-compare-modal__header">
                    <h2 id="listing-compare-modal-title" class="listing-compare-modal__title">
                        Compare listings
                    </h2>
                    <div
                        v-if="isSimilarMode"
                        class="listing-compare-modal__filters"
                        role="tablist"
                        aria-label="Similar listing filters"
                    >
                        <button
                            v-for="filter in similarFilters"
                            :key="filter.id"
                            type="button"
                            role="tab"
                            class="listing-compare-modal__filter"
                            :class="{ 'is-active': similarCriterion === filter.id }"
                            :aria-selected="similarCriterion === filter.id ? 'true' : 'false'"
                            :disabled="anchorState.loading"
                            @click="setSimilarCriterion(filter.id)"
                        >
                            {{ filter.label }}
                        </button>
                        <div
                            v-if="showSimilarNavigation"
                            class="listing-compare-modal__similar-nav"
                            aria-label="Browse similar listings"
                        >
                            <button
                                type="button"
                                class="listing-compare-modal__similar-nav-btn"
                                aria-label="Show previous similar listing"
                                :disabled="!canShowPreviousSimilar || currentState.loading"
                                @click="showPreviousSimilar"
                            >
                                <i class="ti ti-chevron-left" aria-hidden="true"></i>
                            </button>
                            <span class="listing-compare-modal__similar-nav-position">
                                {{ similarPositionLabel }}
                            </span>
                            <button
                                type="button"
                                class="listing-compare-modal__similar-nav-btn"
                                aria-label="Show next similar listing"
                                :disabled="!canShowNextSimilar || currentState.loading"
                                @click="showNextSimilar"
                            >
                                <i class="ti ti-chevron-right" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                </header>

                <div class="listing-compare-modal__body">
                    <div class="listing-compare-modal__grid">
                        <ListingComparePanel
                            :kind="anchorState.kind"
                            :listing="anchorState.listing"
                            :loading="anchorState.loading"
                            :error="anchorState.error"
                            :highlighted-spec-key="highlightedSpecKey"
                            allow-spec-highlight
                            @spec-highlight="onSpecHighlight"
                        />
                        <ListingComparePanel
                            :kind="currentState.kind"
                            :listing="currentState.listing"
                            :loading="currentState.loading"
                            :error="currentState.error"
                            :highlighted-spec-key="highlightedSpecKey"
                        />
                    </div>
                </div>

                <footer class="listing-compare-modal__footer">
                    <button type="button" class="btn btn-primary" @click="close">
                        Close
                    </button>
                </footer>
            </div>
        </div>
    </Teleport>
</template>

<script>
import ListingComparePanel from '@/components/property/ListingComparePanel.vue';
import { fetchPropertyListingDetail } from '@/utils/fetchListingForCompare';
import { mapPublicUnitToPropertyCard } from '@/utils/mapUnitToProperty';
import {
    compareBus,
    COMPARE_EVENTS,
    COMPARE_MODES,
    SIMILAR_COMPARE_CRITERIA,
} from '@/utils/propertyCompare';
import { findSimilarUnitsByCriterion, resolveDefaultSimilarCriterion } from '@/utils/suggestUnits';

const SIMILAR_FILTER_OPTIONS = [
    { id: SIMILAR_COMPARE_CRITERIA.type, label: 'Similar type' },
    { id: SIMILAR_COMPARE_CRITERIA.price, label: 'Similar price' },
    { id: SIMILAR_COMPARE_CRITERIA.size, label: 'Similar size' },
];

function createSimilarMatchIndexes() {
    return {
        [SIMILAR_COMPARE_CRITERIA.type]: 0,
        [SIMILAR_COMPARE_CRITERIA.price]: 0,
        [SIMILAR_COMPARE_CRITERIA.size]: 0,
    };
}

function createListingState() {
    return {
        kind: '',
        listing: null,
        loading: false,
        error: '',
    };
}

export default {
    name: 'PropertyCompareModal',
    components: { ListingComparePanel },
    data() {
        return {
            open: false,
            mode: COMPARE_MODES.manual,
            similarCriterion: '',
            allListings: [],
            similarMatchesCache: {},
            similarMatchIndexes: createSimilarMatchIndexes(),
            anchorProperty: null,
            currentProperty: null,
            anchorState: createListingState(),
            currentState: createListingState(),
            loadToken: 0,
            highlightedSpecKey: '',
        };
    },
    computed: {
        isSimilarMode() {
            return this.mode === COMPARE_MODES.similar;
        },
        similarFilters() {
            return SIMILAR_FILTER_OPTIONS;
        },
        currentSimilarMatches() {
            if (!this.isSimilarMode || !this.anchorState.listing) {
                return [];
            }

            return this.getSimilarMatchesForCriterion(this.similarCriterion);
        },
        showSimilarNavigation() {
            if (!this.isSimilarMode || this.currentState.error || !this.currentState.listing) {
                return false;
            }

            return this.currentSimilarMatches.length > 1;
        },
        canShowPreviousSimilar() {
            return (this.similarMatchIndexes[this.similarCriterion] ?? 0) > 0;
        },
        canShowNextSimilar() {
            const index = this.similarMatchIndexes[this.similarCriterion] ?? 0;
            return index < this.currentSimilarMatches.length - 1;
        },
        similarPositionLabel() {
            const total = this.currentSimilarMatches.length;
            if (total <= 1) {
                return '';
            }

            const index = (this.similarMatchIndexes[this.similarCriterion] ?? 0) + 1;
            return `${index} of ${total}`;
        },
    },
    mounted() {
        compareBus.on(COMPARE_EVENTS.open, this.onOpenRequest);
        document.addEventListener('keydown', this.handleEscape);
    },
    beforeUnmount() {
        compareBus.off(COMPARE_EVENTS.open, this.onOpenRequest);
        document.removeEventListener('keydown', this.handleEscape);
        this.unlockBodyScroll();
    },
    methods: {
        onOpenRequest({ mode = COMPARE_MODES.manual, anchor, current = null }) {
            this.mode = mode;
            this.similarCriterion = '';
            this.allListings = [];
            this.similarMatchesCache = {};
            this.similarMatchIndexes = createSimilarMatchIndexes();
            this.highlightedSpecKey = '';
            this.anchorProperty = anchor;
            this.currentProperty = current;
            this.open = true;
            this.lockBodyScroll();

            if (this.isSimilarMode) {
                this.loadSimilarListings();
                return;
            }

            this.loadListings();
        },
        handleEscape(event) {
            if (event.key === 'Escape' && this.open) {
                this.close();
            }
        },
        async onPanelLinkClick(event) {
            const link = event.target.closest('a[href]');
            if (!link || !this.$refs.panel?.contains(link)) {
                return;
            }

            const href = String(link.getAttribute('href') || '').trim();
            if (!href || href.startsWith('#')) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const isExternal = link.target === '_blank' || /^https?:\/\//i.test(href);
            const confirmed = await this.$confirm({
                title: 'Leave compare listings?',
                message: 'You are about to leave this comparison. Do you want to continue?',
            });

            if (!confirmed) {
                return;
            }

            this.close();

            if (isExternal) {
                const target = link.getAttribute('target') || '_self';
                if (target === '_blank') {
                    window.open(href, '_blank', 'noopener');
                } else {
                    window.location.assign(href);
                }
                return;
            }

            this.$router.push(href).catch(() => {});
        },
        async loadListings() {
            const token = ++this.loadToken;

            this.anchorState = {
                ...createListingState(),
                loading: true,
            };
            this.currentState = {
                ...createListingState(),
                loading: true,
            };

            await Promise.all([
                this.loadListingColumn('anchorState', this.anchorProperty, token),
                this.loadListingColumn('currentState', this.currentProperty, token),
            ]);
        },
        async loadSimilarListings() {
            const token = ++this.loadToken;

            this.anchorState = {
                ...createListingState(),
                loading: true,
            };
            this.currentState = {
                ...createListingState(),
                loading: true,
            };

            try {
                const anchorResult = await fetchPropertyListingDetail(this.$api, this.anchorProperty);
                if (token !== this.loadToken) return;

                if (anchorResult.kind === 'building') {
                    this.anchorState = {
                        kind: anchorResult.kind,
                        listing: anchorResult.data,
                        loading: false,
                        error: '',
                    };
                    this.currentState = {
                        ...createListingState(),
                        error: 'Compare similar is only available for unit listings.',
                    };
                    return;
                }

                this.anchorState = {
                    kind: anchorResult.kind,
                    listing: anchorResult.data,
                    loading: false,
                    error: '',
                };

                const { data } = await this.$api.get('/units/public/list', {
                    params: { limit: 'all' },
                });
                if (token !== this.loadToken) return;

                this.allListings = Array.isArray(data) ? data : [];

                this.similarCriterion = resolveDefaultSimilarCriterion(
                    this.allListings,
                    this.anchorState.listing,
                );
                this.similarMatchIndexes = createSimilarMatchIndexes();

                await this.loadSimilarMatch(token);
            } catch {
                if (token !== this.loadToken) return;

                this.anchorState = {
                    ...createListingState(),
                    error: 'Could not load this listing right now.',
                };
                this.currentState = createListingState();
            }
        },
        getSimilarMatchesForCriterion(criterion) {
            if (!this.anchorState.listing) {
                return [];
            }

            if (!this.similarMatchesCache[criterion]) {
                this.similarMatchesCache[criterion] = findSimilarUnitsByCriterion(
                    this.allListings,
                    this.anchorState.listing,
                    criterion,
                );
            }

            return this.similarMatchesCache[criterion];
        },
        async loadSimilarMatch(token) {
            this.currentState = {
                ...createListingState(),
                loading: true,
            };

            const matches = this.getSimilarMatchesForCriterion(this.similarCriterion);

            if (!matches.length) {
                if (token !== this.loadToken) return;

                this.currentState = {
                    ...createListingState(),
                    error: this.getSimilarEmptyMessage(),
                };
                return;
            }

            let index = this.similarMatchIndexes[this.similarCriterion] ?? 0;
            if (index >= matches.length) {
                index = matches.length - 1;
                this.similarMatchIndexes[this.similarCriterion] = index;
            }

            const similar = matches[index];
            const propertyCard = mapPublicUnitToPropertyCard(similar);
            await this.loadListingColumn('currentState', propertyCard, token);
        },
        getSimilarEmptyMessage() {
            if (this.similarCriterion === SIMILAR_COMPARE_CRITERIA.price) {
                return 'No similar price listing found.';
            }

            if (this.similarCriterion === SIMILAR_COMPARE_CRITERIA.size) {
                return 'No similar size listing found.';
            }

            return 'No similar type listing found.';
        },
        async setSimilarCriterion(criterion) {
            if (!this.isSimilarMode || criterion === this.similarCriterion) {
                return;
            }

            this.similarCriterion = criterion;
            this.highlightedSpecKey = '';
            const token = ++this.loadToken;
            await this.loadSimilarMatch(token);
        },
        async showPreviousSimilar() {
            if (!this.canShowPreviousSimilar) {
                return;
            }

            const currentIndex = this.similarMatchIndexes[this.similarCriterion] ?? 0;
            this.similarMatchIndexes[this.similarCriterion] = currentIndex - 1;
            this.highlightedSpecKey = '';
            const token = ++this.loadToken;
            await this.loadSimilarMatch(token);
        },
        async showNextSimilar() {
            if (!this.canShowNextSimilar) {
                return;
            }

            const currentIndex = this.similarMatchIndexes[this.similarCriterion] ?? 0;
            this.similarMatchIndexes[this.similarCriterion] = currentIndex + 1;
            this.highlightedSpecKey = '';
            const token = ++this.loadToken;
            await this.loadSimilarMatch(token);
        },
        onSpecHighlight(specKey) {
            this.highlightedSpecKey = this.highlightedSpecKey === specKey ? '' : specKey;
        },
        async loadListingColumn(stateKey, property, token) {
            try {
                const result = await fetchPropertyListingDetail(this.$api, property);
                if (token !== this.loadToken) return;

                this[stateKey] = {
                    kind: result.kind,
                    listing: result.data,
                    loading: false,
                    error: '',
                };
            } catch {
                if (token !== this.loadToken) return;

                this[stateKey] = {
                    ...createListingState(),
                    error: 'Could not load this listing right now.',
                };
            }
        },
        close() {
            this.open = false;
            this.mode = COMPARE_MODES.manual;
            this.similarCriterion = '';
            this.allListings = [];
            this.similarMatchesCache = {};
            this.similarMatchIndexes = createSimilarMatchIndexes();
            this.highlightedSpecKey = '';
            this.anchorProperty = null;
            this.currentProperty = null;
            this.anchorState = createListingState();
            this.currentState = createListingState();
            this.unlockBodyScroll();
        },
        lockBodyScroll() {
            document.body.classList.add('listing-compare-open');
        },
        unlockBodyScroll() {
            document.body.classList.remove('listing-compare-open');
        },
    },
};
</script>
