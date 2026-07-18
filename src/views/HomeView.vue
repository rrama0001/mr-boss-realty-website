<template>
    <div class="home-page">
        <HomeHero :tagline="contactInfo.tagline" />

        <section class="home-section home-section--light home-section--gradient-blue">
            <div class="container-xl">
                <SectionHeading
                    title="Featured Properties"
                    subtitle="Hand-picked developments across Metro Manila, Cebu, and more."
                />
                <div v-if="featuredLoading" class="properties-page__state">
                    <div class="properties-page__spinner" aria-hidden="true"></div>
                    <p>Loading featured properties...</p>
                </div>
                <div v-else-if="featuredError" class="properties-page__state properties-page__state--error">
                    <p>{{ featuredError }}</p>
                    <button type="button" class="btn btn-primary" @click="loadFeaturedProperties">Try again</button>
                </div>
                <div v-else-if="!featuredProperties.length" class="properties-page__state">
                    <p>No featured properties yet. Please check back soon.</p>
                </div>
                <div v-else class="property-grid">
                    <FeaturedPropertyCard
                        v-for="(property, index) in featuredProperties"
                        :key="property.id"
                        :property="property"
                        :image-loading="index < 3 ? 'eager' : 'lazy'"
                        :fetch-priority="index === 0 ? 'high' : 'auto'"
                    />
                </div>
                <div class="home-section__action">
                    <router-link to="/properties" class="btn btn-primary">View All</router-link>
                </div>
            </div>
        </section>

        <section class="home-section">
            <div class="container-xl">
                <SectionHeading
                    title="Most Popular Places"
                    subtitle="Browse condos, houses, and commercial spaces by city."
                />
                <div class="places-grid">
                    <RouterLink
                        v-for="place in popularPlaces"
                        :key="place.id"
                        :to="getPlacePath(place)"
                        class="place-card"
                        :aria-label="`Browse properties in ${place.name}`"
                    >
                        <img :src="place.image" :alt="place.name" class="place-card__image" loading="lazy" />
                        <h3 class="place-card__name">{{ place.name }}</h3>
                        <p class="place-card__count">{{ formatPlaceCount(place.count) }}</p>
                    </RouterLink>
                </div>
            </div>
        </section>

        <section class="home-section home-section--light">
            <div class="container-xl">
                <SectionHeading
                    title="Properties for Sale"
                    subtitle="Condominiums, houses, and commercial spaces available to buy."
                />
                <div v-if="saleUnitsLoading" class="properties-page__state">
                    <div class="properties-page__spinner" aria-hidden="true"></div>
                    <p>Loading properties for sale...</p>
                </div>
                <div v-else-if="saleUnitsError" class="properties-page__state properties-page__state--error">
                    <p>{{ saleUnitsError }}</p>
                    <button type="button" class="btn btn-primary" @click="loadSaleUnits">Try again</button>
                </div>
                <div v-else-if="!saleProperties.length" class="properties-page__state">
                    <p>No units are listed for sale yet. Please check back soon.</p>
                </div>
                <div v-else class="property-grid property-grid--compact">
                    <PropertyCard
                        v-for="property in saleProperties"
                        :key="`sale-${property.id}`"
                        :property="property"
                    />
                </div>
            </div>
        </section>

        <section v-if="!rentUnitsLoading && rentProperties.length" class="home-section">
            <div class="container-xl">
                <SectionHeading
                    title="Properties for Rent"
                    subtitle="Studios, units, and homes for monthly, daily, or flexible leases."
                />
                <div class="property-grid property-grid--compact">
                    <PropertyCard
                        v-for="property in rentProperties"
                        :key="`rent-${property.id}`"
                        :property="property"
                    />
                </div>
            </div>
        </section>

        <section class="home-section home-section--light">
            <div class="container-xl">
                <SectionHeading
                    title="Why Choose Us"
                    subtitle="Trusted guidance from search to closing, backed by real agents."
                />
                <div class="feature-grid">
                    <article v-for="feature in whyChooseUs" :key="feature.title" class="feature-card">
                        <div
                            class="feature-card__icon"
                            :class="feature.iconTone ? `feature-card__icon--${feature.iconTone}` : 'feature-card__icon--default'"
                            aria-hidden="true"
                        >
                            <i :class="feature.icon"></i>
                        </div>
                        <h3 class="feature-card__title">{{ feature.title }}</h3>
                        <p class="feature-card__text">{{ feature.description }}</p>
                    </article>
                </div>
            </div>
        </section>

        <section v-if="trustedPartnersLoading || trustedPartners.length" class="home-section">
            <div class="container-xl">
                <SectionHeading
                    title="Our Trusted Partners"
                    subtitle="Developments we represent across the Philippines."
                />
                <div v-if="trustedPartnersLoading" class="properties-page__state">
                    <div class="properties-page__spinner" aria-hidden="true"></div>
                    <p>Loading trusted partners...</p>
                </div>
                <div v-else-if="trustedPartnersError" class="properties-page__state properties-page__state--error">
                    <p>{{ trustedPartnersError }}</p>
                    <button type="button" class="btn btn-primary" @click="loadTrustedPartners">Try again</button>
                </div>
                <div v-else class="partner-grid">
                    <RouterLink
                        v-for="partner in trustedPartners"
                        :key="partner.slug"
                        :to="partner.detailTo"
                        class="partner-card"
                        :aria-label="partner.name"
                    >
                        <img
                            class="partner-card__logo"
                            :src="partner.logoUrl"
                            :alt="`${partner.name} logo`"
                            loading="lazy"
                            decoding="async"
                        />
                    </RouterLink>
                </div>
            </div>
        </section>

        <section class="home-section home-section--faq">
            <div class="container-xl">
                <HomeFaqSection :items="faqs" />
            </div>
        </section>

        <section id="contact" class="home-section home-section--contact">
            <div class="container-xl">
                <div class="contact-panel">
                    <div class="contact-panel__form-wrap">
                        <h2 class="contact-panel__title">Ready to get started?</h2>
                        <p v-if="formSuccess" class="alert alert-success">Your message was sent successfully!</p>
                        <form class="contact-form" @submit.prevent="submitContact">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="visually-hidden" for="contact-name">Your name</label>
                                    <input
                                        id="contact-name"
                                        v-model="form.name"
                                        type="text"
                                        class="form-control"
                                        placeholder="Your Name"
                                        autocomplete="name"
                                        required
                                    />
                                </div>
                                <div class="col-md-6">
                                    <label class="visually-hidden" for="contact-email">Email address</label>
                                    <input
                                        id="contact-email"
                                        v-model="form.email"
                                        type="email"
                                        class="form-control"
                                        placeholder="Email Address"
                                        autocomplete="email"
                                        required
                                    />
                                </div>
                                <div class="col-12">
                                    <label class="visually-hidden" for="contact-phone">Phone number</label>
                                    <input
                                        id="contact-phone"
                                        v-model="form.phone"
                                        type="tel"
                                        class="form-control"
                                        placeholder="Phone Number"
                                        autocomplete="tel"
                                    />
                                </div>
                                <div class="col-12">
                                    <label class="visually-hidden" for="contact-message">Message</label>
                                    <textarea
                                        id="contact-message"
                                        v-model="form.message"
                                        rows="4"
                                        class="form-control"
                                        placeholder="Message"
                                        required
                                    ></textarea>
                                </div>
                                <div class="col-12">
                                    <LeadConsentNotice />
                                    <button type="submit" class="btn btn-primary">Send Message</button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="contact-panel__details">
                        <h3 class="contact-panel__details-title">Contact Details</h3>
                        <p class="contact-panel__details-lead">Please find below contact details and contact us today!</p>
                        <ul class="contact-panel__list">
                            <li><i class="ti ti-map-pin" aria-hidden="true"></i> {{ contactInfo.address }}</li>
                            <li><i class="ti ti-phone" aria-hidden="true"></i> {{ contactInfo.phone }}</li>
                            <li><i class="ti ti-mail" aria-hidden="true"></i> {{ contactInfo.email }}</li>
                            <li><i class="ti ti-clock" aria-hidden="true"></i> {{ contactInfo.hours }}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import HomeHero from '@/components/home/HomeHero.vue';
