<template>
    <section v-if="loading" class="property-detail__state">
        <div class="property-detail__spinner" aria-hidden="true"></div>
        <p>Loading listing...</p>
    </section>

    <section v-else-if="error" class="property-detail__state property-detail__state--error">
        <p>{{ error }}</p>
        <router-link to="/properties" class="btn btn-primary">Back to Properties</router-link>
    </section>

    <UnitDetailView
        v-else-if="listingKind === 'unit'"
        :key="routeKey"
        :prefetched-unit="prefetchedUnit"
    />
    <BuildingDetailView
        v-else-if="listingKind === 'building'"
        :key="routeKey"
        :prefetched-building="prefetchedBuilding"
    />
</template>

<script>
import UnitDetailView from '@/views/UnitDetailView.vue';
import BuildingDetailView from '@/views/BuildingDetailView.vue';
import { buildListingPublicApiPathFromRoute } from '@/utils/propertyCity';
import { getBuildingDetailRoute, getUnitDetailRoute } from '@/utils/propertyRoutes';
import { scrollToPageTopAfterRender } from '@/utils/scroll';

const LISTING_HASH_PATTERN = /^[a-f0-9]{8}$/i;

function isListingHashRef(ref = '') {
    return LISTING_HASH_PATTERN.test(String(ref || '').trim());
}

function isWholeBuildingListing(data = {}) {
    return Boolean(data.is_whole_property_listing);
}

export default {
    name: 'PropertyListingDetailView',
    components: {
        UnitDetailView,
        BuildingDetailView,
    },
    data() {
        return {
            loading: true,
            error: '',
            listingKind: null,
            prefetchedUnit: null,
            prefetchedBuilding: null,
        };
    },
    computed: {
        routeKey() {
            const { citySlug, projectSlug, listingRef } = this.$route.params;

            return [
                this.$route.name,
                citySlug,
                projectSlug,
                listingRef,
            ].join('|');
        },
        isSegmentRoute() {
            return this.$route.name === 'property-listing-detail';
        },
    },
    watch: {
        routeKey: {
            immediate: true,
            handler() {
                this.resolveListing();
            },
        },
    },
    methods: {
        segmentListingApiPath() {
            const { citySlug, projectSlug, listingRef } = this.$route.params;
            return buildListingPublicApiPathFromRoute(citySlug, projectSlug, listingRef);
        },
        applyListingPayload(data) {
            if (isWholeBuildingListing(data)) {
                this.listingKind = 'building';
                this.prefetchedBuilding = data;
                this.redirectToCanonicalListing('building', data);
                return;
            }

            this.listingKind = 'unit';
            this.prefetchedUnit = data;
            this.redirectToCanonicalListing('unit', data);
        },
        async fetchListingFromPath(path) {
            const res = await this.$api.get(path);
            return res.data;
        },
        isNotFoundError(err) {
            return err?.response?.status === 404;
        },
        isBlockingError(err) {
            const status = err?.response?.status;
            return status != null && status !== 404;
        },
        async resolveSegmentListing() {
            const segmentPath = this.segmentListingApiPath();
            if (!segmentPath) {
                this.error = 'This listing could not be found.';
                return;
            }

            const data = await this.fetchListingFromPath(segmentPath);
            this.applyListingPayload(data);
        },
        async resolveLegacyListing() {
            const listingRef = String(this.$route.params.listingRef || '').trim();
            if (!listingRef) {
                this.error = 'This listing could not be found.';
                return;
            }

            if (isListingHashRef(listingRef)) {
                try {
                    const data = await this.fetchListingFromPath(
                        `/units/public/${encodeURIComponent(listingRef)}`,
                    );
                    this.applyListingPayload(data);
                    return;
                } catch (err) {
                    if (this.isBlockingError(err)) {
                        throw err;
                    }
                }
            }

            this.error = 'This listing could not be found.';
        },
        async resolveListing() {
            this.loading = true;
            this.error = '';
            this.listingKind = null;
            this.prefetchedUnit = null;
            this.prefetchedBuilding = null;

            try {
                if (this.isSegmentRoute) {
                    await this.resolveSegmentListing();
                    return;
                }

                await this.resolveLegacyListing();
            } catch (err) {
                console.error('Failed to load listing:', err);
                this.error = 'Could not load this listing right now. Please try again.';
            } finally {
                this.loading = false;
                if (this.listingKind) {
                    scrollToPageTopAfterRender();
                }
            }
        },
        redirectToCanonicalListing(kind, listing) {
            const route = kind === 'building'
                ? getBuildingDetailRoute(listing)
                : getUnitDetailRoute(listing);

            this.$router.replace(route).catch(() => {});
        },
    },
};
</script>
