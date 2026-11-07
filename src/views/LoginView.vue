<template>
    <div class="auth-page">
        <div class="auth-page__glow" aria-hidden="true"></div>

        <div class="auth-page__shell">
            <header class="auth-brand">
                <router-link to="/" class="auth-brand__logo-link" aria-label="Go to homepage">
                    <img :src="logoUrl" :alt="appName" class="auth-brand__logo" />
                </router-link>
                <h1 id="login-title" class="auth-brand__title">Sign in to your account</h1>
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

                <section class="auth-panel" aria-labelledby="login-title">
                    <p class="auth-panel__lead">
                        Welcome back. Sign in to continue with Mr. Boss Realty.
                    </p>

                    <p v-if="errorMessage" class="alert alert-warning auth-panel__alert" role="alert">
                        {{ errorMessage }}
                    </p>

                    <form class="auth-form" @submit.prevent="onSubmit">
                        <div class="auth-form__field">
                            <label class="auth-form__label" for="login-email">Email</label>
                            <input
                                id="login-email"
                                v-model.trim="form.email"
                                type="email"
                                class="form-control auth-form__input"
                                name="email"
                                autocomplete="email"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div class="auth-form__field">
                            <div class="auth-form__label">
                                <label for="login-password">Password</label>
                                <router-link to="/forgot-password" class="auth-form__forgot">
                                    Forgot password?
                                </router-link>
                            </div>
                            <input
                                id="login-password"
                                v-model="form.password"
                                type="password"
                                class="form-control auth-form__input"
                                name="password"
                                autocomplete="current-password"
                                placeholder="Enter your password"
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
                            <span>{{ isSubmitting ? 'Signing in...' : 'Login' }}</span>
                        </button>
                    </form>

                    <div class="auth-panel__divider" role="separator" aria-label="Or">
                        <span>or</span>
                    </div>

                    <button
                        type="button"
                        class="btn auth-google-btn"
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

                    <p class="auth-panel__footer">
                        Don&rsquo;t have an account?
                        <router-link to="/register">Create one</router-link>
                        <span class="auth-panel__footer-sep" aria-hidden="true"> · </span>
                        <router-link to="/">Back to home</router-link>
                    </p>
                </section>
            </div>
        </div>
    </div>
</template>

<script>
import { appName } from '@/config/app';
import logoUrl from '@/assets/images/mr-boss-realty-logo.png';
import visualUrl from '@/assets/images/auth-login-visual.jpg';

export default {
    name: 'LoginView',
    data() {
        return {
            appName,
            logoUrl,
            visualUrl,
            form: {
                email: '',
                password: '',
            },
            isSubmitting: false,
            isGoogleLoading: false,
            errorMessage: '',
        };
    },
    methods: {
        async onSubmit() {
            this.errorMessage = '';

            if (!this.form.email || !this.form.password) {
                this.errorMessage = 'Please enter your email and password.';
                return;
            }

            this.isSubmitting = true;

            try {
                const res = await this.$api.post('/auth/login', {
                    email: this.form.email,
                    password: this.form.password,
                }, {
                    withCredentials: true,
                });

                const role = String(res.data?.user?.role || '').toLowerCase();
                const adminBase = String(import.meta.env.VITE_ADMIN_URL || 'http://localhost:5173')
                    .replace(/\/login\/?$/i, '')
                    .replace(/\/$/, '');

                if (role === 'admin' || role === 'agent') {
                    window.location.href = `${adminBase}/dashboard`;
                    return;
                }

                this.$router.push('/');
            } catch (err) {
                this.errorMessage = err.response?.data?.error
                    || 'Unable to sign in. Please check your email and password.';
            } finally {
                this.isSubmitting = false;
            }
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
