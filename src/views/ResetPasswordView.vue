<template>
    <div class="auth-page">
        <div class="auth-page__glow" aria-hidden="true"></div>

        <div class="auth-page__shell">
            <header class="auth-brand">
                <router-link to="/" class="auth-brand__logo-link" aria-label="Go to homepage">
                    <img :src="logoUrl" :alt="appName" class="auth-brand__logo" />
                </router-link>
                <h1 id="reset-title" class="auth-brand__title">Choose a new password</h1>
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

                <section class="auth-panel" aria-labelledby="reset-title">
                    <p class="auth-panel__lead">
                        Set a new password for your Mr. Boss Realty account.
                    </p>

                    <p v-if="errorMessage" class="alert alert-warning auth-panel__alert" role="alert">
                        {{ errorMessage }}
                    </p>
                    <p v-if="successMessage" class="alert alert-success auth-panel__alert" role="status">
                        {{ successMessage }}
                    </p>

                    <form v-if="!successMessage" class="auth-form" @submit.prevent="onSubmit">
                        <div class="auth-form__field">
                            <label class="auth-form__label" for="reset-password">New password</label>
                            <input
                                id="reset-password"
                                v-model="form.password"
                                type="password"
                                class="form-control auth-form__input"
                                name="password"
                                autocomplete="new-password"
                                placeholder="Enter a new password"
                                required
                                minlength="8"
                                :disabled="!resetToken"
                            />
                        </div>

                        <div class="auth-form__field">
                            <label class="auth-form__label" for="reset-password-confirm">Confirm password</label>
                            <input
                                id="reset-password-confirm"
                                v-model="form.passwordConfirm"
                                type="password"
                                class="form-control auth-form__input"
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
                            class="btn btn-primary auth-form__submit"
                            :disabled="isSubmitting || !resetToken"
                        >
                            <span
                                v-if="isSubmitting"
                                class="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                            ></span>
                            <span>{{ isSubmitting ? 'Updating...' : 'Update password' }}</span>
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
import visualUrl from '@/assets/images/auth-reset-visual.jpg';

export default {
    name: 'ResetPasswordView',
    data() {
        return {
            appName,
            logoUrl,
            visualUrl,
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
