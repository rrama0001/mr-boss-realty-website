<template>
    <div class="properties-page units-page">
        <section class="property-hero">
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
                    <h1 class="property-hero__title">Units</h1>
                    <p class="property-hero__lead">
                        Browse available units across our developments — filter by city, type, bedrooms, and bathrooms.
                    </p>
                </div>
            </div>
        </section>

        <section class="home-section home-section--light">
            <div class="container-xl">
                <div v-if="loading" class="properties-page__state">
                    <div class="properties-page__spinner" aria-hidden="true"></div>
                    <p>Loading units...</p>
                </div>

                <div v-else-if="error" class="properties-page__state properties-page__state--error">
                    <p>{{ error }}</p>
                    <button type="button" class="btn btn-primary" @click="loadUnits">Try again</button>
                </div>

                <div v-else-if="!totalUnitCount" class="properties-page__state">
                    <p>No units are listed yet. Please check back soon.</p>
                </div>

                <template v-else>
                    <div
                        class="property-detail__units-board"
                        :class="{ 'property-detail__units-board--with-filters': hasUnitFilters }"
                    >
                        <div class="property-detail__section-head">
                            <div>
                                <h2>All Units</h2>
                                <p>
                                    <template v-if="filteredUnitCards.length !== totalUnitCount">
                                        Showing {{ filteredUnitCards.length }} of {{ totalUnitCount }} units
                                    </template>
                                    <template v-else>
                                        {{ totalUnitCount }} unit{{ totalUnitCount === 1 ? '' : 's' }} available
                                    </template>
                                </p>
                            </div>
                        </div>

                        <div class="property-detail__units-search site-search site-search--light">
                            <label class="visually-hidden" for="units-search">Search units</label>
                            <input
                                id="units-search"
                                ref="searchInput"
                                v-model="searchDraft"
                                type="search"
                                class="form-control site-search__input"
                                placeholder="Search unit..."
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
                            v-if="hasUnitFilters"
                            class="property-detail__filters"
                            aria-label="Filter units"
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
                            <div v-if="filteredUnitCards.length" class="property-grid">
                                <PropertyCard
                                    v-for="(unit, index) in filteredUnitCards"
                                    :key="unit.id"
                                    :property="unit"
                                    :image-loading="index < 3 ? 'eager' : 'lazy'"
                                    :fetch-priority="index === 0 ? 'high' : 'auto'"
                                />
                            </div>
                            <p v-else class="property-detail__filters-empty">
                                No units match your search or filters.
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
import { getProjectDisplayCity } from '@/utils/mapProjectToProperty';
import { mapPublicUnitToPropertyCard } from '@/utils/mapUnitToProperty';
import { mapPublicWholeBuildingToPropertyCard } from '@/utils/mapWholeBuildingToProperty';
import { unitMatchesSearch } from '@/utils/unitSearch';
import { flushPendingScrollRestore } from '@/utils/scroll';
import heroImageUrl from '@/assets/images/hero-bg-03-apartment-towers.jpg';

