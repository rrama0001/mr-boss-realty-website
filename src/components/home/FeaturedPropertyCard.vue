<template>
    <article class="featured-property-card">
        <router-link :to="detailLinkTo" class="featured-property-card__media" tabindex="-1" aria-hidden="true">
            <img
                :src="cardImage"
                :alt="displayTitle"
                class="featured-property-card__image"
                :loading="imageLoading"
                :fetchpriority="fetchPriority"
                width="800"
                height="600"
                @error="onImageError"
            />
            <span class="featured-property-card__media-overlay" aria-hidden="true"></span>
        </router-link>

        <div class="featured-property-card__body">
            <div class="featured-property-card__header-row">
                <h3 class="featured-property-card__title">
                    <router-link :to="detailLinkTo">{{ displayTitle }}</router-link>
                </h3>
                <span v-if="property.status" class="featured-property-card__badge">
                    {{ property.status }}
                </span>
            </div>

            <p class="featured-property-card__location">
                <span v-if="displayCity">
                    <span class="featured-property-card__city-at" aria-hidden="true">@</span>
                    <CityLink :city="property.city" />
                    <template v-if="locationDetail">
                        <span class="featured-property-card__location-sep" aria-hidden="true"> · </span>
                        <span>{{ locationDetail }}</span>
                    </template>
                </span>
                <span v-else>{{ property.location }}</span>
            </p>

            <ul v-if="metaItems.length" class="featured-property-card__meta">
                <li
                    v-for="(item, index) in metaItems"
                    :key="`${item.text}-${index}`"
                    class="featured-property-card__meta-item"
                >
                    <i :class="item.icon" aria-hidden="true"></i>
                    <span>{{ item.text }}</span>
                </li>
            </ul>

            <router-link :to="detailLinkTo" class="featured-property-card__link">
                <span>{{ linkLabel }}</span>
                <i class="ti ti-arrow-right" aria-hidden="true"></i>
            </router-link>
        </div>
    </article>
</template>

<script>
import CityLink from '@/components/property/CityLink.vue';
import { getListingCity } from '@/utils/propertyCity';
import { getWebsitePropertyDisplayName } from '@/utils/propertyDisplayName';
import { resolveMediaUrl } from '@/utils/mediaUrls';
import fallbackCoverImage from '@/assets/images/unit-default-image.jpg';

export default {
    name: 'FeaturedPropertyCard',
    components: { CityLink },
    props: {
        property: {
            type: Object,
            required: true,
        },
        imageLoading: {
            type: String,
            default: 'lazy',
        },
        fetchPriority: {
            type: String,
            default: 'auto',
        },
        linkLabel: {
            type: String,
            default: 'Browse Units',
        },
    },
    data() {
        return {
            imageFailed: false,
            fallbackImage: fallbackCoverImage,
        };
    },
    watch: {
        'property.image'() {
            this.imageFailed = false;
        },
    },
    computed: {
        cardImage() {
            if (this.imageFailed) {
                return this.fallbackImage;
            }

            return resolveMediaUrl(this.property.image) || this.fallbackImage;
        },
        displayTitle() {
            return getWebsitePropertyDisplayName(this.property);
        },
        displayCity() {
            return getListingCity({ city: this.property.city }) || '';
        },
        locationDetail() {
            return this.property.address || '';
        },
        metaItems() {
            const items = Array.isArray(this.property.metaItems) ? [...this.property.metaItems] : [];

            return items.filter((item) => {
                const icon = String(item?.icon || '');
                return !icon.includes('building-estate');
            });
        },
        detailLinkTo() {
            return this.property.detailTo || '/properties';
        },
    },
    methods: {
        onImageError() {
            this.imageFailed = true;
        },
    },
};
</script>
