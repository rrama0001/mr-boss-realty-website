<template>
    <button
        type="button"
        class="btn fw-bold interested-btn"
        :class="{
            'interested-btn--align-center': alignCenter,
            'interested-btn--compact': compact,
        }"
        :disabled="isDisabled"
        @click="onClick"
    >
        {{ label }}
    </button>
</template>

<script>
import {
    buildPropertyInterestMessage,
    buildUnitInterestMessage,
    dispatchUnitInterest,
} from '@/utils/siteChat';

export default {
    name: 'InterestedButton',
    props: {
        unitSlug: {
            type: String,
            default: '',
        },
        propertySlug: {
            type: String,
            default: '',
        },
        message: {
            type: String,
            default: '',
        },
        label: {
            type: String,
            default: "I'm Interested",
        },
        alignCenter: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        compact: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        interestMessage() {
            const explicit = String(this.message || '').trim();
            if (explicit) return explicit;

            const slug = String(this.unitSlug || '').trim();
            if (slug) return buildUnitInterestMessage(slug);

            const propertySlug = String(this.propertySlug || '').trim();
            if (propertySlug) return buildPropertyInterestMessage(propertySlug);

            return '';
        },
        isDisabled() {
            return this.disabled || !this.interestMessage;
        },
    },
    methods: {
        onClick() {
            if (this.isDisabled) return;

            const text = this.interestMessage;
            this.$emit('click', { message: text });
            dispatchUnitInterest(text);
        },
    },
};
</script>
