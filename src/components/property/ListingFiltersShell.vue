<template>
    <div class="property-detail__listing-flow">
        <div
            v-if="visible"
            ref="filtersToggleSentinel"
            class="property-detail__filters-sentinel"
            aria-hidden="true"
        ></div>

        <aside
            v-if="visible"
            class="property-detail__filters"
            :class="{
                'property-detail__filters--open': filtersExpanded,
                'property-detail__filters--stuck': filtersToggleStuck,
            }"
            :aria-label="label"
        >
            <div class="property-detail__filters-shell">
                <div class="property-detail__filters-bar">
                    <button
                        type="button"
                        class="property-detail__filters-toggle"
                        :aria-expanded="filtersExpanded ? 'true' : 'false'"
                        :aria-controls="resolvedPanelId"
                        @click="toggleListingFilters"
                    >
                        <span class="property-detail__filters-toggle-label">
                            <i class="ti ti-filter" aria-hidden="true"></i>
                            <span>Filters</span>
                            <span
                                v-if="activeCount"
                                class="property-detail__filters-toggle-count"
                            >{{ activeCount }}</span>
                        </span>
                    </button>
                    <button
                        v-if="activeCount"
                        type="button"
                        class="property-detail__filters-clear"
                        @click="$emit('clear')"
                    >
                        Clear
                    </button>
                    <button
                        type="button"
                        class="property-detail__filters-chevron"
                        :aria-expanded="filtersExpanded ? 'true' : 'false'"
                        :aria-controls="resolvedPanelId"
                        aria-label="Toggle filters"
                        @click="toggleListingFilters"
                    >
                        <i
                            class="ti"
                            :class="filtersExpanded ? 'ti-chevron-up' : 'ti-chevron-down'"
                            aria-hidden="true"
                        ></i>
                    </button>
                </div>
            </div>

            <div :id="resolvedPanelId" class="property-detail__filters-panel">
                <div class="property-detail__filters-panel-inner">
                    <slot />
                </div>
            </div>
        </aside>

        <div
            class="property-detail__units-main"
            :class="mainClass"
            :aria-busy="mainBusy ? 'true' : undefined"
        >
            <slot name="main" />
        </div>
    </div>
</template>

<script>
import listingFiltersMobile from '@/mixins/listingFiltersMobile';

let listingFiltersPanelSeq = 0;

export default {
    name: 'ListingFiltersShell',
    mixins: [listingFiltersMobile],
    props: {
        visible: {
            type: Boolean,
            default: true,
        },
        activeCount: {
            type: Number,
            default: 0,
        },
        label: {
            type: String,
            default: 'Filter listings',
        },
        panelId: {
            type: String,
            default: '',
        },
        mainClass: {
            type: [String, Object, Array],
            default: '',
        },
        mainBusy: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['clear'],
    computed: {
        resolvedPanelId() {
            return this.panelId || this._fallbackPanelId;
        },
    },
    created() {
        listingFiltersPanelSeq += 1;
        this._fallbackPanelId = `listing-filters-panel-${listingFiltersPanelSeq}`;
    },
};
</script>
