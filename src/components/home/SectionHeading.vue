<template>
    <div class="section-heading" :class="{ 'section-heading--center': center }">
        <h2 class="section-heading__title">{{ title }}</h2>
        <p v-if="subtitle" class="section-heading__subtitle">{{ subtitle }}</p>
    </div>
</template>

<script>
export default {
    name: 'SectionHeading',
    props: {
        title: { type: String, required: true },
        subtitle: { type: String, default: '' },
        center: { type: Boolean, default: true },
    },
};
</script>
