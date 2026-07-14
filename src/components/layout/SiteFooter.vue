<template>
    <footer class="site-footer">
        <div class="container-xl">
            <div class="site-footer__top">
                <div class="site-footer__brand-block">
                    <img :src="logoUrl" :alt="appName" class="site-footer__logo" />
                    <p class="site-footer__about">
                        {{ appName }} helps you discover condominiums, houses, and commercial properties
                        with trusted guidance from inquiry to closing.
                    </p>
                    <ul class="site-footer__contact">
                        <li><i class="ti ti-map-pin" aria-hidden="true"></i> {{ contactInfo.address }}</li>
                        <li><i class="ti ti-phone" aria-hidden="true"></i> {{ contactInfo.phone }}</li>
                        <li><i class="ti ti-mail" aria-hidden="true"></i> {{ contactInfo.email }}</li>
                    </ul>
                </div>

                <div class="site-footer__links-block">
                    <h4 class="site-footer__heading">Navigation</h4>
                    <ul class="site-footer__links">
                        <li v-for="item in navItems" :key="item.to">
                            <router-link :to="item.to">{{ item.label }}</router-link>
                        </li>
                    </ul>
                </div>

                <div class="site-footer__links-block">
                    <h4 class="site-footer__heading">Legal</h4>
                    <ul class="site-footer__links">
                        <li v-for="item in legalItems" :key="item.to">
                            <router-link :to="item.to">{{ item.label }}</router-link>
                        </li>
                    </ul>
                </div>

                <div class="site-footer__links-block">
                    <h4 class="site-footer__heading">Newsletter</h4>
                    <p class="site-footer__newsletter-text">
                        Sign up for updates on new listings and property offers.
                    </p>
                    <form class="site-footer__newsletter" @submit.prevent="subscribe">
                        <label class="visually-hidden" for="footer-newsletter-email">Email address</label>
                        <input
                            id="footer-newsletter-email"
                            v-model="email"
                            type="email"
                            class="form-control"
                            placeholder="Your email"
                            autocomplete="email"
                            required
                        />
                        <button type="submit" class="btn btn-primary">Subscribe</button>
                    </form>
                </div>
            </div>

            <div class="site-footer__bottom">
                <p class="site-footer__copy mb-0">
                    &copy; {{ currentYear }} {{ appName }}. All rights reserved.
                </p>
            </div>
        </div>
    </footer>
</template>

<script>
import { appName } from '@/config/app';
import { SITE_NAV_ITEMS } from '@/config/siteNav';
import { LEGAL_NAV_ITEMS } from '@/config/legalNav';
import { CONTACT_INFO } from '@/config/homeContent';
import { loadCompanyContactInfo } from '@/utils/companyProfile';
import logoUrl from '@/assets/images/mr-boss-realty-logo.png';

export default {
    name: 'SiteFooter',
    data() {
        return {
            appName,
            logoUrl,
            navItems: SITE_NAV_ITEMS,
            legalItems: LEGAL_NAV_ITEMS,
            contactInfo: { ...CONTACT_INFO },
            currentYear: new Date().getFullYear(),
            email: '',
        };
    },
    async created() {
        this.contactInfo = await loadCompanyContactInfo();
    },
    methods: {
        subscribe() {
            this.email = '';
        },
    },
};
</script>

