<template>
    <div class="legal-page">
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
                    <span class="property-hero__breadcrumb-current" aria-current="page">{{ page.title }}</span>
                </nav>
                <div class="property-hero__copy legal-page__hero-copy">
                    <p class="property-hero__eyebrow">{{ page.heroEyebrow }}</p>
                    <h1 class="property-hero__title">{{ page.title }}</h1>
                    <p v-if="page.heroLead" class="property-hero__lead">{{ page.heroLead }}</p>
                    <p v-if="page.lastUpdated" class="legal-page__updated">Last updated: {{ page.lastUpdated }}</p>
                </div>
            </div>
        </section>

        <section class="home-section home-section--light legal-page__main">
            <div class="container-xl legal-page__layout">
                <article class="legal-page__content">
                    <p v-if="page.notice" class="legal-page__notice">{{ page.notice }}</p>

                    <div
                        v-if="page.intro"
                        class="legal-page__html-block legal-page__rich-text"
                        v-html="normalizeHtml(page.intro)"
                    />

                    <section
                        v-for="section in page.sections"
                        :key="section.id"
                        class="legal-page__section"
                    >
                        <h2 class="legal-page__section-title">{{ section.title }}</h2>
                        <div class="legal-page__section-body legal-page__rich-text">
                            <div
                                v-for="(paragraph, index) in section.paragraphs"
                                :key="`${section.id}-${index}`"
                                class="legal-page__html-block"
                                v-html="normalizeHtml(paragraph)"
                            />
                            <ul v-if="section.list?.length" class="legal-page__list">
                                <li v-for="item in section.list" :key="item">{{ item }}</li>
                            </ul>
                        </div>
                    </section>
                </article>

                <aside v-if="relatedLinks.length" class="legal-page__aside" aria-label="Related legal pages">
                    <h2 class="legal-page__aside-title">Legal &amp; policies</h2>
                    <ul class="legal-page__aside-links">
                        <li v-for="item in relatedLinks" :key="item.to">
                            <router-link :to="item.to">{{ item.label }}</router-link>
                        </li>
                    </ul>
                </aside>
            </div>
        </section>
    </div>
</template>

<script>
import { LEGAL_PAGES } from '@/config/legalContent';
import { LEGAL_NAV_ITEMS } from '@/config/legalNav';
import { normalizeHtml } from '@/utils/normalizeHtml';
import heroImageUrl from '@/assets/images/hero-bg-03-apartment-towers.jpg';

export default {
    name: 'LegalPageView',
    props: {
        pageKey: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            heroImageUrl,
        };
    },
    computed: {
        page() {
            return LEGAL_PAGES[this.pageKey] || LEGAL_PAGES['privacy-policy'];
        },
        relatedLinks() {
            return LEGAL_NAV_ITEMS.filter(
                (item) => item.to !== '/sitemap' && item.to !== `/${this.page.slug}`,
            );
        },
    },
    methods: {
        normalizeHtml,
    },
};
</script>
