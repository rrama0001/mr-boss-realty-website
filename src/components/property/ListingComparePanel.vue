<template>
    <section class="listing-compare-panel unit-detail">
        <div v-if="loading" class="listing-compare-panel__state">
            <div class="property-detail__spinner" aria-hidden="true"></div>
            <p>Loading listing...</p>
        </div>

        <div v-else-if="error" class="listing-compare-panel__state listing-compare-panel__state--error">
            <p>{{ error }}</p>
        </div>

        <template v-else-if="listing">
            <div class="property-detail__section-head">
                <div>
                    <div class="section-title-row">
                        <h2>{{ sectionTitle }}</h2>
                        <p class="unit-detail__price">{{ priceLabel }}</p>
                        <InterestedButton
                            v-if="kind === 'unit'"
                            :unit-slug="listing.slug"
                            compact
                        />
                        <InterestedButton
                            v-else
                            :message="interestMessage"
                            compact
                        />
                    </div>
                    <p v-if="projectName">
                        Part of
                        <router-link
                            v-if="propertyRoute"
                            :to="propertyRoute"
                            class="unit-detail__property-link"
                        >
                            {{ projectName }}
                        </router-link>
                        <span v-else>{{ projectName }}</span>
                        <template v-if="projectCity">
                            <span class="listing-compare-panel__part-of-sep" aria-hidden="true"> | </span>
                            <router-link
                                v-if="cityBrowseRoute"
                                :to="cityBrowseRoute"
                                class="listing-compare-panel__part-of-city"
                            >{{ projectCity }}</router-link>
                            <span v-else class="listing-compare-panel__part-of-city">{{ projectCity }}</span>
                        </template>
                    </p>
                </div>
            </div>

            <div class="unit-detail__specs card">
                <div class="card-body unit-detail__body unit-detail__body--with-gallery">
                    <div class="unit-detail__specs-column">
                        <div class="unit-detail__spec-list listing-compare-panel__spec-list" role="list">
                            <div
                                v-for="item in specItems"
                                :key="item.key"
                                class="listing-compare-panel__spec-row"
                                :class="{ 'is-highlighted': highlightedSpecKey === item.key }"
                                role="listitem"
                            >
                                <span
                                    class="listing-compare-panel__spec-label"
                                    :role="allowSpecHighlight ? 'button' : null"
                                    :tabindex="allowSpecHighlight ? 0 : null"
                                    @click="onSpecLabelClick(item.key)"
                                    @keydown.enter.prevent="onSpecLabelClick(item.key)"
                                    @keydown.space.prevent="onSpecLabelClick(item.key)"
                                >{{ item.label }}</span>
                                <span class="listing-compare-panel__spec-value">
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
                                </span>
                            </div>
                        </div>
                        <div class="unit-detail__spec-actions">
                            <InterestedButton
                                v-if="kind === 'unit'"
                                :unit-slug="listing.slug"
                                compact
                            />
                            <InterestedButton
                                v-else
                                :message="interestMessage"
                                compact
                            />
                        </div>
                    </div>

                    <aside class="unit-detail__gallery listing-compare-panel__gallery" aria-label="Listing photos">
                        <ul v-if="visibleGalleryItems.length" class="unit-detail__gallery-grid">
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
                                        : (item.label || `View photo ${index + 1}`)"
                                    :aria-current="isGalleryItemActive(item) ? 'true' : null"
                                    @click="onGallerySelect(item)"
                                >
                                    <img
                                        :src="item.thumbnail"
                                        :alt="item.label || `${title} photo ${index + 1}`"
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
        </template>
    </section>
</template>

<script>
import InterestedButton from '@/components/InterestedButton.vue';
import { buildListingGalleryItems } from '@/utils/listingGallery';
import {
    buildListingSpecItems,
    formatListingPrice,
    formatListingTitle,
} from '@/utils/listingSpecItems';
import { getPropertyDetailRoute, getPropertiesByCityRoute } from '@/utils/propertyRoutes';
import { getWebsitePropertyDisplayName } from '@/utils/propertyDisplayName';
import { getProjectDisplayCity } from '@/utils/mapProjectToProperty';
import { buildBuildingInterestMessage } from '@/utils/siteChat';

export default {
    name: 'ListingComparePanel',
    components: { InterestedButton },
    emits: ['spec-highlight'],
    props: {
        kind: {
            type: String,
            default: '',
        },
        listing: {
            type: Object,
            default: null,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        error: {
            type: String,
            default: '',
        },
        highlightedSpecKey: {
            type: String,
            default: '',
        },
        allowSpecHighlight: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            activeGalleryUrl: '',
            brokenGalleryThumbs: {},
        };
    },
    computed: {
        sectionTitle() {
            if (!this.listing) {
                return this.kind === 'building' ? 'Whole Property' : 'Unit';
            }

            if (this.kind === 'building') {
                return this.listing.building_name
                    || this.listing.building_type
                    || 'Whole Property';
            }

            return this.listing.unit_type
                || this.listing.unit_label
                || 'Unit';
        },
        title() {
            if (!this.listing) return 'Listing';
            return formatListingTitle(this.kind, this.listing);
        },
        projectName() {
            if (!this.listing) return '';
            return getWebsitePropertyDisplayName(this.listing);
        },
        projectCity() {
            const city = String(this.listing?.project_city || '').trim();
            if (!city) return '';
            return getProjectDisplayCity({ city });
        },
        cityBrowseRoute() {
            if (!this.listing?.project_city) return null;
            return getPropertiesByCityRoute(this.listing.project_city);
        },
        priceLabel() {
            if (!this.listing) return '';
            return formatListingPrice(this.kind, this.listing);
        },
        propertyRoute() {
            if (!this.listing) return null;
            return getPropertyDetailRoute({
                project_name: this.listing.project_name,
                city: this.listing.project_city,
                is_private_on_website: this.listing.is_private_on_website,
            });
        },
        interestMessage() {
            if (this.kind !== 'building' || !this.listing) return '';
            return buildBuildingInterestMessage(
                this.listing.building_name,
                this.listing.project_slug,
            );
        },
        specItems() {
            if (!this.listing) return [];
            return buildListingSpecItems(this.kind, this.listing);
        },
        galleryItems() {
            if (!this.listing) return [];
            return buildListingGalleryItems(this.kind, this.listing);
        },
        visibleGalleryItems() {
            return this.galleryItems.filter((item) => !this.brokenGalleryThumbs[item.url]);
        },
    },
    watch: {
        listing() {
            this.activeGalleryUrl = '';
            this.brokenGalleryThumbs = {};
        },
    },
    methods: {
        onSpecLabelClick(specKey) {
            if (!this.allowSpecHighlight) {
                return;
            }

            this.$emit('spec-highlight', specKey);
        },
        isGalleryItemActive(item) {
            if (item.type === 'video') return false;

            const active = this.activeGalleryUrl || this.listing?.image || '';
            return item.url === active || item.thumbnail === active;
        },
        onGallerySelect(item) {
            if (item.type === 'video') {
                this.$openMediaViewer(item);
                return;
            }

            this.activeGalleryUrl = item.url;
        },
        onGalleryThumbError(url) {
            this.brokenGalleryThumbs = {
                ...this.brokenGalleryThumbs,
                [url]: true,
            };
        },
    },
};
</script>
