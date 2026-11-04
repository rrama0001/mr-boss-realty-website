<template>
    <div class="properties-page">
        <section class="property-hero property-hero--detail property-hero--page">
            <img
                class="property-hero__bg"
                :src="heroImageUrl"
                alt=""
                width="1920"
                height="640"
                fetchpriority="high"
            />
            <div class="property-hero__overlay" aria-hidden="true"></div>
            <div class="container-xl property-hero__inner">
                <div class="property-hero__copy">
                    <p class="property-hero__eyebrow">Mr. Boss Realty</p>
                    <h1 class="property-hero__title">Land &amp; Lots</h1>
                    <p class="property-hero__lead">
                        Browse residential, commercial, and agricultural lots available for sale or lease across the Philippines.
                    </p>
                </div>
            </div>
        </section>

        <section class="home-section home-section--light">
            <div class="container-xl">
                <div v-if="loading" class="properties-page__state">
                    <div class="properties-page__spinner" aria-hidden="true"></div>
                    <p>Loading lots...</p>
                </div>

                <div v-else-if="error" class="properties-page__state properties-page__state--error">
                    <p>{{ error }}</p>
                    <button type="button" class="btn btn-primary" @click="loadLots">Try again</button>
                </div>

                <div v-else-if="!totalListingCount" class="properties-page__state">
                    <p>No lots are listed yet. Please check back soon.</p>
                </div>

                <template v-else>
                    <div
                        ref="listingSection"
                        class="property-detail__units-board"
                        :class="{ 'property-detail__units-board--with-filters': hasListingFilters }"
                    >
                        <div class="property-detail__section-head">
                            <div>
                                <h2>Available Lots</h2>
                                <p>
                                    <template v-if="filteredLotCards.length !== totalListingCount">
                                        Showing {{ filteredLotCards.length }} of {{ totalListingCount }}
                                        {{ totalListingCount === 1 ? 'lot' : 'lots' }}
                                    </template>
                                    <template v-else>
                                        {{ totalListingCount }}
                                        {{ totalListingCount === 1 ? 'lot' : 'lots' }}
                                        available
                                    </template>
                                </p>
                            </div>
                        </div>

                        <div class="property-detail__units-search site-search site-search--light">
                            <label class="visually-hidden" for="lots-search">Search lots</label>
                            <input
                                id="lots-search"
                                ref="searchInput"
                                v-model="searchDraft"
                                type="search"
                                class="form-control site-search__input"
                                placeholder="Search lot..."
                                autocomplete="off"
                                @keydown.enter.prevent="applySearch"
                                @input="onSearchInput"
                            />
                            <div class="site-search__actions">
                                <button
                                    v-if="searchDraft || searchQuery"
                                    type="button"
                                    class="site-search__btn site-search__btn--muted"
                                    aria-label="Clear search"
                                    @click="clearSearch"
                                >
                                    <i class="ti ti-x" aria-hidden="true"></i>
                                </button>
                                <button
                                    type="button"
                                    class="site-search__btn"
                                    aria-label="Search lots"
                                    @click="applySearch"
                                >
                                    <i class="ti ti-search" aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>

                        <aside
                            v-if="hasListingFilters"
                            class="property-detail__filters"
                            aria-label="Filter lots"
                        >
                            <div v-if="availableCities.length" class="property-detail__filters-group">
                                <label class="property-detail__filters-title property-detail__filters-title--toggle">
                                    <input
                                        ref="allCitiesCheckbox"
                                        type="checkbox"
                                        class="property-detail__filter-checkbox"
                                        :checked="allCitiesSelected"
                                        @change="toggleAllCities"
                                    />
                                    <span>City</span>
                                </label>
                                <ul class="property-detail__filters-list">
                                    <li v-for="city in availableCities" :key="city">
                                        <label class="property-detail__filter-option">
                                            <input
                                                v-model="selectedCities"
                                                type="checkbox"
                                                class="property-detail__filter-checkbox"
                                                :value="city"
                                            />
                                            <span class="property-detail__filter-label">{{ city }}</span>
                                            <span class="property-detail__filter-count">{{ cityCounts[city] || 0 }}</span>
                                        </label>
                                    </li>
                                </ul>
                            </div>

                            <div v-if="availableLotTypes.length" class="property-detail__filters-group">
                                <label class="property-detail__filters-title property-detail__filters-title--toggle">
                                    <input
                                        ref="allLotTypesCheckbox"
                                        type="checkbox"
                                        class="property-detail__filter-checkbox"
                                        :checked="allLotTypesSelected"
                                        @change="toggleAllLotTypes"
                                    />
                                    <span>Lot type</span>
                                </label>
                                <ul class="property-detail__filters-list">
                                    <li v-for="lotType in availableLotTypes" :key="lotType">
                                        <label class="property-detail__filter-option">
                                            <input
                                                v-model="selectedLotTypes"
                                                type="checkbox"
                                                class="property-detail__filter-checkbox"
                                                :value="lotType"
                                            />
                                            <span class="property-detail__filter-label">{{ lotType }}</span>
                                            <span class="property-detail__filter-count">{{ lotTypeCounts[lotType] || 0 }}</span>
                                        </label>
                                    </li>
                                </ul>
                            </div>

                            <div v-if="availableListingTypes.length" class="property-detail__filters-group">
                                <label class="property-detail__filters-title property-detail__filters-title--toggle">
                                    <input
                                        ref="allListingTypesCheckbox"
                                        type="checkbox"
                                        class="property-detail__filter-checkbox"
                                        :checked="allListingTypesSelected"
                                        @change="toggleAllListingTypes"
                                    />
                                    <span>Listing type</span>
                                </label>
                                <ul class="property-detail__filters-list">
                                    <li v-for="option in availableListingTypes" :key="option.value">
                                        <label class="property-detail__filter-option">
                                            <input
                                                v-model="selectedListingTypes"
                                                type="checkbox"
                                                class="property-detail__filter-checkbox"
                                                :value="option.value"
                                            />
                                            <span class="property-detail__filter-label">{{ option.label }}</span>
                                            <span class="property-detail__filter-count">{{ listingTypeCounts[option.value] || 0 }}</span>
                                        </label>
                                    </li>
                                </ul>
                            </div>
                        </aside>

                        <div class="property-detail__units-main">
                            <div v-if="filteredLotCards.length" class="property-grid">
                                <PropertyCard
                                    v-for="(property, index) in visibleLotCards"
                                    :key="property.cardKey"
                                    :property="property"
                                    :image-loading="index < 3 ? 'eager' : 'lazy'"
                                    :fetch-priority="index === 0 ? 'high' : 'auto'"
                                    :show-interest-button="true"
                                />
                            </div>
                            <div
                                v-if="filteredLotCards.length"
                                class="properties-page__load-more"
                            >
                                <p class="properties-page__load-more-status">
                                    {{ visibleCountClamped }} of {{ filteredLotCards.length }}
                                </p>
                                <button
                                    v-if="hasMoreListings"
                                    type="button"
                                    class="properties-page__load-more-btn"
                                    @click="loadMoreListings"
                                >
                                    Load more
                                </button>
                            </div>
                            <p v-else class="property-detail__filters-empty">
                                No lots match your search or filters.
                                <button type="button" class="property-detail__filters-reset" @click="resetAllFilters">
                                    Show all
                                </button>
                            </p>
                        </div>
                    </div>
                </template>
            </div>
        </section>
    </div>
