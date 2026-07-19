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
                <nav v-if="isCityBrowsePage && routeCityName" class="property-hero__breadcrumb" aria-label="Breadcrumb">
                    <router-link to="/">Home</router-link>
                    <span class="property-hero__breadcrumb-sep" aria-hidden="true">/</span>
                    <router-link to="/properties">Properties</router-link>
                    <span class="property-hero__breadcrumb-sep" aria-hidden="true">/</span>
                    <span class="property-hero__breadcrumb-current" aria-current="page">{{ routeCityName }}</span>
                </nav>
                <div class="property-hero__copy">
                    <p class="property-hero__eyebrow">Mr. Boss Realty</p>
                    <h1 class="property-hero__title">{{ heroTitle }}</h1>
                    <p class="property-hero__lead">
                        {{ heroLead }}
                    </p>
                </div>
            </div>
        </section>

        <section class="home-section home-section--light">
            <div class="container-xl">
                <div v-if="loading" class="properties-page__state">
                    <div class="properties-page__spinner" aria-hidden="true"></div>
                    <p>Loading properties...</p>
                </div>

                <div v-else-if="error" class="properties-page__state properties-page__state--error">
                    <p>{{ error }}</p>
                    <button type="button" class="btn btn-primary" @click="loadProperties">Try again</button>
                </div>

                <div v-else-if="cityBrowseNotFound" class="properties-page__state">
                    <p>We couldn't find properties for this location.</p>
                    <router-link to="/properties" class="btn btn-primary">View all properties</router-link>
                </div>

                <div v-else-if="!totalListingCount" class="properties-page__state">
                    <p>No properties are listed yet. Please check back soon.</p>
                </div>

                <template v-else>
                    <div
                        ref="listingSection"
                        class="property-detail__units-board"
                        :class="{ 'property-detail__units-board--with-filters': hasListingFilters }"
                    >
                        <div class="property-detail__section-head">
                            <div>
                                <h2>{{ sectionTitle }}</h2>
                                <p>
                                    <template v-if="isCityBrowsePage && routeCityName">
                                        {{ filteredPropertyCards.length }} propert{{ filteredPropertyCards.length === 1 ? 'y' : 'ies' }} in {{ routeCityName }}
                                    </template>
                                    <template v-else-if="filteredPropertyCards.length !== totalListingCount">
                                        Showing {{ filteredPropertyCards.length }} of {{ totalListingCount }} properties
                                    </template>
                                    <template v-else>
                                        {{ totalListingCount }} propert{{ totalListingCount === 1 ? 'y' : 'ies' }} available
                                    </template>
                                </p>
                            </div>
                        </div>

                        <div class="property-detail__units-search site-search site-search--light">
                            <label class="visually-hidden" for="properties-search">Search properties</label>
                            <input
                                id="properties-search"
                                ref="searchInput"
                                v-model="searchDraft"
                                type="search"
                                class="form-control site-search__input"
                                placeholder="Search property..."
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
                                    aria-label="Search properties"
                                    @click="applySearch"
                                >
                                    <i class="ti ti-search" aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>

                        <aside
                            v-if="hasListingFilters"
                            class="property-detail__filters"
                            aria-label="Filter properties"
                        >
                            <div v-if="showCityFilter" class="property-detail__filters-group">
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

                            <div v-if="availableUnitTypes.length" class="property-detail__filters-group">
                                <label class="property-detail__filters-title property-detail__filters-title--toggle">
                                    <input
                                        ref="allUnitTypesCheckbox"
                                        type="checkbox"
                                        class="property-detail__filter-checkbox"
                                        :checked="allUnitTypesSelected"
                                        @change="toggleAllUnitTypes"
                                    />
                                    <span>Unit type</span>
                                </label>
                                <ul class="property-detail__filters-list">
                                    <li v-for="unitType in availableUnitTypes" :key="unitType">
                                        <label class="property-detail__filter-option">
                                            <input
                                                v-model="selectedUnitTypes"
                                                type="checkbox"
                                                class="property-detail__filter-checkbox"
                                                :value="unitType"
                                            />
                                            <span class="property-detail__filter-label">{{ unitType }}</span>
                                            <span class="property-detail__filter-count">{{ unitTypeCounts[unitType] || 0 }}</span>
                                        </label>
                                    </li>
                                </ul>
                            </div>

                            <div v-if="availableBedrooms.length" class="property-detail__filters-group">
                                <label class="property-detail__filters-title property-detail__filters-title--toggle">
                                    <input
                                        ref="allBedroomsCheckbox"
                                        type="checkbox"
                                        class="property-detail__filter-checkbox"
                                        :checked="allBedroomsSelected"
                                        @change="toggleAllBedrooms"
                                    />
                                    <span>Bedrooms</span>
                                </label>
                                <ul class="property-detail__filters-list">
                                    <li v-for="bedroom in availableBedrooms" :key="`bed-${bedroom}`">
                                        <label class="property-detail__filter-option">
                                            <input
                                                v-model="selectedBedrooms"
                                                type="checkbox"
                                                class="property-detail__filter-checkbox"
                                                :value="bedroom"
                                            />
                                            <span class="property-detail__filter-label">{{ bedroom }} Br</span>
                                            <span class="property-detail__filter-count">{{ bedroomCounts[bedroom] || 0 }}</span>
                                        </label>
                                    </li>
                                </ul>
                            </div>

                            <div v-if="availableBathrooms.length" class="property-detail__filters-group">
                                <label class="property-detail__filters-title property-detail__filters-title--toggle">
                                    <input
                                        ref="allBathroomsCheckbox"
                                        type="checkbox"
                                        class="property-detail__filter-checkbox"
                                        :checked="allBathroomsSelected"
                                        @change="toggleAllBathrooms"
                                    />
                                    <span>Bathrooms</span>
                                </label>
                                <ul class="property-detail__filters-list">
                                    <li v-for="bathroom in availableBathrooms" :key="`bath-${bathroom}`">
                                        <label class="property-detail__filter-option">
                                            <input
                                                v-model="selectedBathrooms"
                                                type="checkbox"
                                                class="property-detail__filter-checkbox"
                                                :value="bathroom"
                                            />
                                            <span class="property-detail__filter-label">{{ bathroom }} Ba</span>
                                            <span class="property-detail__filter-count">{{ bathroomCounts[bathroom] || 0 }}</span>
                                        </label>
                                    </li>
                                </ul>
                            </div>
                        </aside>

                        <div class="property-detail__units-main">
                            <div v-if="filteredPropertyCards.length" class="property-grid">
                                <PropertyCard
                                    v-for="(property, index) in visiblePropertyCards"
                                    :key="property.cardKey"
                                    :property="property"
                                    :image-loading="index < 3 ? 'eager' : 'lazy'"
                                    :fetch-priority="index === 0 ? 'high' : 'auto'"
                                    :show-interest-button="true"
                                />
                            </div>
                            <div
                                v-if="filteredPropertyCards.length"
                                class="properties-page__load-more"
                            >
                                <p class="properties-page__load-more-status">
                                    {{ visibleCountClamped }} of {{ filteredPropertyCards.length }}
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
                                No properties match your search or filters.
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
import { sortUnitTypes } from '@/constants/unitTypes';
import { cityToSlug, resolveCityFromSlug, getListingCity, buildProjectPublicApiPath } from '@/utils/propertyCity';
import { getSiteUrl, updatePageMeta } from '@/utils/seo';
import { DEFAULT_PROPERTY_PAGE_SIZE, loadWebsiteSettings } from '@/utils/websiteSettings';
import { getWholeBuildingListings } from '@/utils/mapPropertyListingsToCards';
import { buildCityListingCounts, countPropertyListingsForProject } from '@/utils/propertyCityCounts';
import { mapUnitToPropertyCard } from '@/utils/mapUnitToProperty';
import { mapPublicUnitToPropertyCard } from '@/utils/mapUnitToProperty';
import { mapWholeBuildingToPropertyCard } from '@/utils/mapWholeBuildingToProperty';
import { mapPublicWholeBuildingToPropertyCard } from '@/utils/mapWholeBuildingToProperty';
import { buildingMatchesSearch, unitMatchesSearch } from '@/utils/unitSearch';
import { flushPendingScrollRestore } from '@/utils/scroll';
import heroImageUrl from '@/assets/images/hero-bg-03-apartment-towers.jpg';

