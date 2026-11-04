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
                    <p>{{ isLotsBrowsePage ? 'Loading lots...' : 'Loading properties...' }}</p>
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
                    <p v-if="isLotsBrowsePage">No lots are listed yet. Please check back soon.</p>
                    <p v-else>No properties are listed yet. Please check back soon.</p>
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
                                        {{ filteredListingCount }} propert{{ filteredListingCount === 1 ? 'y' : 'ies' }} in {{ routeCityName }}
                                    </template>
                                    <template v-else-if="filteredListingCount !== totalListingCount">
                                        Showing {{ filteredListingCount }} of {{ totalListingCount }}
                                        {{ isLotsBrowsePage ? (totalListingCount === 1 ? 'lot' : 'lots') : 'properties' }}
                                    </template>
                                    <template v-else>
                                        {{ totalListingCount }}
                                        {{ isLotsBrowsePage
                                            ? (totalListingCount === 1 ? 'lot' : 'lots')
                                            : (totalListingCount === 1 ? 'property' : 'properties') }}
                                        available
                                    </template>
                                </p>
                            </div>
                        </div>

                        <div class="property-detail__units-search site-search site-search--light">
                            <label class="visually-hidden" for="properties-search">
                                {{ isLotsBrowsePage ? 'Search lots' : 'Search properties' }}
                            </label>
                            <input
                                id="properties-search"
                                ref="searchInput"
                                v-model="searchDraft"
                                type="search"
                                class="form-control site-search__input"
                                :placeholder="isLotsBrowsePage ? 'Search lot...' : 'Search property...'"
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

                        <div class="properties-page__listing-flow">
                            <div
                                v-if="hasListingFilters"
                                ref="filtersToggleSentinel"
                                class="properties-page__filters-sentinel"
                                aria-hidden="true"
                            ></div>
                            <aside
                                v-if="hasListingFilters"
                                class="property-detail__filters"
                                :class="{
                                    'property-detail__filters--open': filtersExpanded,
                                    'property-detail__filters--stuck': filtersToggleStuck,
                                }"
                                aria-label="Filter properties"
                            >
                                <div class="property-detail__filters-shell">
                                    <div class="property-detail__filters-bar">
                                        <button
                                            type="button"
                                            class="property-detail__filters-toggle"
                                            :aria-expanded="filtersExpanded ? 'true' : 'false'"
                                            aria-controls="property-listing-filters"
                                            @click="filtersExpanded = !filtersExpanded"
                                        >
                                            <span class="property-detail__filters-toggle-label">
                                                <i class="ti ti-filter" aria-hidden="true"></i>
                                                <span>Filters</span>
                                                <span
                                                    v-if="activeFilterCount"
                                                    class="property-detail__filters-toggle-count"
                                                >{{ activeFilterCount }}</span>
                                            </span>
                                        </button>
                                        <button
                                            v-if="activeFilterCount"
                                            type="button"
                                            class="property-detail__filters-clear"
                                            @click="resetAllFilters"
                                        >
                                            Clear
                                        </button>
                                        <button
                                            type="button"
                                            class="property-detail__filters-chevron"
                                            :aria-expanded="filtersExpanded ? 'true' : 'false'"
                                            aria-controls="property-listing-filters"
                                            aria-label="Toggle filters"
                                            @click="filtersExpanded = !filtersExpanded"
                                        >
                                            <i
                                                class="ti"
                                                :class="filtersExpanded ? 'ti-chevron-up' : 'ti-chevron-down'"
                                                aria-hidden="true"
                                            ></i>
                                        </button>
                                    </div>
                                </div>
                                <div id="property-listing-filters" class="property-detail__filters-panel">
                                    <div class="property-detail__filters-panel-inner">
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
                                    </div>
                                </div>
                            </aside>

                            <div
                                class="property-detail__units-main"
                                :class="{ 'property-detail__units-main--loading': listLoading }"
                                :aria-busy="listLoading ? 'true' : undefined"
                            >
                                <div
                                    v-if="listLoading"
                                    class="properties-page__list-loading"
                                    aria-live="polite"
                                >
                                    <div class="properties-page__spinner" aria-hidden="true"></div>
                                    <span class="visually-hidden">
                                        {{ isLotsBrowsePage ? 'Loading lots...' : 'Loading properties...' }}
                                    </span>
                                </div>
                                <template v-if="filteredPropertyCards.length">
                                    <div class="property-grid">
                                        <PropertyCard
                                            v-for="(property, index) in paginatedPropertyCards"
                                            :key="property.cardKey"
                                            :property="property"
                                            :image-loading="index < 3 ? 'eager' : 'lazy'"
                                            :fetch-priority="index === 0 ? 'high' : 'auto'"
                                            :show-interest-button="true"
                                        />
                                    </div>
                                    <nav
                                        v-if="totalPages > 1"
                                        ref="listingPagination"
                                        class="properties-page__pagination"
                                        :class="{ 'properties-page__pagination--compact': paginationPageWindow < 7 }"
                                        aria-label="Property listing pages"
                                    >
                                        <router-link
                                            class="properties-page__pagination-link"
                                            :class="{ 'properties-page__pagination-link--disabled': currentPage === 1 }"
                                            :to="pageLocation(Math.max(1, currentPage - 1))"
                                            :aria-disabled="currentPage === 1 ? 'true' : undefined"
                                            @click.prevent="setPage(Math.max(1, currentPage - 1))"
                                        >
                                            <i class="ti ti-chevron-left" aria-hidden="true"></i>
                                            <span>Previous</span>
                                        </router-link>
                                        <div class="properties-page__pagination-pages">
                                            <router-link
                                                v-for="page in visiblePageNumbers"
                                                :key="page"
                                                class="properties-page__pagination-link properties-page__pagination-link--number"
                                                :class="{ 'properties-page__pagination-link--active': page === currentPage }"
                                                :to="pageLocation(page)"
                                                :aria-current="page === currentPage ? 'page' : undefined"
                                                @click.prevent="setPage(page)"
                                            >
                                                {{ page }}
                                            </router-link>
                                        </div>
                                        <router-link
                                            class="properties-page__pagination-link"
                                            :class="{ 'properties-page__pagination-link--disabled': currentPage === totalPages }"
                                            :to="pageLocation(Math.min(totalPages, currentPage + 1))"
                                            :aria-disabled="currentPage === totalPages ? 'true' : undefined"
                                            @click.prevent="setPage(Math.min(totalPages, currentPage + 1))"
                                        >
                                            <span>Next</span>
                                            <i class="ti ti-chevron-right" aria-hidden="true"></i>
                                        </router-link>
                                        <span class="properties-page__pagination-status">
                                            {{ paginationRangeTo }} of {{ filteredListingCount }}
                                        </span>
                                    </nav>
                                </template>
                                <p v-else-if="!listLoading" class="property-detail__filters-empty">
                                    {{ isLotsBrowsePage ? 'No lots match your search or filters.' : 'No properties match your search or filters.' }}
                                    <button type="button" class="property-detail__filters-reset" @click="resetAllFilters">
                                        Show all
                                    </button>
                                </p>
                            </div>
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
import { isLotBuildingType, isLotListing } from '@/constants/lotListings';
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
            currentPage: 1,
            paginationPageWindow: 7,
            filtersExpanded: false,
            filtersToggleStuck: false,
            listingTotal: 0,
            unfilteredTotal: 0,
            listLoading: false,
            facets: {
                cities: [],
                unit_types: [],
                bedrooms: [],
                bathrooms: [],
            },
            syncingRouteFilters: false,
            _searchTimer: null,
            heroImageUrl,
        };
    },
    computed: {
        isLotsBrowsePage() {
            return this.$route.name === 'lots'
                || this.$route.meta?.listingCategory === 'lots';
        },
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
            if (this.isLotsBrowsePage) {
                return 'Land & Lots';
            }
            if (this.isCityBrowsePage && this.routeCityName) {
                return `Properties in ${this.routeCityName}`;
            }
            return 'Properties';
        },
        heroLead() {
            if (this.isLotsBrowsePage) {
                return 'Browse residential, commercial, and agricultural lots available for sale or lease across the Philippines.';
            }
            if (this.isCityBrowsePage && this.routeCityName) {
                return `Browse available listings in ${this.routeCityName}—condominiums, houses, lots, and rental properties.`;
            }

            return 'Browse our trusted developments across the Philippines—from pre-selling condominiums and ready-for-occupancy units to lots and rental properties.';
        },
        sectionTitle() {
            if (this.isLotsBrowsePage) {
                return 'Available Lots';
            }
            if (this.isCityBrowsePage && this.routeCityName) {
                return `Properties in ${this.routeCityName}`;
            }
            return 'All Properties';
        },
        scopedPrivateProperties() {
            if (!this.isLotsBrowsePage) {
                return this.privateProperties;
            }

            return this.privateProperties
                .map((property) => {
                    const buildings = getWholeBuildingListings(property)
                        .filter((building) => isLotBuildingType(building.building_type));
                    const units = (property.units || [])
                        .filter((unit) => isLotBuildingType(unit.building_type));

                    if (!buildings.length && !units.length) {
                        return null;
                    }

                    return {
                        ...property,
                        buildings: (property.buildings || []).filter((building) => (
                            building.is_whole_property_listing
                                ? isLotBuildingType(building.building_type)
                                : false
                        )),
                        units,
                        _lotWholeBuildings: buildings,
                    };
                })
                .filter(Boolean);
        },
        scopedUnits() {
            if (!this.isLotsBrowsePage) {
                return this.units;
            }

            return this.units.filter((unit) => isLotListing(unit));
        },
        totalListingCount() {
            return this.unfilteredTotal;
        },
        filteredListingCount() {
            return this.listingTotal;
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
            return this.facets.cities.map((city) => city.name);
        },
        cityCounts() {
            return Object.fromEntries(this.facets.cities.map((city) => [city.name, city.count]));
        },
        availableUnitTypes() {
            return this.facets.unit_types.map((type) => type.name);
        },
        unitTypeCounts() {
            return Object.fromEntries(this.facets.unit_types.map((type) => [type.name, type.count]));
        },
        availableBedrooms() {
            return this.facets.bedrooms.map((item) => item.value);
        },
        bedroomCounts() {
            return Object.fromEntries(this.facets.bedrooms.map((item) => [item.value, item.count]));
        },
        availableBathrooms() {
            return this.facets.bathrooms.map((item) => item.value);
        },
        bathroomCounts() {
            return Object.fromEntries(this.facets.bathrooms.map((item) => [item.value, item.count]));
        },
        filteredPrivateListingCards() {
            const query = this.searchQuery.trim();

            return this.scopedPrivateProperties.flatMap((property) => {
                const propertyCity = getListingCity(property);
                if (!this.matchesCityValue(propertyCity)) {
                    return [];
                }

                const cardOptions = this.cityBrowseCardOptions;

                const wholeBuildingCards = getWholeBuildingListings(property)
                    .filter((building) => (
                        this.matchesLotCategory(building)
                        && this.matchesBedroomFilter(building)
                        && this.matchesBathroomFilter(building)
                        && buildingMatchesSearch(building, query, property)
                    ))
                    .map((building) => ({
                        ...mapWholeBuildingToPropertyCard(building, property, cardOptions),
                        cardKey: `building-${building.id}`,
                    }));

                const unitCards = (property.units || [])
                    .filter((unit) => (
                        this.matchesLotCategory(unit)
                        && this.matchesUnitTypeFilter(unit)
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
            return this.scopedUnits.map((unit) => ({
                ...this.mapListingUnit(unit),
                cardKey: unit.listing_kind === 'whole_building'
                    ? `building-${unit.id}`
                    : `unit-${unit.id}`,
            }));
        },
        totalPages() {
            return Math.max(1, Math.ceil(this.listingTotal / this.recordsPerPage));
        },
        paginatedPropertyCards() {
            return this.filteredPropertyCards;
        },
        paginationRangeTo() {
            if (!this.listingTotal) return 0;
            return Math.min(this.currentPage * this.recordsPerPage, this.listingTotal);
        },
        visiblePageNumbers() {
            const maxVisible = this.paginationPageWindow;
            const half = Math.floor(maxVisible / 2);
            let start = Math.max(1, this.currentPage - half);
            const end = Math.min(this.totalPages, start + maxVisible - 1);
            start = Math.max(1, end - maxVisible + 1);
            return Array.from({ length: end - start + 1 }, (_, index) => start + index);
        },
        filteredUnits() {
            const query = this.searchQuery.trim();

            return this.scopedUnits.filter((unit) => (
                this.matchesLotCategory(unit)
                && this.matchesCityFilter(unit)
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
        activeFilterCount() {
            let count = 0;

            if (this.showCityFilter && this.someCitiesSelected) {
                count += this.selectedCities.length;
            }
            if (this.availableUnitTypes.length && this.someUnitTypesSelected) {
                count += this.selectedUnitTypes.length;
            }
            if (this.availableBedrooms.length && this.someBedroomsSelected) {
                count += this.selectedBedrooms.length;
            }
            if (this.availableBathrooms.length && this.someBathroomsSelected) {
                count += this.selectedBathrooms.length;
            }

            return count;
        },
    },
    watch: {
        '$route.fullPath'() {
            if (this.loading) return;
            const previousPage = this.currentPage;
            const previousPath = this._listingPath;
            const previousQuerySignature = this._listingQuerySignature;
            const pathChanged = this.$route.path !== previousPath;
            const queryChanged = this.listingQuerySignature(this.$route.query) !== previousQuerySignature;

            if (pathChanged || queryChanged) {
                this.syncFiltersFromRoute();
            }
            this.syncPageFromRoute();
            this.updateCityPageMeta();
            this._listingPath = this.$route.path;
            this._listingQuerySignature = this.listingQuerySignature(this.$route.query);

            if (pathChanged || queryChanged || this.currentPage !== previousPage || this._fetchOnPageReset) {
                this._fetchOnPageReset = false;
                this.fetchListing();
            }
        },
        isLotsBrowsePage() {
            if (this.loading) return;
            this.resetAllFilters();
            this.updateCityPageMeta();
        },
        selectedCities: 'onListingFiltersChanged',
        availableCities: 'syncAllCitiesIndeterminate',
        selectedUnitTypes: 'onListingFiltersChanged',
        availableUnitTypes: 'syncAllUnitTypesIndeterminate',
        selectedBedrooms: 'onListingFiltersChanged',
        availableBedrooms: 'syncAllBedroomsIndeterminate',
        selectedBathrooms: 'onListingFiltersChanged',
        availableBathrooms: 'syncAllBathroomsIndeterminate',
        totalPages(total) {
            if (this.currentPage > total) {
                this.setPage(total, { replace: true, scroll: false });
            }
        },
    },
    created() {
        this.paginationPageWindow = this.paginationWindowForWidth(
            typeof window === 'undefined' ? 1200 : window.innerWidth,
        );
    },
    mounted() {
        this.observePaginationLayout();
        this.bindFiltersToggleScroll();
        this.observeFiltersToggle();
        this.loadProperties();
    },
    beforeUnmount() {
        if (this._searchTimer) {
            window.clearTimeout(this._searchTimer);
            this._searchTimer = null;
        }
        this._paginationResizeObserver?.disconnect();
        this._paginationResizeObserver = null;
        this._paginationObservedEl = null;
        this._filtersToggleObserver?.disconnect();
        this._filtersToggleObserver = null;
        this._filtersToggleObservedEl = null;
        if (this._filtersToggleScrollBound) {
            document.body.removeEventListener('scroll', this._filtersToggleScrollBound);
            window.removeEventListener('scroll', this._filtersToggleScrollBound);
            window.removeEventListener('resize', this._filtersToggleScrollBound);
            this._filtersToggleScrollBound = null;
        }
        if (this._filtersToggleRaf) {
            cancelAnimationFrame(this._filtersToggleRaf);
            this._filtersToggleRaf = 0;
        }
        if (this._listingFetchTimer) {
            window.clearTimeout(this._listingFetchTimer);
            this._listingFetchTimer = null;
        }
    },
    activated() {
        flushPendingScrollRestore();
    },
    updated() {
        this.observePaginationLayout();
        this.observeFiltersToggle();
        this.syncAllCitiesIndeterminate();
        this.syncAllUnitTypesIndeterminate();
        this.syncAllBedroomsIndeterminate();
        this.syncAllBathroomsIndeterminate();
    },
    methods: {
        parseQueryList(value) {
            if (Array.isArray(value)) {
                return value
                    .flatMap((entry) => String(entry).split('|'))
                    .map((entry) => entry.trim())
                    .filter(Boolean);
            }
            if (value == null || value === '') return [];
            return String(value)
                .split('|')
                .map((entry) => entry.trim())
                .filter(Boolean);
        },
        parseQueryNumbers(value) {
            return this.parseQueryList(value)
                .map((entry) => Number(entry))
                .filter((entry) => Number.isFinite(entry));
        },
        sameStringList(left, right) {
            if (left.length !== right.length) return false;
            return left.every((value, index) => value === right[index]);
        },
        sameNumberList(left, right) {
            if (left.length !== right.length) return false;
            return left.every((value, index) => Number(value) === Number(right[index]));
        },
        listingRouteQuery(page = this.currentPage) {
            const query = {};
            if (page > 1) {
                query.page = String(page);
            }

            const search = this.searchQuery.trim();
            if (search) {
                query.q = search;
            }

            if (this.showCityFilter && this.selectedCities.length && !this.allCitiesSelected) {
                query.cities = this.selectedCities.join('|');
            }
            if (this.selectedUnitTypes.length && !this.allUnitTypesSelected) {
                query.unit_types = this.selectedUnitTypes.join('|');
            }
            if (this.selectedBedrooms.length && !this.allBedroomsSelected) {
                query.bedrooms = this.selectedBedrooms.join('|');
            }
            if (this.selectedBathrooms.length && !this.allBathroomsSelected) {
                query.bathrooms = this.selectedBathrooms.join('|');
            }

            return query;
        },
        listingQuerySignature(query = {}) {
            const keys = ['page', 'q', 'cities', 'unit_types', 'bedrooms', 'bathrooms'];
            return keys
                .map((key) => {
                    const raw = query[key];
                    if (raw == null || raw === '') return `${key}=`;
                    if (Array.isArray(raw)) {
                        return `${key}=${raw.map((entry) => String(entry).trim()).filter(Boolean).join('|')}`;
                    }
                    return `${key}=${String(raw).trim()}`;
                })
                .join('&');
        },
        listingCanonicalUrl() {
            const query = this.listingRouteQuery(this.currentPage);
            const base = getSiteUrl(this.$route.path);
            const params = new URLSearchParams();
            Object.entries(query).forEach(([key, value]) => {
                if (value != null && value !== '') {
                    params.set(key, String(value));
                }
            });
            const search = params.toString();
            return search ? `${base}?${search}` : base;
        },
        syncFiltersFromRoute() {
            const query = this.$route.query;
            const nextSearch = String(query.q || '').trim();
            const nextUnitTypes = this.parseQueryList(query.unit_types);
            const nextBedrooms = this.parseQueryNumbers(query.bedrooms);
            const nextBathrooms = this.parseQueryNumbers(query.bathrooms);
            let nextCities = [];

            if (this.isCityBrowsePage) {
                const city = resolveCityFromSlug(this.routeCitySlug, this.availableCities);
                nextCities = city ? [city] : [];
            } else {
                nextCities = this.parseQueryList(query.cities);
            }

            const citiesChanged = !this.sameStringList(this.selectedCities, nextCities);
            const unitTypesChanged = !this.sameStringList(this.selectedUnitTypes, nextUnitTypes);
            const bedroomsChanged = !this.sameNumberList(this.selectedBedrooms, nextBedrooms);
            const bathroomsChanged = !this.sameNumberList(this.selectedBathrooms, nextBathrooms);
            const searchChanged = this.searchQuery !== nextSearch || this.searchDraft !== nextSearch;

            if (
                !citiesChanged
                && !unitTypesChanged
                && !bedroomsChanged
                && !bathroomsChanged
                && !searchChanged
            ) {
                return;
            }

            this.syncingRouteFilters = true;
            if (citiesChanged) this.selectedCities = nextCities;
            if (unitTypesChanged) this.selectedUnitTypes = nextUnitTypes;
            if (bedroomsChanged) this.selectedBedrooms = nextBedrooms;
            if (bathroomsChanged) this.selectedBathrooms = nextBathrooms;
            if (searchChanged) {
                this.searchQuery = nextSearch;
                this.searchDraft = nextSearch;
            }
            this.$nextTick(() => {
                this.syncingRouteFilters = false;
            });
        },
        updateCityPageMeta() {
            const pageSuffix = this.currentPage > 1 ? ` – Page ${this.currentPage}` : '';
            const canonical = this.listingCanonicalUrl();

            if (this.isCityBrowsePage && !this.routeCityName) {
                updatePageMeta({
                    title: 'Location Not Found | Mr. Boss Realty',
                    description: 'Browse all properties with Mr. Boss Realty.',
                    canonical,
                    robots: 'noindex, follow',
                });
                return;
            }

            if (this.isLotsBrowsePage) {
                updatePageMeta({
                    title: `Land & Lots${pageSuffix} | Mr. Boss Realty`,
                    description:
                        `Browse residential, commercial, and agricultural lots for sale and lease across the Philippines with Mr. Boss Realty${pageSuffix}.`,
                    canonical,
                });
                return;
            }

            if (!this.isCityBrowsePage) {
                updatePageMeta({
                    title: `Properties for Sale and Rent${pageSuffix} | Mr. Boss Realty`,
                    description: `Explore condominiums and residential developments across the Philippines with Mr. Boss Realty${pageSuffix}.`,
                    canonical,
                });
                return;
            }

            const city = this.routeCityName;
            updatePageMeta({
                title: `Properties in ${city}${pageSuffix} | Mr. Boss Realty`,
                description: `Browse condominiums, houses, and rental properties in ${city} with Mr. Boss Realty${pageSuffix}.`,
                canonical,
            });
        },
        syncPageFromRoute({ clamp = true } = {}) {
            const requested = Number.parseInt(this.$route.query.page, 10);
            const hasRequestedPage = Number.isInteger(requested) && requested > 0;
            const nextPage = hasRequestedPage
                ? (clamp ? Math.min(requested, this.totalPages) : requested)
                : 1;
            this.currentPage = nextPage;
            if (clamp && hasRequestedPage && requested !== nextPage) {
                this.setPage(nextPage, { replace: true, scroll: false });
            }
        },
        pageLocation(page) {
            return {
                path: this.$route.path,
                query: this.listingRouteQuery(page),
            };
        },
        setPage(page, { replace = false, scroll = true } = {}) {
            const nextPage = Math.min(Math.max(1, page), this.totalPages);
            const location = this.pageLocation(nextPage);
            const navigation = replace ? this.$router.replace(location) : this.$router.push(location);
            if (scroll) {
                navigation.then(() => this.scrollToListings()).catch(() => {});
            } else {
                navigation.catch(() => {});
            }
        },
        resetPage() {
            if (this.currentPage !== 1 || this.$route.query.page) {
                this.setPage(1, { replace: true, scroll: false });
            }
        },
        paginationWindowForWidth(width) {
            if (width < 420) return 3;
            if (width < 680) return 5;
            return 7;
        },
        applyPaginationWindow(width) {
            if (!width) return;
            const next = this.paginationWindowForWidth(width);
            if (next !== this.paginationPageWindow) {
                this.paginationPageWindow = next;
            }
        },
        bindFiltersToggleScroll() {
            if (this._filtersToggleScrollBound) return;

            this._filtersToggleScrollBound = () => {
                if (this._filtersToggleRaf) return;
                this._filtersToggleRaf = window.requestAnimationFrame(() => {
                    this._filtersToggleRaf = 0;
                    this.syncFiltersToggleStuck();
                });
            };
            document.body.addEventListener('scroll', this._filtersToggleScrollBound, { passive: true });
            window.addEventListener('scroll', this._filtersToggleScrollBound, { passive: true });
            window.addEventListener('resize', this._filtersToggleScrollBound, { passive: true });
        },
        syncFiltersToggleStuck() {
            const sentinel = this.$refs.filtersToggleSentinel;
            if (!sentinel || window.innerWidth > 767.98) {
                if (this.filtersToggleStuck) this.filtersToggleStuck = false;
                return;
            }

            const header = document.querySelector('.site-header');
            const headerBottom = header ? header.getBoundingClientRect().bottom : 80;
            const stuck = sentinel.getBoundingClientRect().top < headerBottom - 0.5;
            if (stuck !== this.filtersToggleStuck) {
                this.filtersToggleStuck = stuck;
            }
        },
        observeFiltersToggle() {
            const sentinel = this.$refs.filtersToggleSentinel;
            if (!sentinel || typeof IntersectionObserver === 'undefined') {
                this.syncFiltersToggleStuck();
                return;
            }
            if (this._filtersToggleObservedEl === sentinel) {
                this.syncFiltersToggleStuck();
                return;
            }

            this._filtersToggleObserver?.disconnect();
            const header = document.querySelector('.site-header');
            const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 80;
            this._filtersToggleObserver = new IntersectionObserver(() => {
                this.syncFiltersToggleStuck();
            }, {
                root: null,
                threshold: [0, 1],
                rootMargin: `-${headerHeight}px 0px 0px 0px`,
            });
            this._filtersToggleObserver.observe(sentinel);
            this._filtersToggleObservedEl = sentinel;
            this.syncFiltersToggleStuck();
        },
        observePaginationLayout() {
            const el = this.$refs.listingPagination;
            if (!el || typeof ResizeObserver === 'undefined') return;

            if (!this._paginationResizeObserver) {
                this._paginationResizeObserver = new ResizeObserver((entries) => {
                    this.applyPaginationWindow(entries[0]?.contentRect?.width || 0);
                });
            }

            if (this._paginationObservedEl !== el) {
                if (this._paginationObservedEl) {
                    this._paginationResizeObserver.unobserve(this._paginationObservedEl);
                }
                this._paginationResizeObserver.observe(el);
                this._paginationObservedEl = el;
            }

            this.applyPaginationWindow(el.clientWidth);
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
                this.scheduleListingFetch();
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
        matchesLotCategory(item) {
            if (!this.isLotsBrowsePage) return true;
            return isLotListing(item) || isLotBuildingType(item.building_type);
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
            this.scheduleListingFetch();
            this.$refs.searchInput?.focus();
        },
        onSearchInput() {
            if (this._searchTimer) {
                window.clearTimeout(this._searchTimer);
            }
            this._searchTimer = window.setTimeout(() => {
                this.searchQuery = this.searchDraft.trim();
                this.scheduleListingFetch();
            }, 200);
        },
        clearSearch() {
            if (this._searchTimer) {
                window.clearTimeout(this._searchTimer);
                this._searchTimer = null;
            }
            this.searchDraft = '';
            this.searchQuery = '';
            this.scheduleListingFetch();
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
            this.selectedUnitTypes = [];
            this.selectedBedrooms = [];
            this.selectedBathrooms = [];
            this.searchDraft = '';
            this.searchQuery = '';

            if (this.isCityBrowsePage) {
                const city = resolveCityFromSlug(this.routeCitySlug, this.availableCities);
                this.selectedCities = city ? [city] : [];
            } else {
                this.selectedCities = [];
            }

            this.scheduleListingFetch();
        },
        async loadProperties() {
            this.loading = true;
            this.error = '';
            this.privateProperties = [];
            this.units = [];
            this.listingTotal = 0;
            this.unfilteredTotal = 0;
            this.selectedCities = [];
            this.selectedUnitTypes = [];
            this.selectedBedrooms = [];
            this.selectedBathrooms = [];
            this.searchDraft = '';
            this.searchQuery = '';

            try {
                const websiteSettings = await loadWebsiteSettings();
                this.recordsPerPage = websiteSettings.property_page_records_per_page;
                this._listingPath = this.$route.path;
                this.syncFiltersFromRoute();
                this.syncPageFromRoute({ clamp: false });
                this._listingQuerySignature = this.listingQuerySignature(this.$route.query);
                await this.fetchListing();
            } catch (err) {
                console.error('Failed to load properties:', err);
                this.error = 'Could not load properties right now. Please try again.';
                this.privateProperties = [];
                this.units = [];
                this.listingTotal = 0;
                this.unfilteredTotal = 0;
            } finally {
                this.loading = false;
                this.$nextTick(() => {
                    this.syncFiltersFromRoute();
                    this.updateCityPageMeta();
                    this.observeFiltersToggle();
                    flushPendingScrollRestore();
                });
            }
        },
        listingQueryParams() {
            const params = {
                page: this.currentPage,
                per_page: this.recordsPerPage,
            };
            const query = this.searchQuery.trim();
            if (query) params.q = query;

            if (this.isCityBrowsePage && this.routeCitySlug) {
                params.city_slug = this.routeCitySlug;
            } else if (this.selectedCities.length && !this.allCitiesSelected) {
                params.cities = this.selectedCities.join('|');
            }

            if (this.selectedUnitTypes.length && !this.allUnitTypesSelected) {
                params.unit_types = this.selectedUnitTypes.join('|');
            }
            if (this.selectedBedrooms.length && !this.allBedroomsSelected) {
                params.bedrooms = this.selectedBedrooms.join('|');
            }
            if (this.selectedBathrooms.length && !this.allBathroomsSelected) {
                params.bathrooms = this.selectedBathrooms.join('|');
            }

            return params;
        },
        scheduleListingFetch() {
            if (this.loading) return;
            if (this._listingFetchTimer) {
                window.clearTimeout(this._listingFetchTimer);
            }
            this._listingFetchTimer = window.setTimeout(() => {
                this._listingFetchTimer = null;
                this.currentPage = 1;
                const nextQuery = this.listingRouteQuery(1);
                const queryChanged = this.listingQuerySignature(nextQuery)
                    !== this.listingQuerySignature(this.$route.query);

                if (queryChanged) {
                    this._fetchOnPageReset = true;
                    this.$router.replace({
                        path: this.$route.path,
                        query: nextQuery,
                    }).catch(() => {});
                    return;
                }

                this.fetchListing();
            }, 0);
        },
        async fetchListing() {
            const requestId = (this._listingRequestId || 0) + 1;
            this._listingRequestId = requestId;
            const initialLoad = this.loading;
            if (!initialLoad) this.listLoading = true;

            try {
                const { data } = await this.$api.get('/units/public/list', {
                    params: this.listingQueryParams(),
                });
                if (requestId !== this._listingRequestId) return;

                const payload = data || {};
                this.units = payload.data || [];
                this.listingTotal = payload.meta?.total || 0;
                this.unfilteredTotal = payload.meta?.unfiltered_total || 0;
                if (payload.meta?.facets) {
                    this.facets = payload.meta.facets;
                }

                const serverPage = payload.meta?.current_page || 1;
                if (serverPage !== this.currentPage) {
                    this.currentPage = serverPage;
                    this.setPage(serverPage, { replace: true, scroll: false });
                }
            } catch (err) {
                if (requestId !== this._listingRequestId) return;
                console.error('Failed to load properties:', err);
                if (initialLoad) throw err;
                this.error = 'Could not load properties right now. Please try again.';
            } finally {
                if (requestId === this._listingRequestId) {
                    this.listLoading = false;
                }
            }
        },
    },
};
</script>