import SectionHeading from '@/components/home/SectionHeading.vue';
import FeaturedPropertyCard from '@/components/home/FeaturedPropertyCard.vue';
import PropertyCard from '@/components/home/PropertyCard.vue';
import HomeFaqSection from '@/components/home/HomeFaqSection.vue';
import LeadConsentNotice from '@/components/forms/LeadConsentNotice.vue';
import { mapPublicUnitToPropertyCard } from '@/utils/mapUnitToProperty';
import { mapPublicWholeBuildingToPropertyCard } from '@/utils/mapWholeBuildingToProperty';
import { mapProjectToProperty } from '@/utils/mapProjectToProperty';
import { getPropertyDetailRoute, getPropertiesByCityPath } from '@/utils/propertyRoutes';
import { buildProjectPublicApiPath } from '@/utils/propertyCity';
import { buildCityListingCounts, getPlaceListingCount } from '@/utils/propertyCityCounts';
import { mapPublicProjectToPartner, isTrustedPartnerCandidate } from '@/utils/mapProjectToPartner';
import {
    WHY_CHOOSE_US,
    POPULAR_PLACES,
    CONTACT_INFO,
    HOMEPAGE_FAQS,
} from '@/config/homeContent';
import { loadCompanyContactInfo } from '@/utils/companyProfile';
import { appName } from '@/config/app';
import { getSiteUrl, buildFaqPageJsonLd, updatePageMeta, getDefaultPageMeta } from '@/utils/seo';
import { flushPendingScrollRestore } from '@/utils/scroll';

