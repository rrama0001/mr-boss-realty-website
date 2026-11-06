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
            <section class="login-panel" aria-labelledby="reset-title">
                <div class="login-panel__brand">
                    <img :src="logoUrl" :alt="appName" class="login-panel__logo" />
                    <h1 id="reset-title" class="login-panel__title">Reset password</h1>
                    <p class="login-panel__lead">
                        Choose a new password for your Mr. Boss Realty account.
                    </p>
                </div>

                <p v-if="errorMessage" class="alert alert-warning login-panel__alert" role="alert">
                    {{ errorMessage }}
                </p>
                <p v-if="successMessage" class="alert alert-success login-panel__alert" role="status">
                    {{ successMessage }}
                </p>

                <form v-if="!successMessage" class="login-form" @submit.prevent="onSubmit">
                    <div class="login-form__field">
                        <label class="login-form__label" for="reset-password">New password</label>
                        <input
                            id="reset-password"
                            v-model="form.password"
                            type="password"
                            class="form-control"
                            name="password"
                            autocomplete="new-password"
                            placeholder="Enter a new password"
                            required
                            minlength="8"
                            :disabled="!resetToken"
                        />
                    </div>

                    <div class="login-form__field">
                        <label class="login-form__label" for="reset-password-confirm">Confirm password</label>
                        <input
                            id="reset-password-confirm"
                            v-model="form.passwordConfirm"
                            type="password"
                            class="form-control"
                            name="passwordConfirm"
                            autocomplete="new-password"
                            placeholder="Re-enter your new password"
                            required
                            minlength="8"
                            :disabled="!resetToken"
                        />
                    </div>

                    <button
                        type="submit"
                        class="btn btn-primary login-form__submit"
                        :disabled="isSubmitting || !resetToken"
                    >
                        <span v-if="isSubmitting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>{{ isSubmitting ? 'Updating...' : 'Update password' }}</span>
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
import bgImageUrl from '@/assets/images/mr-boss-login-background.jpg';

export default {
    name: 'ResetPasswordView',
    data() {
        return {
            appName,
            logoUrl,
            bgImageUrl,
            form: {
                password: '',
                passwordConfirm: '',
            },
            isSubmitting: false,
            errorMessage: '',
            successMessage: '',
        };
    },
    computed: {
        resetToken() {
            return String(this.$route.query.token || '').trim();
        },
    },
    mounted() {
        if (!this.resetToken) {
            this.errorMessage = 'This reset link is missing or invalid. Request a new one from Forgot password.';
        }
    },
    methods: {
        async onSubmit() {
            this.errorMessage = '';
            this.successMessage = '';

            if (!this.resetToken) {
                this.errorMessage = 'This reset link is missing or invalid. Request a new one from Forgot password.';
                return;
            }

            if (!this.form.password || this.form.password.length < 8) {
                this.errorMessage = 'Password must be at least 8 characters.';
                return;
            }

            if (this.form.password !== this.form.passwordConfirm) {
                this.errorMessage = 'Passwords do not match.';
                return;
            }

            this.isSubmitting = true;

            try {
                const res = await this.$api.post('/auth/reset-password', {
                    token: this.resetToken,
                    password: this.form.password,
                    passwordConfirm: this.form.passwordConfirm,
                });
                this.successMessage = res.data?.message
                    || 'Your password has been updated. You can now log in with your email and password.';
                this.form.password = '';
                this.form.passwordConfirm = '';
            } catch (err) {
                this.errorMessage = err.response?.data?.error
                    || 'Unable to update your password. Please request a new reset link.';
            } finally {
                this.isSubmitting = false;
            }
        },
    },
};
</script>
