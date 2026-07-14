<template>
    <router-link v-if="cityRoute" :to="cityRoute" class="city-link">{{ displayCity }}</router-link>
    <span v-else-if="displayCity">{{ displayCity }}</span>
</template>

<script>
import { getListingCity } from '@/utils/propertyCity';
import { getPropertiesByCityRoute } from '@/utils/propertyRoutes';

export default {
    name: 'CityLink',
    props: {
        city: {
            type: String,
            default: '',
        },
    },
    computed: {
        displayCity() {
            return getListingCity({ city: this.city }) || '';
        },
        cityRoute() {
            if (!this.displayCity) return null;
            return getPropertiesByCityRoute(this.displayCity);
        },
    },
};
</script>
