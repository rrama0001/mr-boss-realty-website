import { createRouter, createWebHistory } from 'vue-router';
import SiteLayout from '@/layouts/SiteLayout.vue';
import HomeView from '@/views/HomeView.vue';
import { updatePageMeta, getDefaultPageMeta } from '@/utils/seo';
import {
    isPageReload,
    markScrollRestoreNavigation,
    readSavedScroll,
    restoreScrollPosition,
    setupScrollPersistence,
} from '@/utils/scroll';
import { PUBLIC_PRIVATE_PROJECT_SEGMENT } from '@/utils/propertyPublicUrl';

const router = createRouter({
    history: createWebHistory(),
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            markScrollRestoreNavigation();
            return restoreScrollPosition(savedPosition);
        }

        if (to.hash) {
            return { el: to.hash, behavior: 'smooth' };
        }

        if (isPageReload()) {
            const storedTop = readSavedScroll(to.fullPath);
            if (storedTop != null) {
                return restoreScrollPosition({ top: storedTop, left: 0 });
            }
        }

        return { top: 0, left: 0 };
    },
    routes: [
        {
            path: '/',
            component: SiteLayout,
            children: [
                {
                    path: '',
                    name: 'home',
                    component: HomeView,
                    meta: {
                        title: 'Mr. Boss Realty | Find Your Dream Home in the Philippines',
                        description:
                            'Browse condominiums, houses, and commercial properties across the Philippines with Mr. Boss Realty. AI-assisted search and trusted agent guidance.',
                        path: '/',
                    },
                },
                {
                    path: 'properties/:citySlug/:projectSlug/:listingRef',
                    name: 'property-listing-detail',
                    component: () => import('@/views/PropertyListingDetailView.vue'),
                    meta: {
                        title: 'Listing Details | Mr. Boss Realty',
                        description: 'View property listing details, pricing, and specifications with Mr. Boss Realty.',
                        path: '/properties/:citySlug/:projectSlug/:listingRef',
                    },
                },
                {
                    path: 'properties/:citySlug/:projectSlug',
                    name: 'property-detail',
                    component: () => import('@/views/PropertyDetailView.vue'),
                    meta: {
                        title: 'Property Details | Mr. Boss Realty',
                        description: 'View property details and available units with Mr. Boss Realty.',
                        path: '/properties/:citySlug/:projectSlug',
                    },
                },
                {
                    path: 'properties/:slug/:listingRef',
                    name: 'property-listing-detail-legacy',
                    component: () => import('@/views/PropertyListingDetailView.vue'),
                    meta: {
                        title: 'Listing Details | Mr. Boss Realty',
                        description: 'View property listing details, pricing, and specifications with Mr. Boss Realty.',
                        robots: 'noindex, follow',
                    },
                },
                {
                    path: 'properties/city/:citySlug',
                    redirect: (to) => `/properties/${to.params.citySlug}`,
                },
                {
                    path: 'properties/:slug',
                    name: 'property-segment',
                    component: () => import('@/views/PropertySegmentView.vue'),
                    meta: {
                        title: 'Properties | Mr. Boss Realty',
                        description:
                            'Explore condominiums and residential developments across the Philippines with Mr. Boss Realty.',
                        path: '/properties/:slug',
                    },
                },
                {
                    path: 'properties',
                    name: 'properties',
                    component: () => import('@/views/PropertiesView.vue'),
                    meta: {
                        title: 'Properties for Sale and Rent | Mr. Boss Realty',
                        description:
                            'Explore condominiums and residential developments across the Philippines with Mr. Boss Realty.',
                        path: '/properties',
                    },
                },
                {
                    path: 'listings/:projectSlug/:listingRef',
                    redirect: (to) => ({
                        name: 'property-listing-detail-legacy',
                        params: {
                            slug: to.params.projectSlug,
                            listingRef: to.params.listingRef,
                        },
                    }),
                },
                {
                    path: 'units/:projectSlug/:unitRef',
                    redirect: (to) => ({
                        name: 'property-listing-detail-legacy',
                        params: {
                            slug: to.params.projectSlug,
                            listingRef: to.params.unitRef,
                        },
                    }),
                },
                {
                    path: 'units/:legacySlug',
                    name: 'unit-detail-legacy',
                    component: () => import('@/views/UnitDetailView.vue'),
                    meta: {
                        title: 'Unit Details | Mr. Boss Realty',
                        description: 'View unit details, pricing, and property information with Mr. Boss Realty.',
                        robots: 'noindex, follow',
                    },
                },
                {
                    path: 'units',
                    name: 'units',
                    component: () => import('@/views/UnitsView.vue'),
                    meta: {
                        title: 'Units for Sale | Mr. Boss Realty',
                        description:
                            'Browse available units across Mr. Boss Realty developments — filter by city, type, bedrooms, and bathrooms.',
                        path: '/units',
                    },
                },
                {
                    path: 'about',
                    name: 'about',
                    component: () => import('@/views/AboutView.vue'),
                    meta: {
                        title: 'About Us | Mr. Boss Realty',
                        description:
                            'Learn about Mr. Boss Realty—who we are, how we work, and how we help buyers and renters find the right property.',
                        path: '/about',
                    },
                },
                {
                    path: 'contact',
                    name: 'contact',
                    component: () => import('@/views/ContactView.vue'),
                    meta: {
                        title: 'Contact Mr. Boss Realty',
                        description:
                            'Get in touch with Mr. Boss Realty for property inquiries, site visits, and reservations.',
                        path: '/contact',
                    },
                },
                {
                    path: 'privacy-policy',
                    name: 'privacy-policy',
                    component: () => import('@/views/LegalPageView.vue'),
                    props: { pageKey: 'privacy-policy' },
                    meta: {
                        title: 'Privacy Policy | Mr. Boss Realty',
                        description: 'Learn how Mr. Boss Realty collects, uses, and protects your personal information.',
                        path: '/privacy-policy',
                    },
                },
                {
                    path: 'terms-and-conditions',
                    name: 'terms-and-conditions',
                    component: () => import('@/views/LegalPageView.vue'),
                    props: { pageKey: 'terms-and-conditions' },
                    meta: {
                        title: 'Terms & Conditions | Mr. Boss Realty',
                        description: 'Terms and conditions for using the Mr. Boss Realty website and services.',
                        path: '/terms-and-conditions',
                    },
                },
                {
                    path: 'cookie-policy',
                    name: 'cookie-policy',
                    component: () => import('@/views/LegalPageView.vue'),
                    props: { pageKey: 'cookie-policy' },
                    meta: {
                        title: 'Cookie Policy | Mr. Boss Realty',
                        description: 'How Mr. Boss Realty uses cookies and similar technologies on this website.',
                        path: '/cookie-policy',
                    },
                },
                {
                    path: 'ai-disclaimer',
                    name: 'ai-disclaimer',
                    component: () => import('@/views/LegalPageView.vue'),
                    props: { pageKey: 'ai-disclaimer' },
                    meta: {
                        title: 'AI Disclaimer | Mr. Boss Realty',
                        description: 'Important information about the Mr. Boss Realty AI property assistant.',
                        path: '/ai-disclaimer',
                    },
                },
                {
                    path: 'property-disclaimer',
                    name: 'property-disclaimer',
                    component: () => import('@/views/LegalPageView.vue'),
                    props: { pageKey: 'property-disclaimer' },
                    meta: {
                        title: 'Property Listing Disclaimer | Mr. Boss Realty',
                        description: 'Important notes about property listings, pricing, images, and availability.',
                        path: '/property-disclaimer',
                    },
                },
                {
                    path: 'fair-housing',
                    name: 'fair-housing',
                    component: () => import('@/views/LegalPageView.vue'),
                    props: { pageKey: 'fair-housing' },
                    meta: {
                        title: 'Fair Housing | Mr. Boss Realty',
                        description: 'Mr. Boss Realty commitment to fair and equal opportunity in property services.',
                        path: '/fair-housing',
                    },
                },
                {
                    path: 'sitemap',
                    name: 'sitemap',
                    component: () => import('@/views/SitemapView.vue'),
                    meta: {
                        title: 'Sitemap | Mr. Boss Realty',
                        description: 'Browse all main pages and legal policies on Mr. Boss Realty.',
                        path: '/sitemap',
                    },
                },
                {
                    path: '/:pathMatch(.*)*',
                    name: 'not-found',
                    component: () => import('@/views/NotFoundView.vue'),
                    meta: {
                        title: 'Page Not Found | Mr. Boss Realty',
                        description: 'The page you requested could not be found.',
                        robots: 'noindex, nofollow',
                    },
                },
            ],
        },
    ],
});

