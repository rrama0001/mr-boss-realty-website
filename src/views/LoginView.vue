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
            <section class="login-panel" aria-labelledby="login-title">
                <div class="login-panel__brand">
                    <img :src="logoUrl" :alt="appName" class="login-panel__logo" />
                    <h1 id="login-title" class="login-panel__title">Login</h1>
                    <p class="login-panel__lead">
                        Sign in to continue with your Mr. Boss Realty account.
                    </p>
                </div>

                <p v-if="errorMessage" class="alert alert-warning login-panel__alert" role="alert">
                    {{ errorMessage }}
                </p>

                <form class="login-form" @submit.prevent="onSubmit">
                    <div class="login-form__field">
                        <label class="login-form__label" for="login-username">Username</label>
                        <input
                            id="login-username"
                            v-model.trim="form.username"
                            type="text"
                            class="form-control"
                            name="username"
                            autocomplete="username"
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div class="login-form__field">
                        <div class="login-form__label-row">
                            <label class="login-form__label" for="login-password">Password</label>
                            <router-link to="/forgot-password" class="login-form__forgot">
                                Forgot password?
                            </router-link>
                        </div>
                        <input
                            id="login-password"
                            v-model="form.password"
                            type="password"
                            class="form-control"
                            name="password"
                            autocomplete="current-password"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        class="btn btn-primary login-form__submit"
                        :disabled="isSubmitting"
                    >
                        <span v-if="isSubmitting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>{{ isSubmitting ? 'Signing in...' : 'Login' }}</span>
                    </button>
                </form>

                <div class="login-panel__divider" role="separator" aria-label="Or">
                    <span>or</span>
                </div>

                <button
                    type="button"
                    class="btn login-google-btn"
                    :disabled="isGoogleLoading"
                    @click="loginWithGoogle"
                >
                    <template v-if="!isGoogleLoading">
                        <img
                            src="https://developers.google.com/identity/images/g-logo.png"
                            alt=""
                            width="20"
                            height="20"
                        />
                        <span>Login using Google</span>
                    </template>
                    <template v-else>
                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Connecting...</span>
                    </template>
                </button>

                <p class="login-panel__footer">
                    <router-link to="/">Back to home</router-link>
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
    name: 'LoginView',
    data() {
        return {
            appName,
            logoUrl,
            bgImageUrl,
            form: {
                username: '',
                password: '',
            },
            isSubmitting: false,
            isGoogleLoading: false,
            errorMessage: '',
        };
    },
    methods: {
        onSubmit() {
            this.errorMessage = '';

            if (!this.form.username || !this.form.password) {
                this.errorMessage = 'Please enter your username and password.';
                return;
            }

            this.isSubmitting = true;

            // Password login for website accounts will be wired to the API next.
            window.setTimeout(() => {
                this.isSubmitting = false;
                this.errorMessage = 'Username and password login will be available soon.';
            }, 400);
        },
        loginWithGoogle() {
            this.errorMessage = '';
            this.isGoogleLoading = true;

            const backendUrl = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
            if (!backendUrl) {
                this.errorMessage = 'Login is not configured yet. Please try again later.';
                this.isGoogleLoading = false;
                return;
            }

            window.setTimeout(() => {
                window.location.href = `${backendUrl}/auth/google`;
            }, 250);
        },
    },
};
</script>