export default {
    name: 'HomeView',
    components: {
        HomeHero,
        SectionHeading,
        FeaturedPropertyCard,
        PropertyCard,
        HomeFaqSection,
        LeadConsentNotice,
    },
    data() {
        return {
            featuredProperties: [],
            featuredLoading: true,
            featuredError: '',
            saleProperties: [],
            saleUnitsLoading: true,
            saleUnitsError: '',
            rentProperties: [],
            rentUnitsLoading: true,
            rentUnitsError: '',
            whyChooseUs: WHY_CHOOSE_US,
            trustedPartners: [],
            trustedPartnersLoading: true,
            trustedPartnersError: '',
            popularPlaceCounts: {},
            popularPlacesLoading: true,
            contactInfo: { ...CONTACT_INFO },
            faqs: HOMEPAGE_FAQS,
            formSuccess: false,
            form: {
                name: '',
                email: '',
                phone: '',
                message: '',
            },
        };
    },
    computed: {
        popularPlaces() {
            return POPULAR_PLACES.map((place) => ({
                ...place,
                count: this.popularPlacesLoading
                    ? null
                    : getPlaceListingCount(this.popularPlaceCounts, place),
            }));
        },
    },
    async mounted() {
        this.contactInfo = await loadCompanyContactInfo();
        updatePageMeta(getDefaultPageMeta(this.contactInfo.tagline));
        this.injectStructuredData();
        this.loadFeaturedProperties();
        this.loadSaleUnits();
        this.loadRentUnits();
        this.loadTrustedPartners();
        this.loadPopularPlaceCounts();
    },
    activated() {
        flushPendingScrollRestore();
    },
    beforeUnmount() {
        document.getElementById('home-jsonld')?.remove();
    },
    methods: {
        syncHomeScrollRestore() {
            this.$nextTick(() => {
                flushPendingScrollRestore();
            });
        },
        async loadFeaturedProperties() {
            this.featuredLoading = true;
            this.featuredError = '';

            try {
                const res = await this.$api.get('/projects/public/featured', { params: { limit: 6 } });
                this.featuredProperties = (res.data || []).map(mapProjectToProperty);
                this.injectStructuredData();
            } catch (err) {
                console.error('Failed to load featured properties:', err);
                this.featuredError = 'Could not load featured properties right now.';
                this.featuredProperties = [];
                this.injectStructuredData();
            } finally {
                this.featuredLoading = false;
                this.syncHomeScrollRestore();
            }
        },
        async loadSaleUnits() {
            this.saleUnitsLoading = true;
            this.saleUnitsError = '';

            try {
                const res = await this.$api.get('/units/public/list', { params: { limit: 6, listing_type: 'sale' } });
                this.saleProperties = (res.data || []).map((item) => (
                    item.listing_kind === 'whole_building'
                        ? mapPublicWholeBuildingToPropertyCard(item)
                        : mapPublicUnitToPropertyCard(item)
                ));
            } catch (err) {
                console.error('Failed to load sale units:', err);
                this.saleUnitsError = 'Could not load properties for sale right now.';
                this.saleProperties = [];
            } finally {
                this.saleUnitsLoading = false;
                this.syncHomeScrollRestore();
            }
        },
        async loadRentUnits() {
            this.rentUnitsLoading = true;
            this.rentUnitsError = '';

            try {
                const res = await this.$api.get('/units/public/list', { params: { limit: 6, listing_type: 'rent' } });
                this.rentProperties = (res.data || []).map((item) => (
                    item.listing_kind === 'whole_building'
                        ? mapPublicWholeBuildingToPropertyCard(item)
                        : mapPublicUnitToPropertyCard(item)
                ));
            } catch (err) {
                console.error('Failed to load rent properties:', err);
                this.rentUnitsError = 'Could not load properties for rent right now.';
                this.rentProperties = [];
            } finally {
                this.rentUnitsLoading = false;
                this.syncHomeScrollRestore();
            }
        },
        async loadTrustedPartners() {
            this.trustedPartnersLoading = true;
            this.trustedPartnersError = '';

            try {
                const projects = await this.fetchTrustedPartnerProjects();
                this.trustedPartners = projects
                    .filter(isTrustedPartnerCandidate)
                    .map(mapPublicProjectToPartner)
                    .sort((a, b) => a.name.localeCompare(b.name));
            } catch (err) {
                console.error('Failed to load trusted partners:', err);
                this.trustedPartnersError = 'Could not load trusted partners right now.';
                this.trustedPartners = [];
            } finally {
                this.trustedPartnersLoading = false;
                this.syncHomeScrollRestore();
            }
        },
        async fetchTrustedPartnerProjects() {
            try {
                const res = await this.$api.get('/projects/public/partners');
                if (Array.isArray(res.data)) {
                    return res.data;
                }
            } catch (partnersErr) {
                if (partnersErr?.response?.status !== 404) {
                    console.warn('Trusted partners endpoint unavailable, falling back to project details.', partnersErr);
                }
            }

            const listRes = await this.$api.get('/projects/public/list');
            const candidates = (listRes.data || []).filter(
                (project) => project.city && !project.is_private_on_website,
            );

            return Promise.all(
                candidates.map(async (project) => {
                    if (project.logo) return project;

                    const apiPath = buildProjectPublicApiPath(project);
                    if (!apiPath) return project;

                    try {
                        const detailRes = await this.$api.get(apiPath);
                        return {
                            ...project,
                            logo: detailRes.data?.logo || null,
                        };
                    } catch {
                        return project;
                    }
                }),
            );
        },
        injectStructuredData() {
            document.getElementById('home-jsonld')?.remove();

            const script = document.createElement('script');
            script.id = 'home-jsonld';
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify({
                '@context': 'https://schema.org',
                '@graph': [
                    {
                        '@type': 'RealEstateAgent',
                        name: appName,
                        description: this.contactInfo.tagline || appName,
                        url: getSiteUrl('/'),
                        telephone: this.contactInfo.phone,
                        email: this.contactInfo.email,
                        address: {
                            '@type': 'PostalAddress',
                            addressLocality: this.contactInfo.city || 'Cebu City',
                            addressCountry: 'PH',
                        },
                    },
                    {
                        '@type': 'ItemList',
                        name: 'Featured Properties',
                        itemListElement: this.featuredProperties.slice(0, 6).map((property, index) => {
                            const route = getPropertyDetailRoute(property);
                            const path = route.params?.slug
                                ? `/properties/${route.params.slug}`
                                : `/properties/${property.id}`;

                            return {
                                '@type': 'ListItem',
                                position: index + 1,
                                name: property.title,
                                url: getSiteUrl(path),
                            };
                        }),
                    },
                    buildFaqPageJsonLd(this.faqs),
                ],
            });
            document.head.appendChild(script);
        },
        submitContact() {
            this.formSuccess = true;
            this.form = { name: '', email: '', phone: '', message: '' };
            setTimeout(() => {
                this.formSuccess = false;
            }, 4000);
        },
        getPlacePath(place) {
            return getPropertiesByCityPath(place.city || place.name);
        },
        formatPlaceCount(count) {
            if (count == null) {
                return 'Loading...';
            }

            const label = count === 1 ? 'Property' : 'Properties';
            return `${count} ${label}`;
        },
        async loadPopularPlaceCounts() {
            this.popularPlacesLoading = true;

            try {
                const [projectsRes, unitsRes] = await Promise.all([
                    this.$api.get('/projects/public/list'),
                    this.$api.get('/units/public/list', { params: { limit: 'all' } }),
                ]);

                const privateProjects = (projectsRes.data || []).filter(
                    (project) => project.is_private_on_website && project.city,
                );

                const detailResponses = await Promise.all(
                    privateProjects.map((project) => {
                        const apiPath = buildProjectPublicApiPath(project);
                        return apiPath
                            ? this.$api.get(apiPath)
                            : Promise.resolve({ data: null });
                    }),
                );

                const privateProperties = detailResponses
                    .map((response) => response.data)
                    .filter(Boolean);
                const units = (unitsRes.data || []).filter((item) => !item.is_private_on_website);

                this.popularPlaceCounts = buildCityListingCounts({ privateProperties, units });
            } catch (err) {
                console.error('Failed to load popular place counts:', err);
                this.popularPlaceCounts = {};
            } finally {
                this.popularPlacesLoading = false;
                this.syncHomeScrollRestore();
            }
        },
    },
};
</script>
