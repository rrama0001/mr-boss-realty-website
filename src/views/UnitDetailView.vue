<template>
    <div class="unit-detail">
        <section v-if="loading" class="property-detail__state">
            <div class="property-detail__spinner" aria-hidden="true"></div>
            <p>Loading unit...</p>
        </section>

        <section v-else-if="error" class="property-detail__state property-detail__state--error">
            <p>{{ error }}</p>
            <router-link to="/units" class="btn btn-primary">Back to Units</router-link>
        </section>

        <template v-else-if="unit">
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
                    <PropertyListingBreadcrumb
                        :listing-title="unitTitle"
                        :is-properties-listing-route="isPropertiesListingRoute"
                        :is-private-listing="isPrivateListing"
                        :display-project-name="displayProjectName"
                        :property-route="propertyRoute"
                        :listing-city="listingCity"
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
                                <h1 class="property-hero__title">{{ unitTitle }}</h1>
                                <div class="property-detail__meta-row">
                                    <span v-if="listingCity || unit.building_name">
                                        <i class="ti ti-map-pin" aria-hidden="true"></i>
                                        <LocationWithCity
                                            v-if="listingCity"
                                            :city="unit.project_city"
                                            :detail="unit.building_name"
                                        />
                                        <span v-else>{{ unit.building_name }}</span>
                                    </span>
                                    <span class="property-detail__status-badge">{{ statusLabel }}</span>
                                </div>
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
                                <h2>{{ unit.unit_type || unitTitle }}</h2>
                                <p class="unit-detail__price">{{ formattedPrice }}</p>
                                <InterestedButton :unit-slug="unit.slug" />
                            </div>
                            <div v-if="displayProjectName" class="property-detail__name-row">
                                <p class="property-detail__name-line">
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
                            <div v-else class="property-detail__name-row">
                                <p class="property-detail__name-line">{{ unitTitle }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="unit-detail__specs card">
                        <div class="card-body unit-detail__body unit-detail__body--with-gallery">
                            <div class="unit-detail__specs-column">
                                <dl class="unit-detail__spec-list">
                                    <template v-for="item in specItems" :key="item.key">
                                        <dt>{{ item.label }}</dt>
                                        <dd>
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
                                    <InterestedButton :unit-slug="unit.slug" />
                                </div>
                            </div>

                            <aside class="unit-detail__gallery" aria-label="Unit photos">
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
                                            }"
                                            :aria-label="item.type === 'video'
                                                ? (item.label || `Play video ${index + 1}`)
                                                : `View photo ${index + 1}`"
                                            :aria-current="isGalleryItemActive(item) ? 'true' : null"
                                            @click="onGallerySelect(item)"
                                        >
                                            <img
                                                :src="item.thumbnail"
                                                :alt="`${unitTitle} photo ${index + 1}`"
                                                loading="lazy"
                                                @error="onGalleryThumbError(item.url)"
                                            />
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

            <section
                v-if="projectSiblingCards.length"
                class="home-section unit-detail__related"
                :aria-label="projectSiblingHeading"
            >
                <div class="container-xl">
                    <SectionHeading
                        :title="projectSiblingHeading"
                        :subtitle="projectSiblingSubtitle"
                    />
                    <div class="property-grid property-grid--compact">
                        <PropertyCard
                            v-for="(listing, index) in projectSiblingCards"
                            :key="`sibling-${listing.id}`"
                            :property="listing"
                            :image-loading="index < 3 ? 'eager' : 'lazy'"
                        />
                    </div>
                    <div v-if="propertyRoute" class="home-section__action">
                        <router-link :to="propertyRoute" class="btn btn-primary">
                            View all at {{ displayProjectName }}
                        </router-link>
                    </div>
                </div>
            </section>

            <section
                v-if="suggestedCards.length"
                class="home-section home-section--light unit-detail__related"
                aria-label="Similar Units"
            >
                <div class="container-xl">
                    <SectionHeading
                        title="Similar Units"
                        :subtitle="suggestedSubtitle"
                    />
                    <div class="property-grid property-grid--compact">
                        <PropertyCard
                            v-for="(listing, index) in suggestedCards"
                            :key="`suggested-${listing.id}`"
                            :property="listing"
                            :image-loading="index < 3 ? 'eager' : 'lazy'"
                        />
                    </div>
                    <div class="home-section__action">
                        <router-link to="/properties" class="btn btn-primary">Browse all properties</router-link>
                    </div>
                </div>
            </section>
        </template>
    </div>
</template>

