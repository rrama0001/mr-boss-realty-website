<template>
    <header
        class="site-header"
        :class="{ 'site-header--menu-open': mobileNavOpen }"
    >
        <div class="site-header__inner">
            <router-link to="/" class="site-header__brand" @click="goHome">
                <img :src="logoUrl" :alt="appName" class="site-header__logo" />
            </router-link>

            <button
                class="navbar-toggler site-header__toggle d-lg-none"
                type="button"
                :aria-expanded="mobileNavOpen ? 'true' : 'false'"
                aria-label="Toggle navigation"
                @click="mobileNavOpen = !mobileNavOpen"
            >
                <span class="navbar-toggler-icon"></span>
            </button>

            <nav class="site-header__nav" :class="{ 'site-header__nav--open': mobileNavOpen }" aria-label="Primary">
                <router-link
                    v-for="item in navItems"
                    :key="item.to"
                    :to="item.to"
                    class="site-header__link"
                    :exact="item.exact"
                    @click="mobileNavOpen = false"
                >
                    {{ item.label }}
                </router-link>
                <a :href="adminLoginUrl" class="btn btn-primary site-header__cta">Login</a>
                <router-link to="/properties" class="btn btn-primary btn-outline site-header__cta" @click="mobileNavOpen = false">
                    Register
                </router-link>
            </nav>
        </div>
    </header>
</template>

<script>
import { appName } from '@/config/app';
import { SITE_NAV_ITEMS } from '@/config/siteNav';
import { scrollToPageTop } from '@/utils/scroll';
import logoUrl from '@/assets/images/mr-boss-realty-logo.png';

export default {
    name: 'SiteHeader',
    data() {
        return {
            appName,
            logoUrl,
            navItems: SITE_NAV_ITEMS,
            mobileNavOpen: false,
            adminLoginUrl: import.meta.env.VITE_ADMIN_URL || 'http://localhost:5173/login',
        };
    },
    watch: {
        $route() {
            this.mobileNavOpen = false;
        },
        mobileNavOpen(open) {
            document.body.classList.toggle('site-nav-open', open);
        },
    },
    beforeUnmount() {
        document.body.classList.remove('site-nav-open');
    },
    methods: {
        goHome(event) {
            if (this.$route.path === '/') {
                event.preventDefault();
                scrollToPageTop();
            }
        },
    },
};
</script>
