<template>
    <div class="property-detail">
        <section v-if="loading" class="property-detail__state">
            <div class="property-detail__spinner" aria-hidden="true"></div>
            <p>Loading property...</p>
        </section>

        <section v-else-if="error" class="property-detail__state property-detail__state--error">
            <p>{{ error }}</p>
            <router-link to="/properties" class="btn btn-primary">Back to Properties</router-link>
        </section>

        <template v-else-if="property">
            <section class="property-hero property-hero--detail">
                <img
                    class="property-hero__bg"
                    :src="coverImage"
                    alt=""
                    width="1920"
                    height="640"
                    fetchpriority="high"
                />
                <div class="property-hero__overlay" aria-hidden="true"></div>
                <div class="container-xl property-hero__inner">
                    <nav class="property-hero__breadcrumb" aria-label="Breadcrumb">
                        <router-link to="/">Home</router-link>
                        <span class="property-hero__breadcrumb-sep" aria-hidden="true">/</span>
                        <router-link to="/properties">Properties</router-link>
                        <template v-if="property?.city">
                            <span class="property-hero__breadcrumb-sep" aria-hidden="true">/</span>
                            <router-link :to="cityBrowseRoute">{{ property.city }}</router-link>
                        </template>
                        <span class="property-hero__breadcrumb-sep" aria-hidden="true">/</span>
                        <span class="property-hero__breadcrumb-current" aria-current="page">{{ displayProjectName }}</span>
                    </nav>
                    <div class="property-detail__hero-row">
                        <div class="property-detail__hero-main">
                            <div class="property-detail__logo-wrap">
                                <img
                                    :src="logoSrc"
                                    :alt="`${displayProjectName} logo`"
                                    @error="onLogoError"
                                />
                            </div>
                            <div class="property-detail__hero-copy">
                                <p class="property-hero__eyebrow">
                                    {{ displayDeveloper }}
                                    <a
                                        v-if="property.developer_website"
                                        :href="property.developer_website"
                                        class="property-detail__developer-link"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >Developer website</a>
                                </p>
                                <h1 class="property-hero__title">{{ displayProjectName }}</h1>
                                <div class="property-detail__meta-row">
                                    <span v-if="property.city">
                                        <i class="ti ti-map-pin" aria-hidden="true"></i>
                                        {{ property.city }}
                                    </span>
                                    <span class="property-detail__status-badge">{{ statusLabel }}</span>
                                </div>
                                <p v-if="propertyDescription" class="property-hero__lead property-detail__hero-description">
                                    {{ propertyDescription }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="home-section home-section--light">
                <div class="container-xl">
                    <div class="property-detail__name-row property-detail__name-row--section">
                        <h2 class="property-detail__section-property-name">{{ displayProjectName }}</h2>
                    </div>

                    <div
                        v-if="totalListingCount"
                        class="property-detail__units-board"
                        :class="{ 'property-detail__units-board--with-filters': hasListingFilters }"
                    >
                        <div class="property-detail__section-head">
                            <div>
                                <h2>{{ listingsSectionTitle }}</h2>
                                <p>
                                    <template v-if="filteredListingCards.length !== totalListingCount">
                                        Showing {{ filteredListingCards.length }} of {{ totalListingCount }} listings
                                    </template>
                                    <template v-else>
                                        {{ totalListingCount }} listing{{ totalListingCount === 1 ? '' : 's' }} under this property
                                    </template>
                                </p>
                            </div>
                        </div>

                        <div class="property-detail__units-search site-search site-search--light">
                            <label class="visually-hidden" for="property-units-search">Search units</label>
                            <input
                                id="property-units-search"
                                ref="searchInput"
                                v-model="searchDraft"
                                type="search"
                                class="form-control site-search__input"
                                :placeholder="searchPlaceholder"
                                autocomplete="off"
                                @keydown.enter.prevent="applySearch"
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
                                    aria-label="Search units"
                                    @click="applySearch"
                                >
                                    <i class="ti ti-search" aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>

                        <aside
                            v-if="hasListingFilters"
                            class="property-detail__filters"
                            aria-label="Filter listings"
                        >
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
                                    <li v-for="listingType in availableListingTypes" :key="listingType">
                                        <label class="property-detail__filter-option">
                                            <input
                                                v-model="selectedListingTypes"
                                                type="checkbox"
                                                class="property-detail__filter-checkbox"
                                                :value="listingType"
                                            />
                                            <span class="property-detail__filter-label">{{ listingTypeLabel(listingType) }}</span>
                                            <span class="property-detail__filter-count">{{ listingTypeCounts[listingType] || 0 }}</span>
                                        </label>
                                    </li>
                                </ul>
                            </div>

                            <div v-if="availableBuildingTypes.length" class="property-detail__filters-group">
                                <label class="property-detail__filters-title property-detail__filters-title--toggle">
                                    <input
                                        ref="allBuildingTypesCheckbox"
                                        type="checkbox"
                                        class="property-detail__filter-checkbox"
                                        :checked="allBuildingTypesSelected"
                                        @change="toggleAllBuildingTypes"
                                    />
                                    <span>Building type</span>
                                </label>
                                <ul class="property-detail__filters-list">
                                    <li v-for="buildingType in availableBuildingTypes" :key="buildingType">
                                        <label class="property-detail__filter-option">
                                            <input
                                                v-model="selectedBuildingTypes"
                                                type="checkbox"
                                                class="property-detail__filter-checkbox"
                                                :value="buildingType"
                                            />
                                            <span class="property-detail__filter-label">{{ buildingType }}</span>
                                            <span class="property-detail__filter-count">{{ buildingTypeCounts[buildingType] || 0 }}</span>
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
                            <div v-if="filteredListingCards.length" class="property-grid">
                                <PropertyCard
                                    v-for="(listing, index) in filteredListingCards"
                                    :key="listing.id"
                                    :property="listing"
                                    :image-loading="index < 3 ? 'eager' : 'lazy'"
                                    :show-interest-button="true"
                                />
                            </div>
                            <p v-else class="property-detail__filters-empty">
                                No listings match your search or filters.
                                <button type="button" class="property-detail__filters-reset" @click="resetAllFilters">
                                    Show all
                                </button>
                            </p>
                        </div>
                    </div>

                    <p v-else class="property-detail__units-empty">
                        No listings are available for this property yet.
                    </p>
                </div>
            </section>
        </template>
    </div>
</template>

<script>
import PropertyCard from '@/components/home/PropertyCard.vue';
import { sortUnitTypes } from '@/constants/unitTypes';
import { formatProjectStatus, mapProjectToProperty } from '@/utils/mapProjectToProperty';
import { getWebsitePropertyDisplayName } from '@/utils/propertyDisplayName';
import { getWebsiteDeveloperDisplay } from '@/utils/developerDisplay';
import { mapUnitToPropertyCard } from '@/utils/mapUnitToProperty';
import { mapWholeBuildingToPropertyCard } from '@/utils/mapWholeBuildingToProperty';
import { unitMatchesSearch } from '@/utils/unitSearch';
import { updatePageMeta, getSiteUrl } from '@/utils/seo';
import { getPropertyDetailPath, getPropertyDetailRoute, getPropertiesByCityRoute } from '@/utils/propertyRoutes';
import { scrollToPageTopAfterRender } from '@/utils/scroll';
import defaultPropertyLogo from '@/assets/images/property-default-logo.svg';
import fallbackCoverImage from '@/assets/images/hero-bg-03-apartment-towers.jpg';
import { resolveMediaUrl } from '@/utils/mediaUrls';

const DEFAULT_COVER =
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';

export default {
    name: 'PropertyDetailView',
    components: { PropertyCard },
    data() {
        return {
            loading: true,
            error: '',
            property: null,
            logoFailed: false,
            defaultPropertyLogo,
            selectedUnitTypes: [],
            selectedBuildingTypes: [],
            selectedListingTypes: [],
            selectedBedrooms: [],
            selectedBathrooms: [],
            searchQuery: '',
            searchDraft: '',
        };
    },
    computed: {
        propertyRouteKey() {
            const { citySlug, projectSlug } = this.$route.params;
            return [citySlug, projectSlug].join('|');
        },
        isSegmentRoute() {
            return this.$route.name === 'property-detail';
        },
        legacyPropertySlug() {
            return this.$route.params.slug;
        },
        displayProjectName() {
            return getWebsitePropertyDisplayName(this.property || {});
        },
        listingMenuProperty() {
            if (!this.property) {
                return {};
            }

            return mapProjectToProperty(this.property);
        },
        displayDeveloper() {
            return getWebsiteDeveloperDisplay(this.property?.developer);
        },
        cityBrowseRoute() {
            return this.property?.city ? getPropertiesByCityRoute(this.property.city) : null;
        },
        propertyDescription() {
            return String(this.property?.description || '').trim();
        },
        coverImage() {
            return resolveMediaUrl(this.property?.image) || fallbackCoverImage || DEFAULT_COVER;
        },
        logoSrc() {
            if (this.logoFailed || !this.property?.logo) {
                return this.defaultPropertyLogo;
            }

            return resolveMediaUrl(this.property.logo);
        },
        statusLabel() {
            return formatProjectStatus(this.property?.status);
        },
        wholeBuildingListings() {
            return (this.property?.buildings || []).filter((building) => building.is_whole_property_listing);
        },
        totalUnitCount() {
            return this.property?.units?.length || 0;
        },
        totalListingCount() {
            return this.totalUnitCount + this.wholeBuildingListings.length;
        },
        listingsSectionTitle() {
            if (this.wholeBuildingListings.length && !this.totalUnitCount) {
                return 'Available Listings';
            }

            if (this.wholeBuildingListings.length) {
                return 'Available Units & Listings';
            }

            return 'Available Units';
        },
        searchPlaceholder() {
            return this.totalUnitCount ? 'Search unit...' : 'Search listing...';
        },
        hasListingFilters() {
            return this.availableUnitTypes.length
                || this.availableBuildingTypes.length
                || this.availableListingTypes.length
                || this.availableBedrooms.length
                || this.availableBathrooms.length;
        },
        availableBuildingTypes() {
            const types = [...new Set(
                this.wholeBuildingListings
                    .map((building) => building.building_type)
                    .filter(Boolean),
            )];

            return types.sort((a, b) => a.localeCompare(b));
        },
        buildingTypeCounts() {
            const counts = {};

            this.wholeBuildingListings.forEach((building) => {
                if (!building.building_type) return;
                counts[building.building_type] = (counts[building.building_type] || 0) + 1;
            });

            return counts;
        },
        availableListingTypes() {
            const types = [...new Set(
                this.wholeBuildingListings
                    .map((building) => building.listing_type)
                    .filter(Boolean),
            )];

            return types.sort((a, b) => a.localeCompare(b));
        },
        listingTypeCounts() {
            const counts = {};

            this.wholeBuildingListings.forEach((building) => {
                if (!building.listing_type) return;
                counts[building.listing_type] = (counts[building.listing_type] || 0) + 1;
            });

            return counts;
        },
        availableUnitTypes() {
            if (!this.property?.units?.length) return [];

            const types = this.property.unitTypes?.length
                ? this.property.unitTypes
                : [...new Set(this.property.units.map((unit) => unit.unit_type).filter(Boolean))];

            return sortUnitTypes(types);
        },
        unitTypeCounts() {
            const counts = {};

            (this.property?.units || []).forEach((unit) => {
                if (!unit.unit_type) return;
                counts[unit.unit_type] = (counts[unit.unit_type] || 0) + 1;
            });

            return counts;
        },
        availableBedrooms() {
            const bedrooms = new Set();

            (this.property?.units || []).forEach((unit) => {
                if (unit.bedrooms != null) bedrooms.add(unit.bedrooms);
            });

            this.wholeBuildingListings.forEach((building) => {
                if (building.bedrooms != null) bedrooms.add(building.bedrooms);
            });

            return [...bedrooms].sort((a, b) => a - b);
        },
        bedroomCounts() {
            const counts = {};

            (this.property?.units || []).forEach((unit) => {
                if (unit.bedrooms == null) return;
                counts[unit.bedrooms] = (counts[unit.bedrooms] || 0) + 1;
            });

            this.wholeBuildingListings.forEach((building) => {
                if (building.bedrooms == null) return;
                counts[building.bedrooms] = (counts[building.bedrooms] || 0) + 1;
            });

            return counts;
        },
        availableBathrooms() {
            const bathrooms = new Set();

            (this.property?.units || []).forEach((unit) => {
                if (unit.bathrooms != null) bathrooms.add(unit.bathrooms);
            });

            this.wholeBuildingListings.forEach((building) => {
                if (building.bathrooms != null) bathrooms.add(building.bathrooms);
            });

            return [...bathrooms].sort((a, b) => a - b);
        },
        bathroomCounts() {
            const counts = {};

            (this.property?.units || []).forEach((unit) => {
                if (unit.bathrooms == null) return;
                counts[unit.bathrooms] = (counts[unit.bathrooms] || 0) + 1;
            });

            this.wholeBuildingListings.forEach((building) => {
                if (building.bathrooms == null) return;
                counts[building.bathrooms] = (counts[building.bathrooms] || 0) + 1;
            });

            return counts;
        },
        filteredListingCards() {
            const query = this.searchQuery.trim();
            const unitCards = (this.property?.units || [])
                .filter((unit) => (
                    this.matchesUnitTypeFilter(unit)
                    && this.matchesBedroomFilter(unit)
                    && this.matchesBathroomFilter(unit)
                    && unitMatchesSearch(unit, query, this.property)
                ))
                .map((unit) => mapUnitToPropertyCard(unit, this.property));

            const wholeBuildingCards = this.wholeBuildingListings
                .filter((building) => (
                    this.matchesBuildingTypeFilter(building)
                    && this.matchesListingTypeFilter(building)
                    && this.matchesBedroomFilter(building)
                    && this.matchesBathroomFilter(building)
                    && this.matchesWholeBuildingSearch(building, query)
                ))
                .map((building) => mapWholeBuildingToPropertyCard(building, this.property));

            return [...wholeBuildingCards, ...unitCards];
        },
        filteredUnitCards() {
            return this.filteredListingCards;
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
        allBuildingTypesSelected() {
            return this.availableBuildingTypes.length > 0
                && this.selectedBuildingTypes.length === this.availableBuildingTypes.length;
        },
        someBuildingTypesSelected() {
            return this.selectedBuildingTypes.length > 0
                && this.selectedBuildingTypes.length < this.availableBuildingTypes.length;
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
        propertyRouteKey: {
            immediate: true,
            handler() {
                this.loadProperty();
            },
        },
        selectedUnitTypes: 'syncAllUnitTypesIndeterminate',
        availableUnitTypes: 'syncAllUnitTypesIndeterminate',
        selectedBuildingTypes: 'syncAllBuildingTypesIndeterminate',
        availableBuildingTypes: 'syncAllBuildingTypesIndeterminate',
        selectedListingTypes: 'syncAllListingTypesIndeterminate',
        availableListingTypes: 'syncAllListingTypesIndeterminate',
        selectedBedrooms: 'syncAllBedroomsIndeterminate',
        availableBedrooms: 'syncAllBedroomsIndeterminate',
        selectedBathrooms: 'syncAllBathroomsIndeterminate',
        availableBathrooms: 'syncAllBathroomsIndeterminate',
    },
    updated() {
        this.syncAllUnitTypesIndeterminate();
        this.syncAllBuildingTypesIndeterminate();
        this.syncAllListingTypesIndeterminate();
        this.syncAllBedroomsIndeterminate();
        this.syncAllBathroomsIndeterminate();
    },
    methods: {
        onLogoError() {
            this.logoFailed = true;
        },
        isSelectedCount(value, selectedValues) {
            return selectedValues.some((selected) => Number(selected) === Number(value));
        },
        matchesUnitTypeFilter(unit) {
            if (!this.availableUnitTypes.length || !this.selectedUnitTypes.length || this.allUnitTypesSelected) {
                return true;
            }

            return this.selectedUnitTypes.includes(unit.unit_type);
        },
        matchesBedroomFilter(unit) {
            if (!this.availableBedrooms.length || !this.selectedBedrooms.length || this.allBedroomsSelected) {
                return true;
            }

            if (unit.bedrooms == null) return false;
            return this.isSelectedCount(unit.bedrooms, this.selectedBedrooms);
        },
        matchesBathroomFilter(unit) {
            if (!this.availableBathrooms.length || !this.selectedBathrooms.length || this.allBathroomsSelected) {
                return true;
            }

            if (unit.bathrooms == null) return false;
            return this.isSelectedCount(unit.bathrooms, this.selectedBathrooms);
        },
        matchesBuildingTypeFilter(building) {
            if (!this.availableBuildingTypes.length || !this.selectedBuildingTypes.length || this.allBuildingTypesSelected) {
                return true;
            }

            return this.selectedBuildingTypes.includes(building.building_type);
        },
        matchesListingTypeFilter(building) {
            if (!this.availableListingTypes.length || !this.selectedListingTypes.length || this.allListingTypesSelected) {
                return true;
            }

            return this.selectedListingTypes.includes(building.listing_type);
        },
        matchesWholeBuildingSearch(building, query) {
            if (!query) return true;

            const haystack = [
                building.building_name,
                building.building_type,
                building.listing_type,
            ].filter(Boolean).join(' ').toLowerCase();

            return haystack.includes(query.toLowerCase());
        },
        listingTypeLabel(value) {
            if (value === 'rent') return 'For Rent';
            if (value === 'sale') return 'For Sale';
            return value;
        },
        syncAllUnitTypesIndeterminate() {
            const checkbox = this.$refs.allUnitTypesCheckbox;
            if (!checkbox) return;
            checkbox.indeterminate = this.someUnitTypesSelected;
        },
        toggleAllUnitTypes() {
            if (this.allUnitTypesSelected) {
                this.selectedUnitTypes = [];
            } else {
                this.selectAllUnitTypes();
            }
        },
        syncAllBedroomsIndeterminate() {
            const checkbox = this.$refs.allBedroomsCheckbox;
            if (!checkbox) return;
            checkbox.indeterminate = this.someBedroomsSelected;
        },
        toggleAllBedrooms() {
            if (this.allBedroomsSelected) {
                this.selectedBedrooms = [];
            } else {
                this.selectAllBedrooms();
            }
        },
        syncAllBathroomsIndeterminate() {
            const checkbox = this.$refs.allBathroomsCheckbox;
            if (!checkbox) return;
            checkbox.indeterminate = this.someBathroomsSelected;
        },
        toggleAllBathrooms() {
            if (this.allBathroomsSelected) {
                this.selectedBathrooms = [];
            } else {
                this.selectAllBathrooms();
            }
        },
        syncAllBuildingTypesIndeterminate() {
            const checkbox = this.$refs.allBuildingTypesCheckbox;
            if (!checkbox) return;
            checkbox.indeterminate = this.someBuildingTypesSelected;
        },
        toggleAllBuildingTypes() {
            if (this.allBuildingTypesSelected) {
                this.selectedBuildingTypes = [];
            } else {
                this.selectAllBuildingTypes();
            }
        },
        syncAllListingTypesIndeterminate() {
            const checkbox = this.$refs.allListingTypesCheckbox;
            if (!checkbox) return;
            checkbox.indeterminate = this.someListingTypesSelected;
        },
        toggleAllListingTypes() {
            if (this.allListingTypesSelected) {
                this.selectedListingTypes = [];
            } else {
                this.selectAllListingTypes();
            }
        },
        selectAllUnitTypes() {
            this.selectedUnitTypes = [...this.availableUnitTypes];
        },
        selectAllBedrooms() {
            this.selectedBedrooms = [...this.availableBedrooms];
        },
        selectAllBathrooms() {
            this.selectedBathrooms = [...this.availableBathrooms];
        },
        selectAllBuildingTypes() {
            this.selectedBuildingTypes = [...this.availableBuildingTypes];
        },
        selectAllListingTypes() {
            this.selectedListingTypes = [...this.availableListingTypes];
        },
        resetAllFilters() {
            this.selectedUnitTypes = [];
            this.selectedBuildingTypes = [];
            this.selectedListingTypes = [];
            this.selectedBedrooms = [];
            this.selectedBathrooms = [];
            this.searchDraft = '';
            this.searchQuery = '';
        },
        applySearch() {
            this.searchQuery = this.searchDraft.trim();
            this.$refs.searchInput?.focus();
        },
        clearSearch() {
            this.searchDraft = '';
            this.searchQuery = '';
            this.$nextTick(() => {
                this.$refs.searchInput?.focus();
            });
        },
        updateSeo() {
            if (!this.property) return;

            const path = getPropertyDetailPath(this.property);

            updatePageMeta({
                title: `${this.displayProjectName} | Mr. Boss Realty`,
                description: this.property.description
                    || `View units and details for ${this.displayProjectName} with Mr. Boss Realty.`,
                path,
                ogImage: this.property.image || undefined,
                canonical: getSiteUrl(path),
            });
        },
        async loadProperty() {
            const { citySlug, projectSlug } = this.$route.params;
            if (!citySlug || !projectSlug) {
                this.error = 'This property could not be found.';
                this.loading = false;
                return;
            }

            this.loading = true;
            this.error = '';
            this.property = null;
            this.logoFailed = false;
            this.selectedUnitTypes = [];
            this.selectedBuildingTypes = [];
            this.selectedListingTypes = [];
            this.selectedBedrooms = [];
            this.selectedBathrooms = [];
            this.searchDraft = '';
            this.searchQuery = '';

            try {
                const res = await this.$api.get(
                    `/projects/public/${encodeURIComponent(citySlug)}/${encodeURIComponent(projectSlug)}`,
                );
                this.property = res.data;
                this.updateSeo();

                const canonicalRoute = getPropertyDetailRoute(this.property);
                if (this.$route.params.citySlug !== canonicalRoute.params.citySlug
                    || this.$route.params.projectSlug !== canonicalRoute.params.projectSlug) {
                    await this.$router.replace(canonicalRoute);
                }
            } catch (err) {
                console.error('Failed to load property:', err);
                if (err.response?.status === 404) {
                    this.error = 'This property could not be found.';
                } else {
                    this.error = 'Could not load this property right now. Please try again.';
                }
            } finally {
                this.loading = false;
                if (this.property) {
                    scrollToPageTopAfterRender();
                }
            }
        },
    },
};
</script>