function redirectLegacyPrivateSlug(slug) {
    const value = String(slug || '').trim();
    if (
        !value.startsWith('private-')
        || value === PUBLIC_PRIVATE_PROJECT_SEGMENT
        || value.startsWith(`${PUBLIC_PRIVATE_PROJECT_SEGMENT}-`)
    ) {
        return null;
    }

    return `${PUBLIC_PRIVATE_PROJECT_SEGMENT}-${value.slice('private-'.length)}`;
}

router.beforeEach((to) => {
    const slugParam = to.params.slug || to.params.projectSlug;
    const nextSlug = redirectLegacyPrivateSlug(slugParam);

    if (nextSlug && nextSlug !== slugParam) {
        return {
            name: to.name,
            params: {
                ...to.params,
                slug: to.params.slug ? nextSlug : to.params.slug,
                projectSlug: to.params.projectSlug ? nextSlug : to.params.projectSlug,
            },
            query: to.query,
            hash: to.hash,
            replace: true,
        };
    }

    return true;
});

router.afterEach((to) => {
    const meta = to.matched
        .slice()
        .reverse()
        .find((record) => record.meta && (record.meta.title || record.meta.description));

    updatePageMeta({
        ...getDefaultPageMeta(),
        ...(meta ? meta.meta : {}),
        path: to.path,
    });
});

export default router;

setupScrollPersistence(router);
