<template>
    <section v-if="resolving" class="property-detail__state">
        <div class="property-detail__spinner" aria-hidden="true"></div>
        <p>Loading...</p>
    </section>
    <PropertiesView v-else-if="cityBrowse" />
</template>

<script>
import PropertiesView from '@/views/PropertiesView.vue';
import { cityToSlug, getProjectUrlSegments } from '@/utils/propertyPublicUrl';

export default {
    name: 'PropertySegmentView',
    components: { PropertiesView },
    data() {
        return {
            resolving: true,
            cityBrowse: false,
        };
    },
    watch: {
        '$route.params.slug': {
            immediate: true,
            handler() {
                this.resolveSegment();
            },
        },
    },
    methods: {
        async resolveSegment() {
            this.resolving = true;
            this.cityBrowse = false;

            const slug = String(this.$route.params.slug || '').trim().toLowerCase();
            if (!slug) {
                this.$router.replace({ name: 'properties' }).catch(() => {});
                return;
            }

            try {
                const { data: projects } = await this.$api.get('/projects/public/list');
                const list = projects || [];

                const cityNames = [...new Set(list.map((project) => project.city).filter(Boolean))];
                const matchingCity = cityNames.find((city) => cityToSlug(city) === slug);

                if (matchingCity) {
                    this.cityBrowse = true;
                    this.resolving = false;
                    return;
                }

                const project = list.find((item) => {
                    const segments = getProjectUrlSegments(item);
                    return segments.citySlug === slug
                        || segments.projectSlug === slug
                        || `${segments.projectSlug}-${segments.citySlug}` === slug;
                });

                if (project) {
                    const { citySlug, projectSlug } = getProjectUrlSegments(project);
                    await this.$router.replace({
                        name: 'property-detail',
                        params: { citySlug, projectSlug },
                    });
                    return;
                }

                this.cityBrowse = true;
                this.resolving = false;
            } catch (err) {
                console.error('Failed to resolve property segment:', err);
                this.$router.replace({ name: 'properties' }).catch(() => {});
            }
        },
    },
};
</script>
