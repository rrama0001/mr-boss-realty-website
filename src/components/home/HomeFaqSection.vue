<template>
    <div class="home-faq">
        <div class="home-faq__layout">
            <aside class="home-faq__intro">
                <span class="home-faq__eyebrow">Help center</span>
                <h2 class="home-faq__title">Questions, answered.</h2>
                <p class="home-faq__lead">
                    Straightforward info on viewings, reservations, and rentals—no jargon, no runaround.
                </p>
                <ul class="home-faq__highlights">
                    <li v-for="point in highlights" :key="point">
                        <span class="home-faq__check" aria-hidden="true"></span>
                        <span>{{ point }}</span>
                    </li>
                </ul>
                <a :href="ctaHref" class="home-faq__cta">
                    {{ ctaLabel }}
                    <i class="ti ti-arrow-up-right" aria-hidden="true"></i>
                </a>
            </aside>

            <div class="home-faq__accordion" role="tablist" aria-label="Frequently asked questions">
                <article
                    v-for="(item, index) in items"
                    :key="item.id"
                    class="home-faq__item"
                    :class="{ 'home-faq__item--open': openId === item.id }"
                >
                    <h3 class="home-faq__item-heading">
                        <button
                            :id="`faq-trigger-${item.id}`"
                            type="button"
                            class="home-faq__trigger"
                            :aria-expanded="openId === item.id"
                            :aria-controls="`faq-panel-${item.id}`"
                            @click="toggle(item.id)"
                        >
                            <span class="home-faq__index">{{ String(index + 1).padStart(2, '0') }}</span>
                            <span class="home-faq__question-text">{{ item.question }}</span>
                            <span class="home-faq__toggle" aria-hidden="true">
                                <i class="ti ti-plus home-faq__toggle-icon home-faq__toggle-icon--plus"></i>
                                <i class="ti ti-minus home-faq__toggle-icon home-faq__toggle-icon--minus"></i>
                            </span>
                        </button>
                    </h3>
                    <div
                        :id="`faq-panel-${item.id}`"
                        class="home-faq__panel"
                        role="region"
                        :aria-labelledby="`faq-trigger-${item.id}`"
                        :aria-hidden="openId !== item.id"
                    >
                        <div class="home-faq__panel-inner">
                            <p>{{ item.answer }}</p>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HomeFaqSection',
    props: {
        items: {
            type: Array,
            required: true,
        },
        defaultOpenId: {
            type: String,
            default: '',
        },
        ctaHref: {
            type: String,
            default: '#contact',
        },
        ctaLabel: {
            type: String,
            default: 'Ask us anything',
        },
    },
    data() {
        return {
            openId: this.defaultOpenId || (this.items[0]?.id ?? ''),
            highlights: [
                'Book a viewing in minutes',
                'Clear payment and financing options',
                'Flexible rent terms when available',
            ],
        };
    },
    methods: {
        toggle(id) {
            this.openId = this.openId === id ? '' : id;
        },
    },
};
</script>