<script>
import { formatProjectStatus, getProjectDisplayCity } from '@/utils/mapProjectToProperty';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    buildUnitPriceSuffix,
    isUnitRentListing,
    pickUnitDisplayPrice,
} from '@/utils/unitListing';
import {
    getPropertiesByCityRoute,
    getPropertyDetailRoute,
    getUnitDetailPath,
    getUnitDetailRoute,
} from '@/utils/propertyRoutes';
import { buildProjectPublicApiPath } from '@/utils/propertyCity';
import { mapPublicUnitToPropertyCard, mapUnitToPropertyCard } from '@/utils/mapUnitToProperty';
import { pickProjectSiblingUnits, pickSimilarUnits, buildSimilarUnitsSubtitle } from '@/utils/suggestUnits';
import { updatePageMeta, getSiteUrl } from '@/utils/seo';
import { extractMediaPreviews, resolveMediaUrl } from '@/utils/mediaUrls';
import { getWebsitePropertyDisplayName, isPrivateOnWebsite } from '@/utils/propertyDisplayName';
import { getListingCity } from '@/utils/propertyCity';
import { scrollToPageTopAfterRender } from '@/utils/scroll';
import PropertyListingBreadcrumb from '@/components/property/PropertyListingBreadcrumb.vue';
import LocationWithCity from '@/components/property/LocationWithCity.vue';
import InterestedButton from '@/components/InterestedButton.vue';
import PropertyCard from '@/components/home/PropertyCard.vue';
import SectionHeading from '@/components/home/SectionHeading.vue';
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

