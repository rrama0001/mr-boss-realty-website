<template>
    <div class="auth-page">
        <div class="auth-page__glow" aria-hidden="true"></div>

        <div class="auth-page__shell">
            <header class="auth-brand">
                <router-link to="/" class="auth-brand__logo-link" aria-label="Go to homepage">
                    <img :src="logoUrl" :alt="appName" class="auth-brand__logo" />
                </router-link>
                <h1 id="forgot-title" class="auth-brand__title">Forgot your password?</h1>
            </header>

            <div class="auth-stage">
                <aside class="auth-visual" aria-hidden="true">
                    <img
                        class="auth-visual__image"
                        :src="visualUrl"
                        alt=""
                        width="640"
                        height="800"
                        decoding="async"
                    />
                </aside>

                <section class="auth-panel" aria-labelledby="forgot-title">
                    <p class="auth-panel__lead">
                        Enter your account email and we&rsquo;ll send a link to reset your password.
                    </p>

                    <p v-if="errorMessage" class="alert alert-warning auth-panel__alert" role="alert">
                        {{ errorMessage }}
                    </p>
                    <p v-if="successMessage" class="alert alert-success auth-panel__alert" role="status">
                        {{ successMessage }}
                    </p>
                    <p v-if="previewResetUrl" class="alert alert-info auth-panel__alert" role="status">
                        Dev preview:
                        <a :href="previewResetUrl">Open reset link</a>
                    </p>

                    <form class="auth-form" @submit.prevent="onSubmit">
                        <div class="auth-form__field">
                            <label class="auth-form__label" for="forgot-email">Email</label>
                            <input
                                id="forgot-email"
                                v-model.trim="form.email"
                                type="email"
                                class="form-control auth-form__input"
                                name="email"
                                autocomplete="email"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            class="btn btn-primary auth-form__submit"
                            :disabled="isSubmitting"
                        >
                            <span
                                v-if="isSubmitting"
                                class="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                            ></span>
                            <span>{{ isSubmitting ? 'Sending...' : 'Send reset link' }}</span>
                        </button>
                    </form>

                    <p class="auth-panel__footer">
                        <router-link to="/login">Back to login</router-link>
                    </p>
                </section>
            </div>
        </div>
    </div>
</template>

<script>
import { appName } from '@/config/app';
import logoUrl from '@/assets/images/mr-boss-realty-logo.png';
import visualUrl from '@/assets/images/auth-forgot-visual.jpg';

export default {
    name: 'ForgotPasswordView',
    data() {
        return {
            appName,
            logoUrl,
            visualUrl,
            form: {
                email: '',
            },
            isSubmitting: false,
            errorMessage: '',
            successMessage: '',
            previewResetUrl: '',
        };
    },
    methods: {
        async onSubmit() {
            this.errorMessage = '';
            this.successMessage = '';
            this.previewResetUrl = '';

            if (!this.form.email) {
                this.errorMessage = 'Please enter your email.';
                return;
            }

            this.isSubmitting = true;

            try {
                const res = await this.$api.post('/auth/forgot-password', {
                    email: this.form.email,
                });
                this.successMessage = res.data?.message
                    || 'If an account matches that email, password reset instructions have been sent.';
                this.previewResetUrl = res.data?.preview?.resetUrl || '';
            } catch (err) {
                this.errorMessage = err.response?.data?.error
                    || 'Unable to send a reset link right now. Please try again.';
            } finally {
                this.isSubmitting = false;
            }
        },
    },
};
</script>
