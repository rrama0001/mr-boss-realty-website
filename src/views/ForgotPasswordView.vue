<template>
    <div class="login-page">
        <div class="login-page__backdrop" aria-hidden="true">
            <img
                class="login-page__bg"
                :src="bgImageUrl"
                alt=""
                width="1920"
                height="1080"
                decoding="async"
            />
            <div class="login-page__overlay"></div>
        </div>
        <div class="container-xl login-page__container">
            <section class="login-panel" aria-labelledby="forgot-title">
                <div class="login-panel__brand">
                    <img :src="logoUrl" :alt="appName" class="login-panel__logo" />
                    <h1 id="forgot-title" class="login-panel__title">Forgot password</h1>
                    <p class="login-panel__lead">
                        Enter your account email and we&rsquo;ll send a link to set or reset your password.
                    </p>
                </div>

                <p v-if="errorMessage" class="alert alert-warning login-panel__alert" role="alert">
                    {{ errorMessage }}
                </p>
                <p v-if="successMessage" class="alert alert-success login-panel__alert" role="status">
                    {{ successMessage }}
                </p>
                <p v-if="previewResetUrl" class="alert alert-info login-panel__alert" role="status">
                    Dev preview:
                    <a :href="previewResetUrl">Open reset link</a>
                </p>

                <form class="login-form" @submit.prevent="onSubmit">
                    <div class="login-form__field">
                        <label class="login-form__label" for="forgot-email">Email</label>
                        <input
                            id="forgot-email"
                            v-model.trim="form.email"
                            type="email"
                            class="form-control"
                            name="email"
                            autocomplete="email"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        class="btn btn-primary login-form__submit"
                        :disabled="isSubmitting"
                    >
                        <span v-if="isSubmitting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>{{ isSubmitting ? 'Sending...' : 'Send reset link' }}</span>
                    </button>
                </form>

                <p class="login-panel__footer">
                    <router-link to="/login">Back to login</router-link>
                </p>
            </section>
        </div>
    </div>
</template>

<script>
import { appName } from '@/config/app';
import logoUrl from '@/assets/images/mr-boss-realty-logo.png';
import bgImageUrl from '@/assets/images/mr-boss-reset-password-background.jpg';

export default {
    name: 'ForgotPasswordView',
    data() {
        return {
            appName,
            logoUrl,
            bgImageUrl,
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
