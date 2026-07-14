<template>
    <section class="site-section">
        <div class="container-xl">
            <div class="site-section__card">
                <h1 class="site-section__title">{{ pageTitle }}</h1>
                <p class="text-secondary mb-0">
                    This page is reserved for the upcoming design. Content will be added when we define the look and layout.
                </p>
            </div>
        </div>
    </section>
</template>

<script>
const PAGE_TITLES = {
    properties: 'Properties',
    about: 'About Us',
    contact: 'Contact',
};

export default {
    name: 'PlaceholderView',
    props: {
        pageKey: {
            type: String,
            required: true,
        },
    },
    computed: {
        pageTitle() {
            return PAGE_TITLES[this.pageKey] || 'Page';
        },
    },
};
</script>
