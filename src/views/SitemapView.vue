<template>
    <div class="legal-page sitemap-page">
        <section class="property-hero property-hero--detail legal-page__hero">
            <img
                class="property-hero__bg"
                :src="heroImageUrl"
                alt=""
                width="1920"
                height="640"
                fetchpriority="high"
            />
            <div class="property-hero__overlay legal-page__hero-overlay" aria-hidden="true"></div>
            <div class="container-xl property-hero__inner">
                <nav class="property-hero__breadcrumb" aria-label="Breadcrumb">
                    <router-link to="/">Home</router-link>
                    <span class="property-hero__breadcrumb-sep" aria-hidden="true">/</span>
                    <span class="property-hero__breadcrumb-current" aria-current="page">Sitemap</span>
                </nav>
                <div class="property-hero__copy legal-page__hero-copy">
                    <p class="property-hero__eyebrow">Site guide</p>
                    <h1 class="property-hero__title">Sitemap</h1>
                    <p class="property-hero__lead">Browse all main pages, company information, and legal policies on Mr. Boss Realty.</p>
                    <p class="sitemap-page__xml-note">
                        Search engines use our dynamic XML sitemap at
                        <a href="/sitemap.xml">/sitemap.xml</a>.
                    </p>
                </div>
            </div>
        </section>

        <section class="home-section home-section--light legal-page__main">
            <div class="container-xl sitemap-page__grid">
                <section
                    v-for="group in sitemapGroups"
                    :key="group.title"
                    class="sitemap-page__group"
                >
                    <h2 class="sitemap-page__group-title">{{ group.title }}</h2>
                    <ul class="sitemap-page__links">
                        <li v-for="link in group.links" :key="link.to">
                            <router-link :to="link.to">{{ link.label }}</router-link>
                        </li>
                    </ul>
                </section>
            </div>
        </section>
    </div>
</template>

<script>
import { SITE_NAV_ITEMS } from '@/config/siteNav';
import { LEGAL_NAV_ITEMS } from '@/config/legalNav';
import heroImageUrl from '@/assets/images/hero-bg-03-apartment-towers.jpg';

export default {
    name: 'SitemapView',
    data() {
        return {
            heroImageUrl,
            sitemapGroups: [
                {
                    title: 'Main pages',
                    links: [
                        { to: '/', label: 'Home' },
                        ...SITE_NAV_ITEMS,
                    ],
                },
                {
                    title: 'Legal & policies',
                    links: LEGAL_NAV_ITEMS.filter((item) => item.to !== '/sitemap'),
                },
            ],
        };
    },
};
</script>
