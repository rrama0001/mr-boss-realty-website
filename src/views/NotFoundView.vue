<template>
    <section class="site-section">
        <div class="container-xl">
            <div class="site-section__card text-center">
                <h1 class="site-section__title">Page not found</h1>
                <p class="text-secondary mb-4">
                    The page you are looking for does not exist or may have moved.
                </p>
                <router-link to="/" class="btn btn-primary">Back to home</router-link>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: 'NotFoundView',
};
</script>
