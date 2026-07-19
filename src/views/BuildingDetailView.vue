<template>
    <div class="unit-detail">
        <section v-if="loading" class="property-detail__state">
            <div class="property-detail__spinner" aria-hidden="true"></div>
            <p>Loading listing...</p>
        </section>

        <section v-else-if="error" class="property-detail__state property-detail__state--error">
            <p>{{ error }}</p>
            <router-link to="/units" class="btn btn-primary">Back to Listings</router-link>
        </section>

        <template v-else-if="building">
            <section class="property-hero property-hero--detail">
                <img
                    class="property-hero__bg"
                    :src="coverImage"
                    alt=""
                    width="1920"
                    height="640"
                    fetchpriority="high"
                    role="button"
                    tabindex="0"
                    aria-label="View listing photos"
                    @click="openCoverViewer"
                    @keydown.enter.prevent="openCoverViewer"
                    @keydown.space.prevent="openCoverViewer"
                />
                <div class="property-hero__overlay" aria-hidden="true"></div>
                <div class="container-xl property-hero__inner">
                    <PropertyListingBreadcrumb
                        :listing-title="buildingTitle"
                        :is-properties-listing-route="isPropertiesListingRoute"
                        :is-private-listing="isPrivateListing"
                        :display-project-name="displayProjectName"
                        :property-route="propertyRoute"
                        :listing-city="listingCity"
                        fallback-parent-label="Listings"
                    />
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
                                <p v-if="displayProjectName" class="property-hero__eyebrow">{{ displayProjectName }}</p>
                                <h1 class="property-hero__title">{{ buildingTitle }}</h1>
                                <div class="property-detail__meta-row">
                                    <span v-if="listingCity || building.building_name">
                                        <i class="ti ti-map-pin" aria-hidden="true"></i>
                                        <LocationWithCity
                                            v-if="listingCity"
                                            :city="building.project_city"
                                            :detail="building.building_name"
                                        />
                                        <span v-else>{{ building.building_name }}</span>
                                    </span>
                                    <span class="property-detail__status-badge">{{ statusLabel }}</span>
                                </div>
                                <ul v-if="heroMetaItems.length" class="property-card__meta unit-detail__hero-meta">
                                    <li v-for="(item, index) in heroMetaItems" :key="`${item.text}-${index}`">
                                        <i :class="item.icon" aria-hidden="true"></i> {{ item.text }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="home-section home-section--light">
                <div class="container-xl">
                    <div class="property-detail__section-head">
                        <div>
                            <div class="section-title-row">
                                <h2>Property Details</h2>
                                <p class="unit-detail__price">{{ formattedPrice }}</p>
                                <InterestedButton :message="interestMessage" />
                            </div>
                            <p v-if="displayProjectName">
                                Part of
                                <router-link
                                    v-if="propertyRoute"
                                    :to="propertyRoute"
                                    class="unit-detail__property-link"
                                >
                                    {{ displayProjectName }}
                                </router-link>
                                <span v-else>{{ displayProjectName }}</span>
                            </p>
                        </div>
                    </div>

                    <div class="unit-detail__specs card">
                        <div class="card-body unit-detail__body unit-detail__body--with-gallery">
                            <div class="unit-detail__specs-column">
                                <dl class="unit-detail__spec-list">
                                    <template v-for="item in specItems" :key="item.key">
                                        <dt :class="{ 'unit-detail__spec-full': item.fullWidth }">{{ item.label }}</dt>
                                        <dd :class="{ 'unit-detail__spec-full': item.fullWidth }">
                                            <a
                                                v-if="item.href"
                                                :href="item.href"
                                                target="_blank"
                                                rel="noopener"
                                            >{{ item.value }}</a>
                                            <router-link
                                                v-else-if="item.to"
                                                :to="item.to"
                                            >{{ item.value }}</router-link>
                                            <span v-else>{{ item.value }}</span>
                                        </dd>
                                    </template>
                                </dl>
                                <div class="unit-detail__spec-actions">
                                    <InterestedButton :message="interestMessage" />
                                </div>
                            </div>

                            <aside class="unit-detail__gallery" aria-label="Property photos">
                                <ul v-if="hasGalleryImages" class="unit-detail__gallery-grid">
                                    <li
                                        v-for="(item, index) in visibleGalleryItems"
                                        :key="`${item.url}-${index}`"
                                    >
                                        <button
                                            type="button"
                                            class="unit-detail__gallery-thumb"
                                            :class="{
                                                'unit-detail__gallery-thumb--active': isGalleryItemActive(item),
                                                'unit-detail__gallery-thumb--video': item.type === 'video',
                                                'unit-detail__gallery-thumb--fallback': !hasGalleryThumb(item),
                                            }"
                                            :aria-label="galleryItemAriaLabel(item, index)"
                                            :aria-current="isGalleryItemActive(item) ? 'true' : null"
                                            @click="onGallerySelect(item)"
                                        >
                                            <img
                                                v-if="hasGalleryThumb(item)"
                                                :src="item.thumbnail"
                                                :alt="item.label || `${buildingTitle} media ${index + 1}`"
                                                loading="lazy"
                                                @error="onGalleryThumbError(item.url)"
                                            />
                                            <span
                                                v-else
                                                class="unit-detail__gallery-fallback"
                                                aria-hidden="true"
                                            >
                                                <i :class="galleryItemIcon(item.type)"></i>
                                            </span>
                                            <span
                                                v-if="item.type === 'video'"
                                                class="unit-detail__gallery-play"
                                                aria-hidden="true"
                                            >
                                                <i class="ti ti-player-play" aria-hidden="true"></i>
                                            </span>
                                        </button>
                                    </li>
                                </ul>
                                <div v-else class="unit-detail__gallery-empty">
                                    <i class="ti ti-photo-off unit-detail__gallery-empty-icon" aria-hidden="true"></i>
                                    <p>No available images</p>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </section>
        </template>
    </div>
