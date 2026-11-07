<template>
    <div class="auth-page">
        <div class="auth-page__glow" aria-hidden="true"></div>

        <div class="auth-page__shell">
            <header class="auth-brand">
                <router-link to="/" class="auth-brand__logo-link" aria-label="Go to homepage">
                    <img :src="logoUrl" :alt="appName" class="auth-brand__logo" />
                </router-link>
                <h1 id="register-title" class="auth-brand__title">Create your account</h1>
            </header>

            <div class="auth-stage">
                <aside class="auth-visual" aria-live="polite">
                    <Transition name="auth-visual-fade" mode="out-in">
                        <img
                            :key="step"
                            class="auth-visual__image"
                            :src="activeStepVisual.src"
                            :alt="activeStepVisual.alt"
                            width="640"
                            height="800"
                            decoding="async"
                        />
                    </Transition>
                </aside>

                <section class="auth-panel" aria-labelledby="register-title">
                    <div class="auth-progress" aria-label="Registration progress">
                        <div
                            class="auth-progress__bar"
                            :style="{ width: progressWidth }"
                            aria-hidden="true"
                        ></div>
                        <ol class="auth-progress__steps">
                            <li
                                v-for="item in steps"
                                :key="item.number"
                                class="auth-progress__step"
                                :class="{
                                    'is-active': step === item.number,
                                    'is-complete': step > item.number,
                                }"
                            >
                                <span class="auth-progress__dot" aria-hidden="true">
                                    <i :class="item.icon"></i>
                                </span>
                                <span class="auth-progress__label">{{ item.label }}</span>
                            </li>
                        </ol>
                    </div>

                    <p class="auth-panel__lead">{{ stepLead }}</p>

                    <p v-if="errorMessage" class="alert alert-warning auth-panel__alert" role="alert">
                        {{ errorMessage }}
                    </p>

                    <Transition name="auth-step-fade" mode="out-in">
                        <!-- Step 1: Email -->
                        <form
                            v-if="step === 1"
                            key="step-1"
                            class="auth-form"
                            @submit.prevent="goToStep2"
                        >
                            <div class="auth-form__field">
                                <label class="auth-form__label" for="register-email">Email</label>
                                <input
                                    id="register-email"
                                    v-model.trim="form.email"
                                    type="email"
                                    class="form-control auth-form__input"
                                    name="email"
                                    autocomplete="email"
                                    placeholder="your.name@email.com"
                                    required
                                />
                                <p class="auth-form__hint">
                                    Your personal email becomes your username for login.
                                </p>
                            </div>

                            <button type="submit" class="btn btn-primary auth-form__submit">
                                Continue
                            </button>
                        </form>

                        <!-- Step 2: Password -->
                        <form
                            v-else-if="step === 2"
                            key="step-2"
                            class="auth-form"
                            @submit.prevent="goToStep3"
                        >
                            <div class="auth-form__field">
                                <label class="auth-form__label" for="register-password">Password</label>
                                <input
                                    id="register-password"
                                    v-model="form.password"
                                    type="password"
                                    class="form-control auth-form__input"
                                    name="password"
                                    autocomplete="new-password"
                                    placeholder="At least 8 characters"
                                    required
                                    minlength="8"
                                />
                            </div>

                            <div class="auth-form__field">
                                <label class="auth-form__label" for="register-password-confirm">
                                    Retype password
                                </label>
                                <input
                                    id="register-password-confirm"
                                    v-model="form.passwordConfirm"
                                    type="password"
                                    class="form-control auth-form__input"
                                    name="passwordConfirm"
                                    autocomplete="new-password"
                                    placeholder="Retype your password"
                                    required
                                    minlength="8"
                                />
                            </div>

                            <div class="auth-actions">
                                <button type="button" class="btn auth-form__secondary" @click="step = 1">
                                    Back
                                </button>
                                <button type="submit" class="btn btn-primary auth-form__submit">
                                    Continue
                                </button>
                            </div>
                        </form>

                        <!-- Step 3: Profile -->
                        <form
                            v-else
                            key="step-3"
                            class="auth-form"
                            @submit.prevent="onSubmit"
                        >
                            <div class="auth-form__field">
                                <label class="auth-form__label" for="register-full-name">Full name</label>
                                <input
                                    id="register-full-name"
                                    v-model.trim="form.full_name"
                                    type="text"
                                    class="form-control auth-form__input"
                                    name="full_name"
                                    autocomplete="name"
                                    placeholder="Juan Dela Cruz"
                                    required
                                />
                            </div>

                            <div class="auth-form__field">
                                <label class="auth-form__label" for="register-phone">
                                    Mobile number
                                    <span class="auth-form__optional">Optional</span>
                                </label>
                                <input
                                    id="register-phone"
                                    v-model.trim="form.phone"
                                    type="tel"
                                    class="form-control auth-form__input"
                                    name="phone"
                                    autocomplete="tel"
                                    placeholder="09XXXXXXXXX"
                                />
                                <p class="auth-form__hint">
                                    So our agents can reach you about listings you like.
                                </p>
                            </div>

                            <fieldset class="auth-prefs">
                                <legend class="auth-prefs__legend">Stay updated</legend>
                                <label class="auth-prefs__option">
                                    <input v-model="form.notify_email" type="checkbox" />
                                    <span>Email me matching listings and property updates</span>
                                </label>
                                <label class="auth-prefs__option">
                                    <input
                                        v-model="form.notify_sms"
                                        type="checkbox"
                                        :disabled="!form.phone"
                                    />
                                    <span>Text me SMS alerts when I opt in</span>
                                </label>
                            </fieldset>

                            <div class="auth-actions">
                                <button
                                    type="button"
                                    class="btn auth-form__secondary"
                                    :disabled="isSubmitting"
                                    @click="step = 2"
                                >
                                    Back
                                </button>
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
                                    <span>{{ isSubmitting ? 'Creating account...' : 'Create account' }}</span>
                                </button>
                            </div>
                        </form>
                    </Transition>

                    <p class="auth-panel__footer">
                        Already have an account?
                        <router-link to="/login">Log in</router-link>
                    </p>
                </section>
            </div>
        </div>
    </div>