function isDirectImageUrl(url) {
    return /\.(jpe?g|png|gif|webp|avif)(\?|#|$)/i.test(String(url || ''));
}

export default {
    name: 'UnitDetailView',
    components: {
        InterestedButton,
        LocationWithCity,
        PropertyCard,
        PropertyListingBreadcrumb,
        SectionHeading,
    },
    props: {
        prefetchedUnit: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            loading: true,
            error: '',
            unit: null,
            logoFailed: false,
            imageFailed: false,
            defaultPropertyLogo,
            activeGalleryUrl: '',
            brokenGalleryThumbs: {},
            projectSiblingCards: [],
            suggestedCards: [],
            similarUnits: [],
            relatedRequestId: 0,
        };
    },
    computed: {
        routeKey() {
            const {
                citySlug,
                projectSlug,
                listingRef,
                slug,
                projectSlug: legacyProjectSlug,
                unitRef,
                legacySlug,
            } = this.$route.params;

            return [
                this.$route.name,
                citySlug || slug || legacyProjectSlug,
                projectSlug,
                listingRef || unitRef,
                legacySlug,
            ].join('|');
        },
        isLegacyRoute() {
            return this.$route.name === 'unit-detail-legacy';
        },
        isPropertiesListingRoute() {
            return this.$route.name === 'property-listing-detail'
                || this.$route.name === 'property-listing-detail-legacy';
        },
        isPrivateListing() {
            return isPrivateOnWebsite(this.unit || {});
        },
        listingCity() {
            return getListingCity(this.unit || {});
        },
        cityBrowseRoute() {
            return this.listingCity ? getPropertiesByCityRoute(this.listingCity) : null;
        },
        unitTitle() {
            if (!this.unit) return 'Unit';
            return this.unit.unit_label || this.unit.unit_type || 'Unit';
        },
        displayProjectName() {
            return getWebsitePropertyDisplayName(this.unit || {});
        },
        listingMenuProperty() {
            if (!this.unit) {
                return {};
            }

            return mapUnitToPropertyCard(this.unit, {
                project_name: this.unit.project_name,
                city: this.unit.project_city,
                is_private_on_website: this.unit.is_private_on_website,
            });
        },
        logoSrc() {
            if (this.logoFailed || !this.unit?.logo) {
                return this.defaultPropertyLogo;
            }

            return resolveMediaUrl(this.unit.logo);
        },
        coverImage() {
            if (this.activeGalleryUrl && !this.imageFailed && isDirectImageUrl(this.activeGalleryUrl)) {
                return resolveMediaUrl(this.activeGalleryUrl);
            }

            const hero = this.unit?.image;
            if (!this.imageFailed && hero && isDirectImageUrl(hero)) {
                return resolveMediaUrl(hero);
            }

            const firstPhoto = this.visibleGalleryItems.find((item) => item.type === 'image');
            if (firstPhoto) {
                return resolveMediaUrl(firstPhoto.url);
            }

            return fallbackCoverImage || DEFAULT_COVER;
        },
        galleryItems() {
            if (!this.unit) return [];

            const seen = new Set();
            const items = [];

            const addItem = (preview) => {
                const url = resolveMediaUrl(preview?.url || preview?.thumbnail || '');
                const thumbnail = resolveMediaUrl(preview?.thumbnail || preview?.url || '');
                if (!thumbnail || seen.has(url)) return;
                seen.add(url);
                items.push({
                    url,
                    thumbnail,
                    type: preview.type,
                    label: preview.label,
                });
            };

            (this.unit.asset_images || []).forEach((url) => {
                addItem({
                    type: 'image',
                    url,
                    thumbnail: url,
                });
            });

            const hasAssetPhotos = (this.unit.asset_images || []).length > 0;

            extractMediaPreviews(this.unit.images_videos_link || '').forEach((preview) => {
                if (hasAssetPhotos && preview.type !== 'video') return;
                addItem(preview);
            });

            if (!hasAssetPhotos && this.unit.image && isDirectImageUrl(this.unit.image)) {
                addItem({
                    type: 'image',
                    url: this.unit.image,
                    thumbnail: this.unit.image,
                });
            }

            return items;
        },
        visibleGalleryItems() {
            return this.galleryItems.filter((item) => !this.brokenGalleryThumbs[item.url]);
        },
        hasGalleryImages() {
            return this.visibleGalleryItems.length > 0;
        },
        statusLabel() {
            return formatProjectStatus(this.unit?.building_status || this.unit?.project_status);
        },
        formattedPrice() {
            const price = pickUnitDisplayPrice(this.unit || {});
            if (!price) {
                return isUnitRentListing(this.unit) ? 'Rent on request' : formatCurrency(this.unit?.unit_price);
            }

            const formatted = formatCurrency(price);
            const suffix = buildUnitPriceSuffix(this.unit || {});
            return suffix ? `${formatted}${suffix}` : formatted;
        },
        propertyRoute() {
            if (!this.unit?.project_city && this.unit?.project_id == null) return null;
            return getPropertyDetailRoute({
                project_name: this.unit.project_name,
                city: this.unit.project_city,
                is_private_on_website: this.unit.is_private_on_website,
            });
        },
        projectSiblingHeading() {
            if (!this.displayProjectName) return 'Other Available Units';
            return `Other ${this.displayProjectName}'s Available Units`;
        },
        projectSiblingSubtitle() {
            const city = getProjectDisplayCity({ city: this.unit?.project_city });
            if (city) {
                return `More units for sale at ${this.displayProjectName} in ${city}.`;
            }
            return `More units for sale at ${this.displayProjectName}.`;
        },
        suggestedSubtitle() {
            return buildSimilarUnitsSubtitle(this.unit, this.similarUnits, formatCurrency);
        },
        specItems() {
            if (!this.unit) return [];

            const items = [
                {
                    key: 'size',
                    label: 'Unit Size',
                    value: this.unit.unit_size,
                },
                {
                    key: 'listing-type',
                    label: 'Listing Type',
                    value: isUnitRentListing(this.unit) ? 'For Rent' : 'For Sale',
                },
                {
                    key: 'reservation-fee',
                    label: 'Reservation Fee',
                    value: this.unit.reservation_fee
                        ? formatCurrency(this.unit.reservation_fee, { fallback: '—' })
                        : null,
                },
                {
                    key: 'reservation-deductible',
                    label: 'Reservation Deductible',
                    value: formatYesNo(this.unit.is_reservation_deductible),
                },
                {
                    key: 'payment-terms',
                    label: 'Payment Terms',
                    value: this.unit.payment_terms,
                },
                {
                    key: 'property',
                    label: 'Property',
                    value: this.displayProjectName,
                    to: this.propertyRoute,
                },
                {
                    key: 'city',
                    label: 'City',
                    value: this.listingCity || getProjectDisplayCity({
                        city: this.unit.project_city,
                    }),
                    to: this.cityBrowseRoute,
                },
                {
                    key: 'building',
                    label: 'Building',
                    value: this.unit.building_name,
                },
                {
                    key: 'pet-allowed',
                    label: 'Pets Allowed',
                    value: formatYesNo(this.unit.is_pet_allowed),
                },
                {
                    key: 'smoking',
                    label: 'Smoking Allowed',
                    value: formatYesNo(this.unit.is_allowed_smoking),
                },
            ];

            return items
                .map((item) => ({
                    ...item,
                    value: displayValue(item.value, '—'),
                }))
                .filter((item) => item.value !== '—' || item.key === 'property');
        },
    },
    watch: {
        routeKey: {
            immediate: true,
            handler() {
                this.loadUnit();
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
            if (item.type === 'video') return false;
            const active = this.activeGalleryUrl || this.unit?.image || '';
            return item.url === active || item.thumbnail === active;
        },
        onGallerySelect(item) {
            if (item.type === 'video') {
                this.$openMediaViewer(item);
                return;
            }

            this.imageFailed = false;
            this.activeGalleryUrl = item.url;
        },
        updateSeo() {
            if (!this.unit) return;

            const path = getUnitDetailPath(this.unit);

            updatePageMeta({
                title: `${this.unitTitle} | ${this.displayProjectName || 'Mr. Boss Realty'}`,
                description: this.buildSeoDescription(),
                path,
                ogImage: resolveMediaUrl(this.unit.image) || undefined,
                canonical: getSiteUrl(path),
            });
        },
        buildSeoDescription() {
            const city = getProjectDisplayCity({
                city: this.unit?.project_city,
            });
            const propertyPart = this.displayProjectName
                ? ` at ${this.displayProjectName}${city ? `, ${city}` : ''}`
                : '';

            return `${this.unitTitle}${propertyPart}. View pricing, size, bedrooms, and availability with Mr. Boss Realty.`;
        },
        async loadUnit() {
            if (this.prefetchedUnit) {
                this.loading = false;
                this.error = '';
                this.logoFailed = false;
                this.imageFailed = false;
                this.brokenGalleryThumbs = {};
                this.applyUnit(this.prefetchedUnit);
                return;
            }

            this.loading = true;
            this.error = '';
            this.unit = null;
            this.logoFailed = false;
            this.imageFailed = false;
            this.activeGalleryUrl = '';
            this.brokenGalleryThumbs = {};

            try {
                let res;

                if (this.isLegacyRoute) {
                    const legacySlug = this.$route.params.legacySlug;
                    res = await this.$api.get(`/units/public/${encodeURIComponent(legacySlug)}`);
                } else if (this.$route.name === 'property-listing-detail') {
                    const { citySlug, projectSlug, listingRef } = this.$route.params;
                    res = await this.$api.get(
                        `/projects/public/${encodeURIComponent(citySlug)}/${encodeURIComponent(projectSlug)}/${encodeURIComponent(listingRef)}`,
                    );
                } else {
                    this.error = 'This unit could not be found.';
                    return;
                }

                this.applyUnit(res.data);
            } catch (err) {
                console.error('Failed to load unit:', err);
                if (err.response?.status === 404) {
                    this.error = 'This unit could not be found.';
                } else {
                    this.error = 'Could not load this unit right now. Please try again.';
                }
            } finally {
                this.loading = false;
            }
        },
        applyUnit(unit) {
            this.unit = unit;
            this.projectSiblingCards = [];
            this.suggestedCards = [];
            this.similarUnits = [];
            const hero = resolveMediaUrl(this.unit.image || '');
            this.activeGalleryUrl = isDirectImageUrl(hero) ? hero : '';
            this.updateSeo();
            this.loadRelatedUnits();

            const canonicalPath = getUnitDetailPath(this.unit);
            const shouldRedirect = this.$route.name === 'property-listing-detail-legacy'
                || this.$route.name === 'unit-detail-legacy'
                || (
                    canonicalPath
                    && canonicalPath !== '/properties'
                    && this.$route.path !== canonicalPath
                );

            if (shouldRedirect) {
                this.$router.replace(getUnitDetailRoute(this.unit)).catch(() => {});
            }

            scrollToPageTopAfterRender();
        },
        async loadRelatedUnits() {
            if (!this.unit) return;

            const requestId = ++this.relatedRequestId;
            const currentUnit = this.unit;

            try {
                const projectApiPath = buildProjectPublicApiPath({
                    project_name: currentUnit.project_name,
                    city: currentUnit.project_city,
                    is_private_on_website: currentUnit.is_private_on_website,
                });

                const [projectResult, listingsResult] = await Promise.all([
                    projectApiPath
                        ? this.$api
                            .get(projectApiPath)
                            .then((res) => res.data)
                            .catch(() => null)
                        : Promise.resolve(null),
                    this.$api
                        .get('/units/public/list', { params: { limit: 'all' } })
                        .then((res) => res.data)
                        .catch(() => []),
                ]);

                if (requestId !== this.relatedRequestId) return;

                if (projectResult?.units?.length) {
                    const siblings = pickProjectSiblingUnits(projectResult.units, currentUnit);
                    this.projectSiblingCards = siblings.map((unit) => mapUnitToPropertyCard(unit, projectResult));
                }

                const similar = pickSimilarUnits(listingsResult, currentUnit);
                this.similarUnits = similar;
                this.suggestedCards = similar.map(mapPublicUnitToPropertyCard);
            } catch (err) {
                console.error('Failed to load related units:', err);
            }
        },
    },
};
</script>
