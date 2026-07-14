<template>
    <div class="contact-page">
        <section class="property-hero property-hero--detail property-hero--page contact-page__hero">
            <img
                class="property-hero__bg"
                :src="heroImageUrl"
                alt=""
                width="1920"
                height="640"
                fetchpriority="high"
            />
            <div class="property-hero__overlay contact-page__hero-overlay" aria-hidden="true"></div>
            <div class="container-xl property-hero__inner">
                <nav class="property-hero__breadcrumb" aria-label="Breadcrumb">
                    <router-link to="/">Home</router-link>
                    <span class="property-hero__breadcrumb-sep" aria-hidden="true">/</span>
                    <span class="property-hero__breadcrumb-current" aria-current="page">Contact</span>
                </nav>
                <div class="property-hero__copy contact-page__hero-copy">
                    <p class="property-hero__eyebrow">{{ pageContent.heroEyebrow }}</p>
                    <h1 class="property-hero__title">{{ pageContent.heroTitle }}</h1>
                    <p class="property-hero__lead">{{ pageContent.heroLead }}</p>
                    <ul class="contact-page__hero-highlights">
                        <li v-for="item in pageContent.heroHighlights" :key="item.label">
                            <i :class="item.icon" aria-hidden="true"></i>
                            <span>{{ item.label }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="contact-page__channels" aria-label="Contact methods">
            <div class="container-xl">
                <div class="contact-page__channel-grid">
                    <article
                        v-for="channel in contactChannels"
                        :key="channel.key"
                        class="contact-channel"
                        :class="`contact-channel--${channel.key}`"
                    >
                        <i :class="channel.icon" class="contact-channel__icon" aria-hidden="true"></i>
                        <div class="contact-channel__body">
                            <h2 class="contact-channel__label">{{ channel.label }}</h2>
                            <a
                                v-if="channelHref(channel)"
                                :href="channelHref(channel)"
                                class="contact-channel__value"
                            >{{ channelValue(channel) }}</a>
                            <p v-else class="contact-channel__value contact-channel__value--text">
                                {{ channelValue(channel) }}
                            </p>
                            <p class="contact-channel__hint">{{ channel.hint }}</p>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <section class="home-section home-section--light contact-page__main-section">
            <div class="container-xl">
                <div class="contact-page__layout">
                    <div id="contact-form" class="contact-form-section">
                        <div class="contact-form-section__head">
                            <h2 class="contact-form-section__title">{{ pageContent.formTitle }}</h2>
                            <p class="contact-form-section__lead">{{ pageContent.formLead }}</p>
                        </div>

                        <p v-if="formSuccess" class="alert alert-success contact-form-section__alert" role="status">
                            Your message was sent successfully. We’ll be in touch soon.
                        </p>

                        <form class="contact-form contact-form--page" @submit.prevent="submitContact">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="contact-form__label" for="contact-page-name">Full name</label>
                                    <input
                                        id="contact-page-name"
                                        v-model="form.name"
                                        type="text"
                                        class="form-control"
                                        placeholder="Juan Dela Cruz"
                                        autocomplete="name"
                                        required
                                    />
                                </div>
                                <div class="col-md-6">
                                    <label class="contact-form__label" for="contact-page-email">Email address</label>
                                    <input
                                        id="contact-page-email"
                                        v-model="form.email"
                                        type="email"
                                        class="form-control"
                                        placeholder="you@example.com"
                                        autocomplete="email"
                                        required
                                    />
                                </div>
                                <div class="col-md-6">
                                    <label class="contact-form__label" for="contact-page-phone">Phone number</label>
                                    <input
                                        id="contact-page-phone"
                                        v-model="form.phone"
                                        type="tel"
                                        class="form-control"
                                        placeholder="+63 9XX XXX XXXX"
                                        autocomplete="tel"
                                    />
                                </div>
                                <div class="col-md-6">
                                    <label class="contact-form__label" for="contact-page-topic">What can we help with?</label>
                                    <select
                                        id="contact-page-topic"
                                        v-model="form.topic"
                                        class="form-select"
                                        required
                                    >
                                        <option value="" disabled>Select a topic</option>
                                        <option
                                            v-for="topic in pageContent.inquiryTopics"
                                            :key="topic"
                                            :value="topic"
                                        >
                                            {{ topic }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-12">
                                    <label class="contact-form__label" for="contact-page-message">Message</label>
                                    <textarea
                                        id="contact-page-message"
                                        v-model="form.message"
                                        rows="5"
                                        class="form-control"
                                        placeholder="Tell us about the property type, location, or budget you have in mind..."
                                        required
                                    ></textarea>
                                </div>
                                <div class="col-12">
                                    <LeadConsentNotice />
                                    <button type="submit" class="btn btn-primary contact-form-section__submit">
                                        Send message
                                        <i class="ti ti-send" aria-hidden="true"></i>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <aside class="contact-page__aside">
                        <div class="contact-aside-block contact-aside-block--intro">
                            <span class="contact-aside-block__eyebrow">Quick help</span>
                            <h3 class="contact-aside-block__title">{{ pageContent.asideTitle }}</h3>
                            <p class="contact-aside-block__text">{{ pageContent.asideLead }}</p>
                            <div class="contact-aside-block__actions">
                                <a :href="phoneHref" class="btn btn-primary contact-aside-block__btn">
                                    <i class="ti ti-phone" aria-hidden="true"></i>
                                    Call now
                                </a>
                                <router-link to="/properties" class="btn btn-outline-primary contact-aside-block__btn">
                                    Browse properties
                                </router-link>
                            </div>
                        </div>

                        <div class="contact-aside-block">
                            <h3 class="contact-aside-block__title contact-aside-block__title--sm">Explore on your own</h3>
                            <ul class="contact-aside-links">
                                <li>
                                    <router-link to="/properties">
                                        <i class="ti ti-building-estate" aria-hidden="true"></i>
                                        <span>
                                            <strong>All properties</strong>
                                            <small>Developments across the Philippines</small>
                                        </span>
                                    </router-link>
                                </li>
                                <li>
                                    <router-link to="/units">
                                        <i class="ti ti-home" aria-hidden="true"></i>
                                        <span>
                                            <strong>Available units</strong>
                                            <small>Filter by city, type, and price</small>
                                        </span>
                                    </router-link>
                                </li>
                                <li>
                                    <router-link to="/">
                                        <i class="ti ti-sparkles" aria-hidden="true"></i>
                                        <span>
                                            <strong>Try the AI assistant</strong>
                                            <small>Ask in plain language, 24/7</small>
                                        </span>
                                    </router-link>
                                </li>
                            </ul>
                        </div>

                        <p class="contact-aside-location">
                            <i class="ti ti-map-pin" aria-hidden="true"></i>
                            {{ contactInfo.address }}
                        </p>
                    </aside>
                </div>
            </div>
        </section>

        <section class="contact-page__process">
            <div class="container-xl">
                <SectionHeading
                    :title="pageContent.processTitle"
                    :subtitle="pageContent.processLead"
                />
                <div class="contact-process-grid">
                    <article
                        v-for="(step, index) in pageContent.processSteps"
                        :key="step.title"
                        class="contact-process-step"
                    >
                        <div class="contact-process-step__index">{{ String(index + 1).padStart(2, '0') }}</div>
                        <i :class="step.icon" class="contact-process-step__icon" aria-hidden="true"></i>
                        <h3 class="contact-process-step__title">{{ step.title }}</h3>
                        <p class="contact-process-step__text">{{ step.description }}</p>
                    </article>
                </div>
            </div>
        </section>

        <section class="home-section home-section--faq">
            <div class="container-xl">
                <HomeFaqSection
                    :items="contactFaqs"
                    default-open-id="viewing"
                    cta-href="#contact-form"
                    cta-label="Send a message"
                />
            </div>
        </section>
    </div>
</template>

<script>
import SectionHeading from '@/components/home/SectionHeading.vue';
import HomeFaqSection from '@/components/home/HomeFaqSection.vue';
import LeadConsentNotice from '@/components/forms/LeadConsentNotice.vue';
import {
    CONTACT_INFO,
    CONTACT_PAGE,
    HOMEPAGE_FAQS,
} from '@/config/homeContent';
import { loadCompanyContactInfo } from '@/utils/companyProfile';
import heroImageUrl from '@/assets/images/hero-bg-contact-office.jpg';

function buildTelHref(phone = '') {
    const digits = String(phone).replace(/\D/g, '');
    return digits ? `tel:+${digits}` : null;
}

export default {
    name: 'ContactView',
    components: { SectionHeading, HomeFaqSection, LeadConsentNotice },
    data() {
        return {
            heroImageUrl,
            contactInfo: { ...CONTACT_INFO },
            pageContent: CONTACT_PAGE,
            formSuccess: false,
            form: {
                name: '',
                email: '',
                phone: '',
                topic: '',
                message: '',
            },
        };
    },
    async created() {
        this.contactInfo = await loadCompanyContactInfo();
    },
    computed: {
        phoneHref() {
            return buildTelHref(this.contactInfo.phone);
        },
        emailHref() {
            return this.contactInfo.email ? `mailto:${this.contactInfo.email}` : null;
        },
        contactFaqs() {
            const ids = new Set(this.pageContent.faqIds);
            return HOMEPAGE_FAQS.filter((item) => ids.has(item.id));
        },
        contactChannels() {
            return this.pageContent.contactChannels || [];
        },
    },
    methods: {
        channelValue(channel) {
            if (channel.link === 'phone') return this.contactInfo.phone;
            if (channel.link === 'email') return this.contactInfo.email;
            if (channel.key === 'office') return this.contactInfo.address;
            if (channel.key === 'hours') return this.contactInfo.hours;
            return '';
        },
        channelHref(channel) {
            if (channel.link === 'phone') return this.phoneHref;
            if (channel.link === 'email') return this.emailHref;
            return null;
        },
        submitContact() {
            this.formSuccess = true;
            this.form = {
                name: '',
                email: '',
                phone: '',
                topic: '',
                message: '',
            };
            setTimeout(() => {
                this.formSuccess = false;
            }, 5000);
        },
    },
};
</script>