</template>

<script>
import { appName } from '@/config/app';
import logoUrl from '@/assets/images/mr-boss-realty-logo.png';
import step1Image from '@/assets/images/register-step-1-email.jpg';
import step2Image from '@/assets/images/register-step-2-password.jpg';
import step3Image from '@/assets/images/register-step-3-profile.jpg';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
    name: 'RegisterView',
    data() {
        return {
            appName,
            logoUrl,
            step: 1,
            steps: [
                { number: 1, label: 'Email', icon: 'ti ti-mail' },
                { number: 2, label: 'Password', icon: 'ti ti-lock' },
                { number: 3, label: 'Profile', icon: 'ti ti-user' },
            ],
            stepVisuals: {
                1: {
                    src: step1Image,
                    alt: 'Bright modern living room',
                },
                2: {
                    src: step2Image,
                    alt: 'Bright modern house exterior',
                },
                3: {
                    src: step3Image,
                    alt: 'Bright contemporary home interior',
                },
            },
            form: {
                email: '',
                password: '',
                passwordConfirm: '',
                full_name: '',
                phone: '',
                notify_email: true,
                notify_sms: false,
            },
            isSubmitting: false,
            errorMessage: '',
        };
    },
    computed: {
        progressWidth() {
            const ratio = (this.step - 1) / (this.steps.length - 1);
            return `calc(67% * ${ratio})`;
        },
        stepLead() {
            if (this.step === 1) {
                return 'Start with the personal email you will use to sign in.';
            }
            if (this.step === 2) {
                return 'Choose a password that only you will know.';
            }
            return 'Add your details so we can assist you better.';
        },
        activeStepVisual() {
            return this.stepVisuals[this.step] || this.stepVisuals[1];
        },
    },
    watch: {
        'form.phone'(value) {
            if (!String(value || '').trim()) {
                this.form.notify_sms = false;
            }
        },
    },
    methods: {
        goToStep2() {
            this.errorMessage = '';
            const email = String(this.form.email || '').trim().toLowerCase();
            this.form.email = email;

            if (!email) {
                this.errorMessage = 'Please enter your email.';
                return;
            }
            if (!EMAIL_PATTERN.test(email)) {
                this.errorMessage = 'Please enter a valid email address.';
                return;
            }

            this.step = 2;
        },
        goToStep3() {
            this.errorMessage = '';

            if (!this.form.password || this.form.password.length < 8) {
                this.errorMessage = 'Password must be at least 8 characters.';
                return;
            }
            if (this.form.password !== this.form.passwordConfirm) {
                this.errorMessage = 'Passwords do not match.';
                return;
            }

            this.step = 3;
        },
        async onSubmit() {
            this.errorMessage = '';

            if (!String(this.form.full_name || '').trim()) {
                this.errorMessage = 'Please enter your full name.';
                return;
            }

            this.isSubmitting = true;

            try {
                const phone = String(this.form.phone || '').trim();
                await this.$api.post('/auth/register', {
                    email: this.form.email,
                    password: this.form.password,
                    passwordConfirm: this.form.passwordConfirm,
                    full_name: String(this.form.full_name || '').trim(),
                    phone: phone || undefined,
                    notify_email: Boolean(this.form.notify_email),
                    notify_sms: Boolean(phone) && Boolean(this.form.notify_sms),
                }, {
                    withCredentials: true,
                });

                this.$router.push('/');
            } catch (err) {
                this.errorMessage = err.response?.data?.error
                    || 'Unable to create your account. Please try again.';

                if (err.response?.status === 409) {
                    this.step = 1;
                }
            } finally {
                this.isSubmitting = false;
            }
        },
    },
};
</script>