export default {
    name: 'UnitsView',
    components: { PropertyCard },
    data() {
        return {
            loading: true,
            error: '',
            units: [],
            selectedCities: [],
            selectedUnitTypes: [],
            selectedBedrooms: [],
            selectedBathrooms: [],
            searchQuery: '',
            searchDraft: '',
            heroImageUrl,
        };
    },
    computed: {
        totalUnitCount() {
            return this.units.length;
        },
        hasUnitFilters() {
            return this.availableCities.length
                || this.availableUnitTypes.length
                || this.availableBedrooms.length
                || this.availableBathrooms.length;
        },
        availableCities() {
            const cities = [...new Set(this.units.map((unit) => this.getUnitCity(unit)).filter(Boolean))];
            return cities.sort((a, b) => a.localeCompare(b));
        },
        cityCounts() {
            const counts = {};

            this.units.forEach((unit) => {
                const city = this.getUnitCity(unit);
                if (!city) return;
                counts[city] = (counts[city] || 0) + 1;
            });

            return counts;
        },
        availableUnitTypes() {
            const types = [...new Set(this.units.map((unit) => unit.unit_type).filter(Boolean))];
            return sortUnitTypes(types);
        },
        unitTypeCounts() {
            const counts = {};

            this.units.forEach((unit) => {
                if (!unit.unit_type) return;
                counts[unit.unit_type] = (counts[unit.unit_type] || 0) + 1;
            });

            return counts;
        },
        availableBedrooms() {
            const bedrooms = [...new Set(
                this.units.map((unit) => unit.bedrooms).filter((value) => value != null),
            )];
            return bedrooms.sort((a, b) => a - b);
        },
        bedroomCounts() {
            const counts = {};

            this.units.forEach((unit) => {
                if (unit.bedrooms == null) return;
                counts[unit.bedrooms] = (counts[unit.bedrooms] || 0) + 1;
            });

            return counts;
        },
        availableBathrooms() {
            const bathrooms = [...new Set(
                this.units.map((unit) => unit.bathrooms).filter((value) => value != null),
            )];
            return bathrooms.sort((a, b) => a - b);
        },
        bathroomCounts() {
            const counts = {};

            this.units.forEach((unit) => {
                if (unit.bathrooms == null) return;
                counts[unit.bathrooms] = (counts[unit.bathrooms] || 0) + 1;
            });

            return counts;
        },
        filteredUnits() {
            const query = this.searchQuery.trim();

            return this.units.filter((unit) => (
                this.matchesCityFilter(unit)
                && this.matchesUnitTypeFilter(unit)
                && this.matchesBedroomFilter(unit)
                && this.matchesBathroomFilter(unit)
                && unitMatchesSearch(unit, query)
            ));
        },
        filteredUnitCards() {
            return this.filteredUnits.map((unit) => this.mapListingUnit(unit));
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
        selectedCities: 'syncAllCitiesIndeterminate',
        availableCities: 'syncAllCitiesIndeterminate',
        selectedUnitTypes: 'syncAllUnitTypesIndeterminate',
        availableUnitTypes: 'syncAllUnitTypesIndeterminate',
        selectedBedrooms: 'syncAllBedroomsIndeterminate',
        availableBedrooms: 'syncAllBedroomsIndeterminate',
        selectedBathrooms: 'syncAllBathroomsIndeterminate',
        availableBathrooms: 'syncAllBathroomsIndeterminate',
    },
    mounted() {
        this.loadUnits();
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
        getUnitCity(unit) {
            return getProjectDisplayCity({
                city: unit.project_city,
                location: unit.project_location,
            });
        },
        mapListingUnit(item) {
            if (item.listing_kind === 'whole_building') {
                return mapPublicWholeBuildingToPropertyCard(item);
            }

            return mapPublicUnitToPropertyCard(item);
        },
        isSelectedCount(value, selectedValues) {
            return selectedValues.some((selected) => Number(selected) === Number(value));
        },
        matchesCityFilter(unit) {
            if (!this.availableCities.length || !this.selectedCities.length || this.allCitiesSelected) {
                return true;
            }

            return this.selectedCities.includes(this.getUnitCity(unit));
        },
        matchesUnitTypeFilter(unit) {
            if (unit.listing_kind === 'whole_building') return true;

            if (!this.availableUnitTypes.length || !this.selectedUnitTypes.length || this.allUnitTypesSelected) {
                return true;
            }

            return this.selectedUnitTypes.includes(unit.unit_type);
        },
        matchesBedroomFilter(unit) {
            if (unit.listing_kind === 'whole_building') return true;

            if (!this.availableBedrooms.length || !this.selectedBedrooms.length || this.allBedroomsSelected) {
                return true;
            }

            if (unit.bedrooms == null) return false;
            return this.isSelectedCount(unit.bedrooms, this.selectedBedrooms);
        },
        matchesBathroomFilter(unit) {
            if (unit.listing_kind === 'whole_building') return true;

            if (!this.availableBathrooms.length || !this.selectedBathrooms.length || this.allBathroomsSelected) {
                return true;
            }

            if (unit.bathrooms == null) return false;
            return this.isSelectedCount(unit.bathrooms, this.selectedBathrooms);
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
        async loadUnits() {
            this.loading = true;
            this.error = '';
            this.units = [];
            this.selectedCities = [];
            this.selectedUnitTypes = [];
            this.selectedBedrooms = [];
            this.selectedBathrooms = [];
            this.searchDraft = '';
            this.searchQuery = '';

            try {
                const res = await this.$api.get('/units/public/list', { params: { limit: 'all' } });
                this.units = res.data || [];
            } catch (err) {
                console.error('Failed to load units:', err);
                this.error = 'Could not load units right now. Please try again.';
                this.units = [];
            } finally {
                this.loading = false;
                this.$nextTick(() => {
                    flushPendingScrollRestore();
                });
            }
        },
    },
};
</script>
