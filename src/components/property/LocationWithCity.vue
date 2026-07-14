<template>
    <span class="location-with-city">
        <CityLink :city="city" />
        <template v-if="displayCity && detail">
            <span class="location-with-city__sep" aria-hidden="true"> · </span>
            <span class="location-with-city__detail">{{ detail }}</span>
        </template>
    </span>
</template>

<script>
import CityLink from '@/components/property/CityLink.vue';
import { getListingCity } from '@/utils/propertyCity';

export default {
    name: 'LocationWithCity',
    components: { CityLink },
    props: {
        city: {
            type: String,
            default: '',
        },
        detail: {
            type: String,
            default: '',
        },
    },
    computed: {
        displayCity() {
            return getListingCity({ city: this.city }) || '';
        },
    },
};
</script>
