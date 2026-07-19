<template>
    <section class="home-hero" aria-label="Find your dream home">
        <img
            class="home-hero__bg-image"
            :src="heroBgUrl"
            alt=""
            width="1920"
            height="1080"
            fetchpriority="high"
            decoding="async"
        />
        <div class="home-hero__overlay" aria-hidden="true"></div>

        <div class="container-xl home-hero__content">
            <div class="home-hero__copy">
                <div class="home-hero__copy-orb" aria-hidden="true">
                    <AiOrb :active="true" :thinking="false" />
                </div>
                <p class="home-hero__subtitle">Mr. Boss Realty AI</p>
                <p class="home-hero__tagline">{{ tagline }}</p>
                <h1 class="home-hero__title">Find Your Dream Home in the Philippines</h1>
            </div>

            <form
                v-if="showHeroSearch"
                class="hero-search-reserve"
                @submit.prevent="onSearchSubmit"
            >
                <div class="hero-interaction__search">
                    <input
                        ref="heroSearchInput"
                        v-model="draft"
                        type="search"
                        class="form-control hero-interaction__input hero-interaction__input--frosted"
                        placeholder="Ask about properties, locations, or units..."
                        aria-label="Ask Mr. Boss AI"
                    />
                    <div class="hero-interaction__search-actions">
                        <button
                            v-if="draft"
                            type="button"
                            class="hero-interaction__search-btn hero-interaction__search-btn--muted"
                            aria-label="Clear search"
                            @click="clearSearch"
                        >
                            <i class="ti ti-x" aria-hidden="true"></i>
                        </button>
                        <button
                            type="submit"
                            class="hero-interaction__search-btn"
                            :disabled="!draft.trim()"
                            aria-label="Search"
                        >
                            <i class="ti ti-search" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </section>
</template>

<script>
import AiOrb from '@/components/ai/AiOrb.vue';
import heroBgUrl from '@/assets/images/hero-bg.jpg';
import {
    dispatchSiteChatMessage,
    hasStoredSiteChatConversation,
    SITE_CHAT_CONVERSATION_EVENT,
} from '@/utils/siteChat';

export default {
    name: 'HomeHero',
    components: { AiOrb },
    props: {
        tagline: {
            type: String,
            default: 'The smarter way to find condos, houses, and rentals—anywhere, anytime.',
        },
    },
    data() {
        return {
            heroBgUrl,
            draft: '',
            hasConversation: hasStoredSiteChatConversation(),
        };
    },
    computed: {
        showHeroSearch() {
            return !this.hasConversation;
        },
    },
    mounted() {
        this._onConversationChange = (event) => {
            this.hasConversation = Boolean(event.detail?.hasConversation);
        };
        window.addEventListener(SITE_CHAT_CONVERSATION_EVENT, this._onConversationChange);
        this.hasConversation = hasStoredSiteChatConversation();
    },
    beforeUnmount() {
        window.removeEventListener(SITE_CHAT_CONVERSATION_EVENT, this._onConversationChange);
    },
    methods: {
        clearSearch() {
            this.draft = '';
            this.$refs.heroSearchInput?.focus();
        },
        onSearchSubmit() {
            const text = this.draft.trim();
            if (!text) return;

            dispatchSiteChatMessage(text);
            this.draft = '';
            this.hasConversation = true;
        },
    },
};
</script>