export default {
    name: 'PropertiesView',
    components: { PropertyCard },
    data() {
        return {
            loading: true,
            error: '',
            privateProperties: [],
            units: [],
            selectedCities: [],
            selectedUnitTypes: [],
            selectedBedrooms: [],
            selectedBathrooms: [],
            searchQuery: '',
            searchDraft: '',
            recordsPerPage: DEFAULT_PROPERTY_PAGE_SIZE,
            visibleCount: DEFAULT_PROPERTY_PAGE_SIZE,
            syncingRouteFilters: false,
            _searchTimer: null,
            heroImageUrl,
        };
    },
    computed: {
        isCityBrowsePage() {
            return this.$route.name === 'property-segment';
        },
        routeCitySlug() {
            if (!this.isCityBrowsePage) return '';
            return String(this.$route.params.slug || '').trim();
        },
        routeCityName() {
            if (!this.isCityBrowsePage || !this.routeCitySlug) return null;

            const resolved = resolveCityFromSlug(this.routeCitySlug, this.availableCities);
            if (resolved) return resolved;

            return this.routeCitySlug
                .split('-')
                .filter(Boolean)
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        },
        cityBrowseNotFound() {
            if (!this.isCityBrowsePage || this.loading) return false;
            if (!this.routeCitySlug) return true;

            if (!this.availableCities.length) return false;

            return !resolveCityFromSlug(this.routeCitySlug, this.availableCities);
        },
        cityBrowseCardOptions() {
            return this.isCityBrowsePage ? { linkToProject: true } : {};
        },
        heroTitle() {
            if (this.isCityBrowsePage && this.routeCityName) {
                return `Properties in ${this.routeCityName}`;
            }
            return 'Properties';
        },
        heroLead() {
            if (this.isCityBrowsePage && this.routeCityName) {
                return `Browse available listings in ${this.routeCityName}—condominiums, houses, lots, and rental properties.`;
            }

            return 'Browse our trusted developments across the Philippines—from pre-selling condominiums and ready-for-occupancy units to lots and rental properties.';
        },
        sectionTitle() {
            if (this.isCityBrowsePage && this.routeCityName) {
                return `Properties in ${this.routeCityName}`;
            }
            return 'All Properties';
        },
        totalListingCount() {
            const privateCount = this.privateProperties.reduce(
                (sum, property) => sum + this.countPropertyListings(property),
                0,
            );

            return privateCount + this.units.length;
        },
        hasListingFilters() {
            return this.showCityFilter
                || this.availableUnitTypes.length
                || this.availableBedrooms.length
                || this.availableBathrooms.length;
        },
        showCityFilter() {
            return this.availableCities.length && !this.isCityBrowsePage;
        },
        availableCities() {
            const cities = new Set();

            this.privateProperties.forEach((property) => {
                const city = getListingCity(property);
                if (city) cities.add(city);
            });

            this.units.forEach((unit) => {
                const city = getListingCity({ city: unit.project_city });
                if (city) cities.add(city);
            });

            return [...cities].sort((a, b) => a.localeCompare(b));
        },
        cityCounts() {
            return buildCityListingCounts({
                privateProperties: this.privateProperties,
                units: this.units,
            });
        },
        availableUnitTypes() {
            const types = new Set();

            this.privateProperties.forEach((property) => {
                (property.units || []).forEach((unit) => {
                    if (unit.unit_type) types.add(unit.unit_type);
                });
            });

            this.units.forEach((unit) => {
                if (unit.unit_type) types.add(unit.unit_type);
            });

            return sortUnitTypes([...types]);
        },
        unitTypeCounts() {
            const counts = {};

            this.privateProperties.forEach((property) => {
                (property.units || []).forEach((unit) => {
                    if (!unit.unit_type) return;
                    counts[unit.unit_type] = (counts[unit.unit_type] || 0) + 1;
                });
            });

            this.units.forEach((unit) => {
                if (!unit.unit_type) return;
                counts[unit.unit_type] = (counts[unit.unit_type] || 0) + 1;
            });

            return counts;
        },
        availableBedrooms() {
            const bedrooms = new Set();

            this.privateProperties.forEach((property) => {
                getWholeBuildingListings(property).forEach((building) => {
                    if (building.bedrooms != null) bedrooms.add(building.bedrooms);
                });
                (property.units || []).forEach((unit) => {
                    if (unit.bedrooms != null) bedrooms.add(unit.bedrooms);
                });
            });

            this.units.forEach((unit) => {
                if (unit.bedrooms != null) bedrooms.add(unit.bedrooms);
            });

            return [...bedrooms].sort((a, b) => a - b);
        },
        bedroomCounts() {
            const counts = {};

            this.privateProperties.forEach((property) => {
                getWholeBuildingListings(property).forEach((building) => {
                    if (building.bedrooms == null) return;
                    counts[building.bedrooms] = (counts[building.bedrooms] || 0) + 1;
                });

                (property.units || []).forEach((unit) => {
                    if (unit.bedrooms == null) return;
                    counts[unit.bedrooms] = (counts[unit.bedrooms] || 0) + 1;
                });
            });

            this.units.forEach((unit) => {
                if (unit.bedrooms == null) return;
                counts[unit.bedrooms] = (counts[unit.bedrooms] || 0) + 1;
            });

            return counts;
        },
        availableBathrooms() {
            const bathrooms = new Set();

            this.privateProperties.forEach((property) => {
                getWholeBuildingListings(property).forEach((building) => {
                    if (building.bathrooms != null) bathrooms.add(building.bathrooms);
                });
                (property.units || []).forEach((unit) => {
                    if (unit.bathrooms != null) bathrooms.add(unit.bathrooms);
                });
            });

            this.units.forEach((unit) => {
                if (unit.bathrooms != null) bathrooms.add(unit.bathrooms);
            });

            return [...bathrooms].sort((a, b) => a - b);
        },
        bathroomCounts() {
            const counts = {};

            this.privateProperties.forEach((property) => {
                getWholeBuildingListings(property).forEach((building) => {
                    if (building.bathrooms == null) return;
                    counts[building.bathrooms] = (counts[building.bathrooms] || 0) + 1;
                });

                (property.units || []).forEach((unit) => {
                    if (unit.bathrooms == null) return;
                    counts[unit.bathrooms] = (counts[unit.bathrooms] || 0) + 1;
                });
            });

            this.units.forEach((unit) => {
                if (unit.bathrooms == null) return;
                counts[unit.bathrooms] = (counts[unit.bathrooms] || 0) + 1;
            });

            return counts;
        },
        filteredPrivateListingCards() {
            const query = this.searchQuery.trim();

            return this.privateProperties.flatMap((property) => {
                const propertyCity = getListingCity(property);
                if (!this.matchesCityValue(propertyCity)) {
                    return [];
                }

                const cardOptions = this.cityBrowseCardOptions;

                const wholeBuildingCards = getWholeBuildingListings(property)
                    .filter((building) => (
                        this.matchesBedroomFilter(building)
                        && this.matchesBathroomFilter(building)
                        && buildingMatchesSearch(building, query, property)
                    ))
                    .map((building) => ({
                        ...mapWholeBuildingToPropertyCard(building, property, cardOptions),
                        cardKey: `building-${building.id}`,
                    }));

                const unitCards = (property.units || [])
                    .filter((unit) => (
                        this.matchesUnitTypeFilter(unit)
                        && this.matchesBedroomFilter(unit)
                        && this.matchesBathroomFilter(unit)
                        && unitMatchesSearch(unit, query, property)
                    ))
                    .map((unit) => ({
                        ...mapUnitToPropertyCard(unit, property, cardOptions),
                        cardKey: `unit-${unit.id}`,
                    }));

                return [...wholeBuildingCards, ...unitCards];
            });
        },
        filteredUnitCards() {
            const query = this.searchQuery.trim();

            return this.filteredUnits.map((unit) => ({
                ...this.mapListingUnit(unit),
                cardKey: unit.listing_kind === 'whole_building'
                    ? `building-${unit.id}`
                    : `unit-${unit.id}`,
            }));
        },
        filteredPropertyCards() {
            return [...this.filteredPrivateListingCards, ...this.filteredUnitCards];
        },
        visibleCountClamped() {
            const total = this.filteredPropertyCards.length;
            if (!total) return 0;
            return Math.min(this.visibleCount || this.recordsPerPage, total);
        },
        visiblePropertyCards() {
            return this.filteredPropertyCards.slice(0, this.visibleCountClamped);
        },
        hasMoreListings() {
            return this.visibleCountClamped < this.filteredPropertyCards.length;
        },
        filteredUnits() {
            const query = this.searchQuery.trim();

            return this.units.filter((unit) => (
                this.matchesCityFilter(unit)
                && this.matchesUnitTypeFilter(unit)
                && this.matchesBedroomFilter(unit)
                && this.matchesBathroomFilter(unit)
                && this.matchesUnitSearchFilter(unit, query)
            ));
        },
        allCitiesSelected() {
            return this.availableCities.length > 0
                && this.selectedCities.length === this.availableCities.length;
        },
        someCitiesSelected() {
            return this.selectedCities.length > 0
                && this.selectedCities.length < this.availableCities.length;
        },
        allUnitTypesSelected() {
            return this.availableUnitTypes.length > 0
                && this.selectedUnitTypes.length === this.availableUnitTypes.length;
        },
        someUnitTypesSelected() {
            return this.selectedUnitTypes.length > 0
                && this.selectedUnitTypes.length < this.availableUnitTypes.length;
        },
        allBedroomsSelected() {
            return this.availableBedrooms.length > 0
                && this.selectedBedrooms.length === this.availableBedrooms.length;
        },
        someBedroomsSelected() {
            return this.selectedBedrooms.length > 0
                && this.selectedBedrooms.length < this.availableBedrooms.length;
        },
        allBathroomsSelected() {
            return this.availableBathrooms.length > 0
                && this.selectedBathrooms.length === this.availableBathrooms.length;
        },
        someBathroomsSelected() {
            return this.selectedBathrooms.length > 0
                && this.selectedBathrooms.length < this.availableBathrooms.length;
        },
    },
    watch: {
        '$route.fullPath'() {
            if (!this.loading) {
                this.applyRouteCityFilter();
                this.resetVisibleListings();
                this.clearLegacyPageQuery();
                this.updateCityPageMeta();
            }
        },
        selectedCities: 'onListingFiltersChanged',
        availableCities: 'syncAllCitiesIndeterminate',
        selectedUnitTypes: 'onListingFiltersChanged',
        availableUnitTypes: 'syncAllUnitTypesIndeterminate',
        selectedBedrooms: 'onListingFiltersChanged',
        availableBedrooms: 'syncAllBedroomsIndeterminate',
        selectedBathrooms: 'onListingFiltersChanged',
        availableBathrooms: 'syncAllBathroomsIndeterminate',
        recordsPerPage(size) {
            this.visibleCount = size;
        },
    },
    mounted() {
        this.loadProperties();
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
        this.syncAllUnitTypesIndeterminate();
        this.syncAllBedroomsIndeterminate();
        this.syncAllBathroomsIndeterminate();
    },
    methods: {
        applyRouteCityFilter() {
            if (this.isCityBrowsePage) {
                const city = resolveCityFromSlug(this.routeCitySlug, this.availableCities);
                const nextCities = city ? [city] : [];
                if (
                    this.selectedCities.length !== nextCities.length
                    || this.selectedCities[0] !== nextCities[0]
                ) {
                    this.syncingRouteFilters = true;
                    this.selectedCities = nextCities;
                    this.$nextTick(() => {
                        this.syncingRouteFilters = false;
                    });
                }
                return;
            }

            if (this.selectedCities.length) {
                this.syncingRouteFilters = true;
                this.selectedCities = [];
                this.$nextTick(() => {
                    this.syncingRouteFilters = false;
                });
            }
        },
        updateCityPageMeta() {
            const canonical = getSiteUrl(this.$route.path);

            if (this.isCityBrowsePage && !this.routeCityName) {
                updatePageMeta({
                    title: 'Location Not Found | Mr. Boss Realty',
                    description: 'Browse all properties with Mr. Boss Realty.',
                    canonical,
                    robots: 'noindex, follow',
                });
                return;
            }

            if (!this.isCityBrowsePage) {
                updatePageMeta({
                    title: 'Properties for Sale and Rent | Mr. Boss Realty',
                    description: 'Explore condominiums and residential developments across the Philippines with Mr. Boss Realty.',
                    canonical,
                });
                return;
            }

            const city = this.routeCityName;
            updatePageMeta({
                title: `Properties in ${city} | Mr. Boss Realty`,
                description: `Browse condominiums, houses, and rental properties in ${city} with Mr. Boss Realty.`,
                canonical,
            });
        },
        clearLegacyPageQuery() {
            if (!this.$route.query.page) return;
            const query = { ...this.$route.query };
            delete query.page;
            this.$router.replace({ path: this.$route.path, query }).catch(() => {});
        },
        resetVisibleListings() {
            this.visibleCount = this.recordsPerPage;
        },
        loadMoreListings() {
            if (!this.hasMoreListings) return;
            this.visibleCount = Math.min(
                this.visibleCountClamped + this.recordsPerPage,
                this.filteredPropertyCards.length,
            );
        },
        scrollToListings() {
            this.$nextTick(() => {
                this.$refs.listingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        },
        onListingFiltersChanged() {
            this.syncAllCitiesIndeterminate();
            this.syncAllUnitTypesIndeterminate();
            this.syncAllBedroomsIndeterminate();
            this.syncAllBathroomsIndeterminate();
            if (!this.syncingRouteFilters) {
                this.resetVisibleListings();
            }
        },
        countPropertyListings(property) {
            return countPropertyListingsForProject(property);
        },
        getUnitCity(unit) {
            return getListingCity({ city: unit.project_city });
        },
        mapListingUnit(item) {
            const options = this.cityBrowseCardOptions;

            if (item.listing_kind === 'whole_building') {
                return mapPublicWholeBuildingToPropertyCard(item, options);
            }

            return mapPublicUnitToPropertyCard(item, options);
        },
        isSelectedCount(value, selectedValues) {
            return selectedValues.some((selected) => Number(selected) === Number(value));
        },
        matchesCityValue(city) {
            const normalizedCity = (city || '').trim();

            if (this.isCityBrowsePage) {
                if (!this.routeCitySlug || !normalizedCity) return false;
                return cityToSlug(normalizedCity) === this.routeCitySlug;
            }

            if (!this.availableCities.length || !this.selectedCities.length || this.allCitiesSelected) {
                return true;
            }

            return this.selectedCities.includes(normalizedCity);
        },
        matchesCityFilter(unit) {
            return this.matchesCityValue(this.getUnitCity(unit));
        },
        matchesWholeBuildingSearch(building, query) {
            return buildingMatchesSearch(building, query);
        },
        matchesUnitTypeFilter(unit) {
            if (unit.listing_kind === 'whole_building') return true;

            if (!this.availableUnitTypes.length || !this.selectedUnitTypes.length || this.allUnitTypesSelected) {
                return true;
            }

            return this.selectedUnitTypes.includes(unit.unit_type);
        },
        matchesBedroomFilter(item) {
            if (item.listing_kind === 'whole_building') return true;

            if (!this.availableBedrooms.length || !this.selectedBedrooms.length || this.allBedroomsSelected) {
                return true;
            }

            if (item.bedrooms == null) return false;
            return this.isSelectedCount(item.bedrooms, this.selectedBedrooms);
        },
        matchesBathroomFilter(item) {
            if (item.listing_kind === 'whole_building') return true;

            if (!this.availableBathrooms.length || !this.selectedBathrooms.length || this.allBathroomsSelected) {
                return true;
            }

            if (item.bathrooms == null) return false;
            return this.isSelectedCount(item.bathrooms, this.selectedBathrooms);
        },
        matchesUnitSearchFilter(unit, query) {
            if (unit.listing_kind === 'whole_building') {
                return this.matchesWholeBuildingSearch(unit, query);
            }

            return unitMatchesSearch(unit, query);
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
        syncAllUnitTypesIndeterminate() {
            const checkbox = this.$refs.allUnitTypesCheckbox;
            if (!checkbox) return;
            checkbox.indeterminate = this.someUnitTypesSelected;
        },
        syncAllBedroomsIndeterminate() {
            const checkbox = this.$refs.allBedroomsCheckbox;
            if (!checkbox) return;
            checkbox.indeterminate = this.someBedroomsSelected;
        },
        syncAllBathroomsIndeterminate() {
            const checkbox = this.$refs.allBathroomsCheckbox;
            if (!checkbox) return;
            checkbox.indeterminate = this.someBathroomsSelected;
        },
        toggleAllCities() {
            if (this.allCitiesSelected) {
                this.selectedCities = [];
            } else {
                this.selectedCities = [...this.availableCities];
            }
        },
        toggleAllUnitTypes() {
            if (this.allUnitTypesSelected) {
                this.selectedUnitTypes = [];
            } else {
                this.selectedUnitTypes = [...this.availableUnitTypes];
            }
        },
        toggleAllBedrooms() {
            if (this.allBedroomsSelected) {
                this.selectedBedrooms = [];
            } else {
                this.selectedBedrooms = [...this.availableBedrooms];
            }
        },
        toggleAllBathrooms() {
            if (this.allBathroomsSelected) {
                this.selectedBathrooms = [];
            } else {
                this.selectedBathrooms = [...this.availableBathrooms];
            }
        },
        resetAllFilters() {
            this.selectedCities = [];
            this.selectedUnitTypes = [];
            this.selectedBedrooms = [];
            this.selectedBathrooms = [];
            this.searchDraft = '';
            this.searchQuery = '';
            this.resetVisibleListings();
        },
        async loadProperties() {
            this.loading = true;
            this.error = '';
            this.privateProperties = [];
            this.units = [];
            this.selectedCities = [];
            this.selectedUnitTypes = [];
            this.selectedBedrooms = [];
            this.selectedBathrooms = [];
            this.searchDraft = '';
            this.searchQuery = '';

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
                console.error('Failed to load properties:', err);
                this.error = 'Could not load properties right now. Please try again.';
                this.privateProperties = [];
                this.units = [];
            } finally {
                this.loading = false;
                this.$nextTick(() => {
                    this.applyRouteCityFilter();
                    this.clearLegacyPageQuery();
                    this.updateCityPageMeta();
                    flushPendingScrollRestore();
                });
            }
        },
    },
};
</script>
