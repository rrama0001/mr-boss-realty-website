<template>
    <div
        class="ai-orb"
        :class="{
            'ai-orb--thinking': thinking,
            'ai-orb--paused': paused,
            'ai-orb--classic': variant === 'classic',
        }"
        role="img"
        aria-label="Mr. Boss AI assistant"
    >
        <div class="ai-orb__halo" aria-hidden="true"></div>
        <div class="ai-orb__contact" aria-hidden="true"></div>
        <div class="ai-orb__globe" aria-hidden="true">
            <div class="ai-orb__sky"></div>
            <div class="ai-orb__swirl ai-orb__swirl--1" aria-hidden="true"></div>
            <div class="ai-orb__swirl ai-orb__swirl--2" aria-hidden="true"></div>
            <div class="ai-orb__swirl ai-orb__swirl--3" aria-hidden="true"></div>
            <div class="ai-orb__cloud ai-orb__cloud--1" aria-hidden="true"></div>
            <div class="ai-orb__cloud ai-orb__cloud--2" aria-hidden="true"></div>
            <div class="ai-orb__cloud ai-orb__cloud--3" aria-hidden="true"></div>
            <div class="ai-orb__cloud ai-orb__cloud--4" aria-hidden="true"></div>
            <div class="ai-orb__dust ai-orb__dust--1"></div>
            <div class="ai-orb__dust ai-orb__dust--2"></div>
            <div class="ai-orb__dust ai-orb__dust--3"></div>
            <div class="ai-orb__dust ai-orb__dust--4"></div>
            <div class="ai-orb__filament ai-orb__filament--1"></div>
            <div class="ai-orb__filament ai-orb__filament--2"></div>
            <div class="ai-orb__filament ai-orb__filament--3"></div>
            <div class="ai-orb__core">
                <img
                    class="ai-orb__core-logo"
                    :src="faviconUrl"
                    alt=""
                    aria-hidden="true"
                    width="64"
                    height="64"
                    decoding="async"
                />
            </div>
            <div class="ai-orb__shade"></div>
            <div class="ai-orb__rim"></div>
            <div class="ai-orb__specular ai-orb__specular--primary"></div>
            <div class="ai-orb__specular ai-orb__specular--glint"></div>
        </div>
        <div class="ai-orb__spark ai-orb__spark--1" aria-hidden="true"></div>
        <div class="ai-orb__spark ai-orb__spark--2" aria-hidden="true"></div>
        <div class="ai-orb__spark ai-orb__spark--3" aria-hidden="true"></div>
        <div class="ai-orb__echo" aria-hidden="true"></div>
    </div>
</template>

<script>
import faviconUrl from '@/assets/images/favicon.png';

export default {
    name: 'AiOrb',
    props: {
        active: {
            type: Boolean,
            default: true,
        },
        thinking: {
            type: Boolean,
            default: false,
        },
        /** storm (default, reference-inspired) | classic (original dark aurora) */
        variant: {
            type: String,
            default: 'storm',
            validator: (value) => ['storm', 'classic', 'marble'].includes(value),
        },
    },
    data() {
        return {
            faviconUrl,
            paused: false,
        };
    },
    mounted() {
        this.onVisibilityChange = () => {
            this.paused = document.hidden;
        };
        document.addEventListener('visibilitychange', this.onVisibilityChange);
        this.paused = document.hidden;
    },
    beforeUnmount() {
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
    },
};
</script>
