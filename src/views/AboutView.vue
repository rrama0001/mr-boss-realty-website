<template>
    <div class="about-page">
        <section class="property-hero property-hero--detail property-hero--page about-page__hero">
            <img
                class="property-hero__bg"
                :src="heroImageUrl"
                alt=""
                width="1920"
                height="640"
                fetchpriority="high"
            />
            <div class="property-hero__overlay about-page__hero-overlay" aria-hidden="true"></div>
            <div class="container-xl property-hero__inner">
                <nav class="property-hero__breadcrumb" aria-label="Breadcrumb">
                    <router-link to="/">Home</router-link>
                    <span class="property-hero__breadcrumb-sep" aria-hidden="true">/</span>
                    <span class="property-hero__breadcrumb-current" aria-current="page">About Us</span>
                </nav>
                <div class="property-hero__copy about-page__hero-copy">
                    <p class="property-hero__eyebrow">{{ pageContent.heroEyebrow }}</p>
                    <h1 class="property-hero__title">{{ pageContent.heroTitle }}</h1>
                    <p class="property-hero__lead">{{ pageContent.heroLead }}</p>
                </div>
            </div>
        </section>

        <section class="home-section home-section--light about-page__main">
            <div class="container-xl about-page__content">
                <div
                    v-if="pageContent.intro"
                    class="about-page__intro about-page__rich-text"
                    v-html="normalizeHtml(pageContent.intro)"
                />

                <div class="about-page__sections">
                    <article
                        v-for="section in pageContent.sections"
                        :key="section.id"
                        class="about-page__section"
                    >
                        <h2 class="about-page__section-title">{{ section.title }}</h2>
                        <div
                            class="about-page__section-body about-page__rich-text"
                            v-html="sectionHtml(section)"
                        />
                    </article>
                </div>
            </div>
        </section>

        <section class="about-page__values">
            <div class="container-xl about-page__content">
                <SectionHeading
                    :title="pageContent.valuesTitle"
                    :subtitle="pageContent.valuesLead"
                />
                <ul class="about-page__values-grid">
                    <li
                        v-for="value in pageContent.values"
                        :key="value.title"
                        class="about-page__value"
                    >
                        <i :class="value.icon" class="about-page__value-icon" aria-hidden="true"></i>
                        <h3 class="about-page__value-title">{{ value.title }}</h3>
                        <div
                            class="about-page__value-text about-page__rich-text"
                            v-html="normalizeHtml(value.description)"
                        />
                    </li>
                </ul>
            </div>
        </section>

        <section class="about-page__cta">
            <div class="container-xl about-page__cta-inner">
                <div class="about-page__cta-copy">
                    <h2 class="about-page__cta-title">{{ pageContent.ctaTitle }}</h2>
                    <p class="about-page__cta-lead">{{ pageContent.ctaLead }}</p>
                </div>
                <div class="about-page__cta-actions">
                    <router-link :to="pageContent.ctaPrimaryTo" class="btn btn-primary">
                        {{ pageContent.ctaPrimaryLabel }}
                    </router-link>
                    <router-link :to="pageContent.ctaSecondaryTo" class="btn btn-outline-primary">
                        {{ pageContent.ctaSecondaryLabel }}
                    </router-link>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import SectionHeading from '@/components/home/SectionHeading.vue';
import { ABOUT_PAGE } from '@/config/aboutContent';
import { normalizeHtml } from '@/utils/normalizeHtml';
import heroImageUrl from '@/assets/images/hero-bg-about-company.jpg';

export default {
    name: 'AboutView',
    components: { SectionHeading },
    data() {
        return {
            heroImageUrl,
            pageContent: ABOUT_PAGE,
        };
    },
    methods: {
        normalizeHtml,
        sectionHtml(section = {}) {
            if (section.content) {
                return this.normalizeHtml(section.content);
            }

            if (Array.isArray(section.paragraphs) && section.paragraphs.length) {
                return section.paragraphs.map((paragraph) => this.normalizeHtml(paragraph)).join('');
            }

            return '';
        },
    },
};
</script>
