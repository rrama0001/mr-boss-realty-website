<template>
    <article class="property-card">
        <div class="property-card__media">
            <img
                :src="cardImage"
                :alt="displayTitle"
                class="property-card__image"
                :loading="imageLoading"
                :fetchpriority="fetchPriority"
                width="800"
                height="600"
                @error="onImageError"
            />
            <span
                class="property-card__badge"
                :class="badgeClass"
            >
                {{ property.status }}
            </span>
        </div>
        <div class="property-card__body">
            <div class="property-card__content">
                <div class="property-card__title-row">
                    <h3 class="property-card__title">{{ displayTitle }}</h3>
                    <PropertyCardMenu v-if="showMenu" :property="property" />
                </div>
                <p v-if="displayPropertyName" class="property-card__property-name">{{ displayPropertyName }}</p>
                <p class="property-card__location">
                    <LocationWithCity
                        v-if="property.city"
                        :city="property.city"
                        :detail="property.locationDetail"
                    />
                    <span v-else>{{ property.location }}</span>
                </p>
                <p class="property-card__price">{{ formattedPrice }}</p>
                <ul v-if="metaItems.length" class="property-card__meta">
                    <li v-for="(item, index) in metaItems" :key="`${item.text}-${index}`">
                        <i :class="item.icon" aria-hidden="true"></i> {{ item.text }}
                    </li>
                </ul>
            </div>
            <div v-if="showLink || displayInterestButton" class="property-card__actions">
                <router-link v-if="showLink" :to="detailLinkTo" class="property-card__link">
                    {{ linkLabel }}
                </router-link>
                <InterestedButton
                    v-if="displayInterestButton"
                    :unit-slug="property.unitSlug"
                    :property-slug="property.propertySlug"
                    :message="property.interestMessage"
                    compact
                />
            </div>
        </div>
    </article>
</template>

<script>
import InterestedButton from '@/components/InterestedButton.vue';
import LocationWithCity from '@/components/property/LocationWithCity.vue';
import PropertyCardMenu from '@/components/property/PropertyCardMenu.vue';
import { getWebsitePropertyDisplayName } from '@/utils/propertyDisplayName';
import fallbackCoverImage from '@/assets/images/hero-bg-03-apartment-towers.jpg';

export default {
    name: 'PropertyCard',
    components: { InterestedButton, LocationWithCity, PropertyCardMenu },
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
        showLink: {
            type: Boolean,
            default: true,
        },
        linkLabel: {
            type: String,
            default: 'View Details',
        },
        showInterestButton: {
            type: Boolean,
            default: true,
        },
        showMenu: {
            type: Boolean,
            default: true,
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

            return this.property.image || this.fallbackImage;
        },
        displayTitle() {
            if (this.property.propertyName) {
                return this.property.title;
            }

            return getWebsitePropertyDisplayName(this.property);
        },
        displayPropertyName() {
            if (!this.property.propertyName) {
                return '';
            }

            return getWebsitePropertyDisplayName({
                is_private_on_website: this.property.is_private_on_website,
                project_name: this.property.propertyName,
            });
        },
        displayInterestButton() {
            if (!this.showInterestButton) return false;
            return Boolean(this.property.unitSlug || this.property.propertySlug || this.property.interestMessage);
        },
        metaItems() {
            if (Array.isArray(this.property.metaItems) && this.property.metaItems.length) {
                return this.property.metaItems;
            }

            const items = [];

            if (this.property.beds != null) {
                items.push({ icon: 'ti ti-bed', text: `${this.property.beds} Br` });
            }
            if (this.property.baths != null) {
                items.push({ icon: 'ti ti-bath', text: `${this.property.baths} Ba` });
            }
            if (this.property.garages) {
                items.push({ icon: 'ti ti-car', text: `${this.property.garages} Gr` });
            }
            if (this.property.sqft != null) {
                items.push({ icon: 'ti ti-ruler', text: `${this.property.sqft} sqm` });
            }

            return items;
        },
        badgeClass() {
            const status = String(this.property.status || '').toLowerCase();
            return status.includes('rent') ? 'property-card__badge--rent' : 'property-card__badge--sale';
        },
        formattedPrice() {
            if (this.property.priceLabel) {
                return this.property.priceLabel;
            }

            const value = Number(this.property.price || 0);
            if (!value) {
                return 'Price on request';
            }

            const formatted = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
                maximumFractionDigits: 0,
            }).format(value);

            const isRent = String(this.property.status || '').toLowerCase().includes('rent');
            const prefix = this.property.priceFrom ? 'From ' : '';

            if (this.property.priceSuffix) {
                return `${prefix}${formatted}${this.property.priceSuffix}`;
            }

            if (isRent) {
                return `${prefix}${formatted} / mo`;
            }

            return `${prefix}${formatted}`;
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