</template>

<script>
import PropertyCard from '@/components/home/PropertyCard.vue';
import {
    LOT_LISTING_TYPE_OPTIONS,
    getLotListingTypeValue,
    isLotBuildingType,
    isLotListing,
    sortLotTypes,
} from '@/constants/lotListings';
import { getListingCity, buildProjectPublicApiPath } from '@/utils/propertyCity';
import { getSiteUrl, updatePageMeta } from '@/utils/seo';
import { DEFAULT_PROPERTY_PAGE_SIZE, loadWebsiteSettings } from '@/utils/websiteSettings';
import { getWholeBuildingListings } from '@/utils/mapPropertyListingsToCards';
import { mapUnitToPropertyCard, mapPublicUnitToPropertyCard } from '@/utils/mapUnitToProperty';
import {
    mapWholeBuildingToPropertyCard,
    mapPublicWholeBuildingToPropertyCard,
} from '@/utils/mapWholeBuildingToProperty';
import { buildingMatchesSearch, unitMatchesSearch } from '@/utils/unitSearch';
import { flushPendingScrollRestore } from '@/utils/scroll';
import heroImageUrl from '@/assets/images/hero-bg-lots.jpg';

export default {
    name: 'LotsView',
    components: { PropertyCard },
    data() {
        return {
            loading: true,
            error: '',
            privateProperties: [],
            units: [],
            selectedCities: [],
            selectedLotTypes: [],
            selectedListingTypes: [],
            searchQuery: '',
            searchDraft: '',
            recordsPerPage: DEFAULT_PROPERTY_PAGE_SIZE,
            visibleCount: DEFAULT_PROPERTY_PAGE_SIZE,
            _searchTimer: null,
            heroImageUrl,
        };
    },
    computed: {
        lotInventory() {
            const privateLots = this.privateProperties.flatMap((property) => {
                const wholeLots = getWholeBuildingListings(property)
                    .filter((building) => isLotBuildingType(building.building_type))
                    .map((building) => ({
                        kind: 'private_building',
                        property,
                        item: building,
                        city: getListingCity(property),
                        buildingType: building.building_type || 'Lot',
                        listingType: getLotListingTypeValue(building),
                    }));

                const unitLots = (property.units || [])
                    .filter((unit) => isLotBuildingType(unit.building_type))
                    .map((unit) => ({
                        kind: 'private_unit',
                        property,
                        item: unit,
                        city: getListingCity(property),
                        buildingType: unit.building_type || 'Lot',
                        listingType: getLotListingTypeValue(unit),
                    }));

                return [...wholeLots, ...unitLots];
            });

            const publicLots = this.units
                .filter((unit) => isLotListing(unit))
                .map((unit) => ({
                    kind: unit.listing_kind === 'whole_building' ? 'public_building' : 'public_unit',
                    property: null,
                    item: unit,
                    city: getListingCity({ city: unit.project_city }),
                    buildingType: unit.building_type || 'Lot',
                    listingType: getLotListingTypeValue(unit),
                }));

            return [...privateLots, ...publicLots];
        },
        totalListingCount() {
            return this.lotInventory.length;
        },
        hasListingFilters() {
            return this.availableCities.length
                || this.availableLotTypes.length
                || this.availableListingTypes.length;
        },
        availableCities() {
            return [...new Set(this.lotInventory.map((entry) => entry.city).filter(Boolean))]
                .sort((a, b) => a.localeCompare(b));
        },
        cityCounts() {
            const counts = {};
            this.lotInventory.forEach((entry) => {
                if (!entry.city) return;
                counts[entry.city] = (counts[entry.city] || 0) + 1;
            });
            return counts;
        },
        availableLotTypes() {
            return sortLotTypes([
                ...new Set(this.lotInventory.map((entry) => entry.buildingType).filter(Boolean)),
            ]);
        },
        lotTypeCounts() {
            const counts = {};
            this.lotInventory.forEach((entry) => {
                if (!entry.buildingType) return;
                counts[entry.buildingType] = (counts[entry.buildingType] || 0) + 1;
            });
            return counts;
        },
        availableListingTypes() {
            const present = new Set(this.lotInventory.map((entry) => entry.listingType));
            return LOT_LISTING_TYPE_OPTIONS.filter((option) => present.has(option.value));
        },
        listingTypeCounts() {
            const counts = { sale: 0, lease: 0 };
            this.lotInventory.forEach((entry) => {
                counts[entry.listingType] = (counts[entry.listingType] || 0) + 1;
            });
            return counts;
        },
        filteredLotEntries() {
            const query = this.searchQuery.trim();

            return this.lotInventory.filter((entry) => (
                this.matchesCityFilter(entry)
                && this.matchesLotTypeFilter(entry)
                && this.matchesListingTypeFilter(entry)
                && this.matchesSearchFilter(entry, query)
            ));
        },
        filteredLotCards() {
            return this.filteredLotEntries.map((entry) => this.mapLotCard(entry));
        },
        visibleCountClamped() {
            const total = this.filteredLotCards.length;
            if (!total) return 0;
            return Math.min(this.visibleCount || this.recordsPerPage, total);
        },
        visibleLotCards() {
            return this.filteredLotCards.slice(0, this.visibleCountClamped);
        },
        hasMoreListings() {
            return this.visibleCountClamped < this.filteredLotCards.length;
        },
        allCitiesSelected() {
            return this.availableCities.length > 0
                && this.selectedCities.length === this.availableCities.length;
        },
        someCitiesSelected() {
            return this.selectedCities.length > 0
                && this.selectedCities.length < this.availableCities.length;
        },
        allLotTypesSelected() {
            return this.availableLotTypes.length > 0
                && this.selectedLotTypes.length === this.availableLotTypes.length;
        },
        someLotTypesSelected() {
            return this.selectedLotTypes.length > 0
                && this.selectedLotTypes.length < this.availableLotTypes.length;
        },
        allListingTypesSelected() {
            return this.availableListingTypes.length > 0
                && this.selectedListingTypes.length === this.availableListingTypes.length;
        },
        someListingTypesSelected() {
            return this.selectedListingTypes.length > 0
                && this.selectedListingTypes.length < this.availableListingTypes.length;
        },
    },
    watch: {
        selectedCities: 'onListingFiltersChanged',
        availableCities: 'syncAllCitiesIndeterminate',
        selectedLotTypes: 'onListingFiltersChanged',
        availableLotTypes: 'syncAllLotTypesIndeterminate',
        selectedListingTypes: 'onListingFiltersChanged',
        availableListingTypes: 'syncAllListingTypesIndeterminate',
        searchQuery: 'resetVisibleListings',
    },
    mounted() {
        this.loadLots();
    },
    beforeUnmount() {
        if (this._searchTimer) {
            window.clearTimeout(this._searchTimer);
            this._searchTimer = null;
        }
    },
    activated() {
        flushPendingScrollRestore();
    },
    updated() {
        this.syncAllCitiesIndeterminate();
        this.syncAllLotTypesIndeterminate();
        this.syncAllListingTypesIndeterminate();
    },
    methods: {
        updatePageMetaTags() {
            updatePageMeta({
                title: 'Land & Lots | Mr. Boss Realty',
                description:
                    'Browse residential, commercial, and agricultural lots for sale and lease across the Philippines with Mr. Boss Realty.',
                canonical: getSiteUrl('/lots'),
            });
        },
        resetVisibleListings() {
            this.visibleCount = this.recordsPerPage;
        },
        loadMoreListings() {
            if (!this.hasMoreListings) return;
            this.visibleCount = Math.min(
                this.visibleCountClamped + this.recordsPerPage,
                this.filteredLotCards.length,
            );
        },
        onListingFiltersChanged() {
            this.syncAllCitiesIndeterminate();
            this.syncAllLotTypesIndeterminate();
            this.syncAllListingTypesIndeterminate();
            this.resetVisibleListings();
        },
        mapLotCard(entry) {
            if (entry.kind === 'private_building') {
                return {
                    ...mapWholeBuildingToPropertyCard(entry.item, entry.property),
                    cardKey: `building-${entry.item.id}`,
                };
            }

            if (entry.kind === 'private_unit') {
                return {
                    ...mapUnitToPropertyCard(entry.item, entry.property),
                    cardKey: `unit-${entry.item.id}`,
                };
            }

            if (entry.kind === 'public_building') {
                return {
                    ...mapPublicWholeBuildingToPropertyCard(entry.item),
                    cardKey: `building-${entry.item.id}`,
                };
            }

            return {
                ...mapPublicUnitToPropertyCard(entry.item),
                cardKey: `unit-${entry.item.id}`,
            };
        },
        matchesCityFilter(entry) {
            if (!this.availableCities.length || !this.selectedCities.length || this.allCitiesSelected) {
                return true;
            }

            return this.selectedCities.includes(entry.city);
        },
        matchesLotTypeFilter(entry) {
            if (!this.availableLotTypes.length || !this.selectedLotTypes.length || this.allLotTypesSelected) {
                return true;
            }

            return this.selectedLotTypes.includes(entry.buildingType);
        },
        matchesListingTypeFilter(entry) {
            if (
                !this.availableListingTypes.length
                || !this.selectedListingTypes.length
                || this.allListingTypesSelected
            ) {
                return true;
            }

            return this.selectedListingTypes.includes(entry.listingType);
        },
        matchesSearchFilter(entry, query) {
            if (!query) return true;

            if (entry.kind === 'private_building' || entry.kind === 'public_building') {
                return buildingMatchesSearch(entry.item, query, entry.property || undefined);
            }

            return unitMatchesSearch(entry.item, query, entry.property || undefined);
        },
        applySearch() {
            if (this._searchTimer) {
                window.clearTimeout(this._searchTimer);
                this._searchTimer = null;
            }
            this.searchQuery = this.searchDraft.trim();
            this.resetVisibleListings();
            this.$refs.searchInput?.focus();
        },
        onSearchInput() {
            if (this._searchTimer) {
                window.clearTimeout(this._searchTimer);
            }
            this._searchTimer = window.setTimeout(() => {
                this.searchQuery = this.searchDraft.trim();
                this.resetVisibleListings();
            }, 200);
        },
        clearSearch() {
            if (this._searchTimer) {
                window.clearTimeout(this._searchTimer);
                this._searchTimer = null;
            }
            this.searchDraft = '';
            this.searchQuery = '';
            this.resetVisibleListings();
            this.$nextTick(() => {
                this.$refs.searchInput?.focus();
            });
        },
        syncAllCitiesIndeterminate() {
            const checkbox = this.$refs.allCitiesCheckbox;
            if (!checkbox) return;
            checkbox.indeterminate = this.someCitiesSelected;
        },
        syncAllLotTypesIndeterminate() {
            const checkbox = this.$refs.allLotTypesCheckbox;
            if (!checkbox) return;
            checkbox.indeterminate = this.someLotTypesSelected;
        },
        syncAllListingTypesIndeterminate() {
            const checkbox = this.$refs.allListingTypesCheckbox;
            if (!checkbox) return;
            checkbox.indeterminate = this.someListingTypesSelected;
        },
        toggleAllCities() {
            this.selectedCities = this.allCitiesSelected ? [] : [...this.availableCities];
        },
        toggleAllLotTypes() {
            this.selectedLotTypes = this.allLotTypesSelected ? [] : [...this.availableLotTypes];
        },
        toggleAllListingTypes() {
            this.selectedListingTypes = this.allListingTypesSelected
                ? []
                : this.availableListingTypes.map((option) => option.value);
        },
        resetAllFilters() {
            this.selectedCities = [];
            this.selectedLotTypes = [];
            this.selectedListingTypes = [];
            this.searchDraft = '';
            this.searchQuery = '';
            this.resetVisibleListings();
        },
        async loadLots() {
            this.loading = true;
            this.error = '';
            this.privateProperties = [];
            this.units = [];
            this.resetAllFilters();

            try {
                const [projectsRes, unitsRes, websiteSettings] = await Promise.all([
                    this.$api.get('/projects/public/list'),
                    this.$api.get('/units/public/list', { params: { limit: 'all' } }),
                    loadWebsiteSettings(),
                ]);

                this.recordsPerPage = websiteSettings.property_page_records_per_page;
                this.visibleCount = this.recordsPerPage;

                const privateProjects = (projectsRes.data || []).filter(
                    (project) => project.is_private_on_website && project.city,
                );

                const detailResponses = await Promise.all(
                    privateProjects.map((project) => {
                        const apiPath = buildProjectPublicApiPath(project);
                        return apiPath
                            ? this.$api.get(apiPath)
                            : Promise.resolve({ data: null });
                    }),
                );

                this.privateProperties = detailResponses.map((response) => response.data).filter(Boolean);
                this.units = (unitsRes.data || []).filter((item) => !item.is_private_on_website);
            } catch (err) {
                console.error('Failed to load lots:', err);
                this.error = 'Could not load lots right now. Please try again.';
                this.privateProperties = [];
                this.units = [];
            } finally {
                this.loading = false;
                this.$nextTick(() => {
                    this.updatePageMetaTags();
                    flushPendingScrollRestore();
                });
            }
        },
    },
};
</script>
