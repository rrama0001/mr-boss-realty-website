<template>
    <div class="site-layout">
        <a href="#main-content" class="skip-link">Skip to main content</a>
        <SiteHeader />
        <main id="main-content" class="site-main" tabindex="-1">
            <keep-alive include="HomeView,PropertiesView,PropertySegmentView,UnitsView,ContactView">
                <router-view />
            </keep-alive>
        </main>
        <SiteFooter />
    </div>
</template>

<script>
import SiteHeader from '@/components/layout/SiteHeader.vue';
import SiteFooter from '@/components/layout/SiteFooter.vue';

export default {
    name: 'SiteLayout',
    components: {
        SiteHeader,
        SiteFooter,
    },
};
</script>
