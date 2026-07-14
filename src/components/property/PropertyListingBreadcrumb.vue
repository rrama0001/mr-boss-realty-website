<template>
    <nav class="property-hero__breadcrumb" aria-label="Breadcrumb">
        <router-link to="/">Home</router-link>
        <span class="property-hero__breadcrumb-sep" aria-hidden="true">/</span>
        <template v-if="isPropertiesListingRoute">
            <router-link to="/properties">Properties</router-link>
            <template v-if="listingCity && cityBrowseRoute">
                <span class="property-hero__breadcrumb-sep" aria-hidden="true">/</span>
                <router-link :to="cityBrowseRoute">{{ listingCity }}</router-link>
            </template>
            <template v-if="projectBreadcrumbLabel">
                <span class="property-hero__breadcrumb-sep" aria-hidden="true">/</span>
                <router-link v-if="propertyRoute" :to="propertyRoute">{{ projectBreadcrumbLabel }}</router-link>
                <span v-else>{{ projectBreadcrumbLabel }}</span>
            </template>
            <span class="property-hero__breadcrumb-sep" aria-hidden="true">/</span>
            <span class="property-hero__breadcrumb-current" aria-current="page">{{ listingTitle }}</span>
        </template>
        <template v-else>
            <router-link :to="fallbackParentTo">{{ fallbackParentLabel }}</router-link>
            <span class="property-hero__breadcrumb-sep" aria-hidden="true">/</span>
            <span class="property-hero__breadcrumb-current" aria-current="page">{{ listingTitle }}</span>
        </template>
    </nav>
</template>

<script>
import { PRIVATE_PROPERTY_LABEL } from '@/utils/propertyDisplayName';
import { getPropertiesByCityRoute } from '@/utils/propertyRoutes';

export default {
    name: 'PropertyListingBreadcrumb',
    props: {
        listingTitle: {
            type: String,
            required: true,
        },
        isPropertiesListingRoute: {
            type: Boolean,
            default: false,
        },
        isPrivateListing: {
            type: Boolean,
            default: false,
        },
        displayProjectName: {
            type: String,
            default: '',
        },
        propertyRoute: {
            type: Object,
            default: null,
        },
        listingCity: {
            type: String,
            default: '',
        },
        fallbackParentLabel: {
            type: String,
            default: 'Units',
        },
        fallbackParentTo: {
            type: String,
            default: '/units',
        },
    },
    computed: {
        projectBreadcrumbLabel() {
            if (this.isPrivateListing) {
                return PRIVATE_PROPERTY_LABEL;
            }

            return this.displayProjectName;
        },
        cityBrowseRoute() {
            return this.listingCity ? getPropertiesByCityRoute(this.listingCity) : null;
        },
    },
};
</script>