</template>

<script>
import { formatProjectStatus, getProjectDisplayCity } from '@/utils/mapProjectToProperty';
import { formatCurrency } from '@/utils/formatCurrency';
import { getBuildingDetailPath, getBuildingDetailRoute, getPropertiesByCityRoute, getPropertyDetailRoute } from '@/utils/propertyRoutes';
import { buildListingPublicApiPathFromRoute } from '@/utils/propertyCity';
import { updatePageMeta, getSiteUrl } from '@/utils/seo';
import { getPreviewIconClass, resolveMediaUrl } from '@/utils/mediaUrls';
import { buildBuildingGalleryItems } from '@/utils/listingGallery';
import { getWebsitePropertyDisplayName, isPrivateOnWebsite } from '@/utils/propertyDisplayName';
import { getListingCity } from '@/utils/propertyCity';
import { getWebsiteDeveloperDisplay } from '@/utils/developerDisplay';
import { buildBuildingInterestMessage } from '@/utils/siteChat';
import PropertyListingBreadcrumb from '@/components/property/PropertyListingBreadcrumb.vue';
import LocationWithCity from '@/components/property/LocationWithCity.vue';
import InterestedButton from '@/components/InterestedButton.vue';
import defaultPropertyLogo from '@/assets/images/property-default-logo.svg';
import fallbackCoverImage from '@/assets/images/hero-bg-03-apartment-towers.jpg';

const DEFAULT_COVER =
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';

function formatYesNo(value) {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    return null;
}

function displayValue(value, fallback = '—') {
    if (value === null || value === undefined || value === '') return fallback;
    return value;
}

