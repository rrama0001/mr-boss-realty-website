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
                        Enter your username or email and we&rsquo;ll send reset instructions.
                    </p>
                </div>

                <p v-if="errorMessage" class="alert alert-warning login-panel__alert" role="alert">
                    {{ errorMessage }}
                </p>
                <p v-if="successMessage" class="alert alert-success login-panel__alert" role="status">
                    {{ successMessage }}
                </p>

                <form class="login-form" @submit.prevent="onSubmit">
                    <div class="login-form__field">
                        <label class="login-form__label" for="forgot-account">Username or email</label>
                        <input
                            id="forgot-account"
                            v-model.trim="form.account"
                            type="text"
                            class="form-control"
                            name="account"
                            autocomplete="username"
                            placeholder="Enter your username or email"
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
                account: '',
            },
            isSubmitting: false,
            errorMessage: '',
            successMessage: '',
        };
    },
    methods: {
        onSubmit() {
            this.errorMessage = '';
            this.successMessage = '';

            if (!this.form.account) {
                this.errorMessage = 'Please enter your username or email.';
                return;
            }

            this.isSubmitting = true;

            // Password reset email flow will be wired to the API next.
            window.setTimeout(() => {
                this.isSubmitting = false;
                this.successMessage = 'If an account matches, reset instructions will be sent shortly. This will be available soon.';
            }, 400);
        },
    },
};
</script>