export default {
    name: 'BuildingDetailView',
    components: { InterestedButton, LocationWithCity, PropertyListingBreadcrumb },
    props: {
        prefetchedBuilding: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            loading: true,
            error: '',
            building: null,
            logoFailed: false,
            imageFailed: false,
            defaultPropertyLogo,
            activeGalleryUrl: '',
            brokenGalleryThumbs: {},
        };
    },
    computed: {
        routeKey() {
            const {
                citySlug,
                projectSlug,
                listingRef,
                slug,
            } = this.$route.params;

            return [
                this.$route.name,
                citySlug || slug,
                projectSlug,
                listingRef,
            ].join('|');
        },
        isPropertiesListingRoute() {
            return this.$route.name === 'property-listing-detail'
                || this.$route.name === 'property-listing-detail-legacy';
        },
        isPrivateListing() {
            return isPrivateOnWebsite(this.building || {});
        },
        listingCity() {
            return getListingCity(this.building || {});
        },
        cityBrowseRoute() {
            return this.listingCity ? getPropertiesByCityRoute(this.listingCity) : null;
        },
        buildingTitle() {
            if (!this.building) return 'Property';
            return this.building.building_name || 'Whole Property';
        },
        displayProjectName() {
            return getWebsitePropertyDisplayName(this.building || {});
        },
        logoSrc() {
            if (this.logoFailed || !this.building?.logo) {
                return this.defaultPropertyLogo;
            }

            return resolveMediaUrl(this.building.logo);
        },
        interestMessage() {
            return buildBuildingInterestMessage(
                this.building?.building_name,
                this.building?.project_slug,
            );
        },
        coverImage() {
            if (this.activeGalleryUrl && !this.imageFailed) {
                return resolveMediaUrl(this.activeGalleryUrl);
            }

            if (this.imageFailed || !this.building?.image) {
                return fallbackCoverImage || DEFAULT_COVER;
            }

            return resolveMediaUrl(this.building.image);
        },
        galleryItems() {
            if (!this.building) return [];
            return buildBuildingGalleryItems(this.building);
        },
        visibleGalleryItems() {
            return this.galleryItems;
        },
        hasGalleryImages() {
            return this.visibleGalleryItems.length > 0;
        },
        statusLabel() {
            if (this.building?.listing_type === 'rent') return 'For Rent';
            if (this.building?.listing_type === 'sale') return 'For Sale';
            return formatProjectStatus(this.building?.building_status || this.building?.project_status);
        },
        formattedPrice() {
            if (!this.building) return '';

            if (this.building.listing_type === 'sale') {
                return formatCurrency(this.building.sale_price, { fallback: 'Price on request' });
            }

            const parts = [];
            if (this.building.monthly_rent > 0) {
                parts.push(`${formatCurrency(this.building.monthly_rent, { fallback: '' })} / mo`);
            }
            if (this.building.daily_rent > 0) {
                parts.push(`${formatCurrency(this.building.daily_rent, { fallback: '' })} / day`);
            }
            if (this.building.hourly_rent > 0) {
                parts.push(`${formatCurrency(this.building.hourly_rent, { fallback: '' })} / hr`);
            }

            return parts.filter(Boolean).join(' · ') || 'Price on request';
        },
        propertyRoute() {
            if (!this.building?.project_city && this.building?.project_id == null) return null;
            return getPropertyDetailRoute({
                project_name: this.building.project_name,
                city: this.building.project_city,
                is_private_on_website: this.building.is_private_on_website,
            });
        },
        heroMetaItems() {
            if (!this.building) return [];

            const items = [];

            if (this.building.building_type) {
                items.push({ icon: 'ti ti-building-estate', text: this.building.building_type });
            }

            if (this.building.bedrooms != null) {
                items.push({ icon: 'ti ti-bed', text: `${this.building.bedrooms} Br` });
            }

            if (this.building.bathrooms != null) {
                items.push({ icon: 'ti ti-bath', text: `${this.building.bathrooms} Ba` });
            }

            if (this.building.stories != null) {
                const label = this.building.stories === 1 ? 'floor' : 'floors';
                items.push({ icon: 'ti ti-stairs', text: `${this.building.stories} ${label}` });
            }

            if (this.building.number_of_units != null) {
                items.push({ icon: 'ti ti-door', text: `${this.building.number_of_units} rooms` });
            }

            if (this.building.total_floor_area) {
                items.push({ icon: 'ti ti-ruler', text: this.building.total_floor_area });
            }

            if (this.building.lot_area) {
                items.push({ icon: 'ti ti-ruler-measure', text: this.building.lot_area });
            }

            return items;
        },
        specItems() {
            if (!this.building) return [];

            const items = [
                {
                    key: 'property',
                    label: 'Property',
                    value: this.displayProjectName,
                    to: this.propertyRoute,
                },
                {
                    key: 'developer',
                    label: 'Developer',
                    value: getWebsiteDeveloperDisplay(this.building.project_developer),
                },
                {
                    key: 'city',
                    label: 'City',
                    value: this.listingCity || getProjectDisplayCity({
                        city: this.building.project_city,
                    }),
                    to: this.cityBrowseRoute,
                },
                {
                    key: 'building',
                    label: 'Building',
                    value: this.building.building_name,
                },
                {
                    key: 'building-type',
                    label: 'Building Type',
                    value: this.building.building_type,
                },
                {
                    key: 'listing-type',
                    label: 'Listing Type',
                    value: this.building.listing_type === 'rent'
                        ? 'Rent'
                        : (this.building.listing_type === 'sale' ? 'Sale' : null),
                },
                {
                    key: 'reservation-fee',
                    label: 'Reservation Fee',
                    value: this.building.reservation_fee
                        ? formatCurrency(this.building.reservation_fee, { fallback: '—' })
                        : null,
                },
                {
                    key: 'reservation-deductible',
                    label: 'Reservation Deductible',
                    value: formatYesNo(this.building.is_reservation_deductible),
                },
                {
                    key: 'bedrooms',
                    label: 'Number of Bedrooms',
                    value: this.building.bedrooms != null ? String(this.building.bedrooms) : null,
                },
                {
                    key: 'bathrooms',
                    label: 'Number of Bathrooms',
                    value: this.building.bathrooms != null ? String(this.building.bathrooms) : null,
                },
                {
                    key: 'stories',
                    label: 'Number of Floors',
                    value: this.building.stories != null ? String(this.building.stories) : null,
                },
                {
                    key: 'floor-area',
                    label: 'Total Floor Area',
                    value: this.building.total_floor_area,
                },
                {
                    key: 'lot-area',
                    label: 'Lot Area',
                    value: this.building.lot_area,
                },
                {
                    key: 'rooms',
                    label: 'Number of Rooms',
                    value: this.building.number_of_units != null ? String(this.building.number_of_units) : null,
                },
                {
                    key: 'room-area',
                    label: 'Typical Room Area',
                    value: this.building.typical_room_area,
                },
                {
                    key: 'parking',
                    label: 'Parking',
                    value: this.building.total_parking != null ? String(this.building.total_parking) : null,
                },
                {
                    key: 'available-parking',
                    label: 'Available Parking',
                    value: this.building.total_available_parking != null
                        ? String(this.building.total_available_parking)
                        : null,
                },
                {
                    key: 'freebies',
                    label: 'Freebies',
                    value: this.building.freebies,
                },
                {
                    key: 'payment-terms',
                    label: 'Payment Terms',
                    value: this.building.payment_terms,
                },
                {
                    key: 'payment-terms-link',
                    label: 'Payment Terms Link',
                    value: this.building.payment_terms_link,
                    href: this.building.payment_terms_link,
                },
                {
                    key: 'monthly-dues',
                    label: 'Monthly Dues',
                    value: this.building.monthly_dues
                        ? formatCurrency(this.building.monthly_dues, { fallback: '—' })
                        : null,
                },
                {
                    key: 'monthly-dues-per-sqm',
                    label: 'Monthly Dues / sqm',
                    value: this.building.monthly_dues_per_sqm
                        ? formatCurrency(this.building.monthly_dues_per_sqm, { fallback: '—' })
                        : null,
                },
                {
                    key: 'pet-allowed',
                    label: 'Pets Allowed',
                    value: formatYesNo(this.building.is_pet_allowed),
                },
                {
                    key: 'pet-size',
                    label: 'Allowed Pet Size',
                    value: this.building.allowed_pet_size,
                },
                {
                    key: 'smoking',
                    label: 'Smoking Allowed',
                    value: formatYesNo(this.building.is_allowed_smoking),
                },
                {
                    key: 'amenities',
                    label: 'Amenities',
                    value: this.building.amenities,
                    fullWidth: true,
                },
            ];

            return items
                .map((item) => ({
                    ...item,
                    value: item.key === 'developer'
                        ? getWebsiteDeveloperDisplay(this.building.project_developer)
                        : displayValue(item.value, '—'),
                }))
                .filter((item) => item.value !== '—' || item.key === 'property' || item.key === 'developer');
        },
    },
    watch: {
        routeKey: {
            immediate: true,
            handler() {
                this.loadBuilding();
            },
        },
    },
    methods: {
        onLogoError() {
            this.logoFailed = true;
        },
        onImageError() {
            this.imageFailed = true;
        },
        onGalleryThumbError(url) {
            this.$set(this.brokenGalleryThumbs, url, true);
        },
        isGalleryItemActive(item) {
            if (item.type !== 'image') return false;
            const active = this.activeGalleryUrl || this.building?.image || '';
            return item.url === active || item.thumbnail === active;
        },
        hasGalleryThumb(item) {
            return Boolean(item?.thumbnail) && !this.brokenGalleryThumbs[item.url];
        },
        galleryItemIcon(type) {
            return getPreviewIconClass(type);
        },
        galleryItemAriaLabel(item, index) {
            if (item.label) return item.label;
            if (item.type === 'video') return `Play video ${index + 1}`;
            if (item.type === 'image') return `View photo ${index + 1}`;
            return `View file ${index + 1}`;
        },
        onGallerySelect(item) {
            if (item.type === 'image') {
                this.imageFailed = false;
                this.activeGalleryUrl = item.url;
            }
            this.openGalleryViewer(item);
        },
        openCoverViewer() {
            const activeUrl = this.activeGalleryUrl || this.building?.image || this.coverImage;
            this.openGalleryViewer({ type: 'image', url: activeUrl });
        },
        openGalleryViewer(startItem = null) {
            const items = this.visibleGalleryItems;
            if (!items.length) return;

            let index = 0;
            if (startItem?.url) {
                const found = items.findIndex((entry) => entry.url === startItem.url);
                index = found >= 0 ? found : 0;
            }

            this.$openMediaViewer({ items, index });
        },
        updateSeo() {
            if (!this.building) return;

            const path = getBuildingDetailPath(this.building);

            updatePageMeta({
                title: `${this.buildingTitle} | ${this.displayProjectName || 'Mr. Boss Realty'}`,
                description: this.buildSeoDescription(),
                path,
                ogImage: resolveMediaUrl(this.building.image) || undefined,
                canonical: getSiteUrl(path),
            });
        },
        buildSeoDescription() {
            const city = getProjectDisplayCity({
                city: this.building?.project_city,
            });
            const propertyPart = this.displayProjectName
                ? ` at ${this.displayProjectName}${city ? `, ${city}` : ''}`
                : '';

            return `${this.buildingTitle}${propertyPart}. View pricing, specs, and availability with Mr. Boss Realty.`;
        },
        async loadBuilding() {
            if (this.prefetchedBuilding) {
                this.loading = false;
                this.error = '';
                this.logoFailed = false;
                this.imageFailed = false;
                this.brokenGalleryThumbs = {};
                this.applyBuilding(this.prefetchedBuilding);
                return;
            }

            this.loading = true;
            this.error = '';
            this.building = null;
            this.logoFailed = false;
            this.imageFailed = false;
            this.activeGalleryUrl = '';
            this.brokenGalleryThumbs = {};

            try {
                if (this.$route.name !== 'property-listing-detail') {
                    this.error = 'This listing could not be found.';
                    return;
                }

                const { citySlug, projectSlug, listingRef } = this.$route.params;
                const apiPath = buildListingPublicApiPathFromRoute(citySlug, projectSlug, listingRef);

                if (!apiPath) {
                    this.error = 'This listing could not be found.';
                    return;
                }

                const res = await this.$api.get(apiPath);

                this.applyBuilding(res.data);
            } catch (err) {
                console.error('Failed to load building:', err);
                if (err.response?.status === 404) {
                    this.error = 'This listing could not be found.';
                } else {
                    this.error = 'Could not load this listing right now. Please try again.';
                }
            } finally {
                this.loading = false;
            }
        },
        applyBuilding(building) {
            this.building = building;
            this.activeGalleryUrl = this.building.image || '';
            this.updateSeo();

            const canonicalPath = getBuildingDetailPath(this.building);
            const shouldRedirect = this.$route.name === 'property-listing-detail-legacy'
                || (
                    canonicalPath
                    && canonicalPath !== '/properties'
                    && this.$route.path !== canonicalPath
                );

            if (shouldRedirect) {
                this.$router.replace(getBuildingDetailRoute(this.building)).catch(() => {});
            }
        },
    },
};
</script>
