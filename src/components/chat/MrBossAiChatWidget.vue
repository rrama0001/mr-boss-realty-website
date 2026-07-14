<template>
    <div
        id="ai-assistant"
        ref="widgetRoot"
        class="mrboss-chat-widget home-hero home-hero--widget"
    >
        <div class="hero-chat-layer-host">
            <div
                ref="heroInteraction"
                class="hero-interaction"
                :class="{
                    'hero-interaction--docked': assistantActive && (isDocked || isExpandingToDocked) && !isMinimizingFromDocked,
                    'hero-interaction--minimized': useCornerMinimizedInteraction,
                    'hero-interaction--docking': isDockAnimating,
                    'hero-interaction--minimize-anim': dockPhase === 'to-minimized' && isDocked,
                    'hero-interaction--expand-to-docked': isExpandingToDocked,
                }"
            >
                <form class="hero-interaction__form" @submit.prevent="onSubmit">
                    <div
                        v-if="showChatPanel"
                        ref="heroChat"
                        class="hero-chat hero-chat--dock-layout"
                    >
                        <div class="hero-chat__header">
                            <div
                                ref="headerOrb"
                                class="hero-chat__header-orb"
                                aria-hidden="true"
                            >
                                <AiOrb
                                    v-if="showHeaderOrb && !showFunctionalOrb"
                                    :active="assistantActive"
                                    :thinking="thinking"
                                />
                            </div>
                            <span class="hero-chat__title">Mr. Boss AI</span>
                            <div class="hero-chat__header-actions">
                                <button
                                    v-if="!isMinimized"
                                    type="button"
                                    class="hero-chat__header-btn"
                                    aria-label="Minimize"
                                    title="Minimize"
                                    :disabled="isDockAnimating"
                                    @click="minimizeChat"
                                >
                                    <i class="ti ti-minus"></i>
                                </button>
                                <button
                                    v-if="hasConversation"
                                    type="button"
                                    class="hero-chat__header-btn"
                                    aria-label="Delete Chat"
                                    title="Delete Chat"
                                    :disabled="thinking || isDockAnimating"
                                    @click="clearConversation"
                                >
                                    <i class="ti ti-trash"></i>
                                </button>
                            </div>
                        </div>

                        <div
                            ref="chatTranscript"
                            class="hero-chat__messages"
                            role="log"
                            aria-live="polite"
                            aria-relevant="additions"
                            :aria-busy="thinking ? 'true' : 'false'"
                        >
                            <div
                                v-for="(message, index) in messages"
                                :key="index"
                                class="hero-chat__message-row"
                                :class="message.role === 'user' ? 'hero-chat__message-row--user' : 'hero-chat__message-row--assistant'"
                            >
                                <span class="hero-chat__message-label">
                                    {{ message.role === 'user' ? 'You' : 'Mr. Boss AI' }}
                                </span>
                                <div class="hero-chat__message-stack">
                                    <div
                                        class="hero-chat__message"
                                        :class="message.role === 'user' ? 'hero-chat__message--user' : 'hero-chat__message--assistant'"
                                        v-html="renderMessageContent(message.content)"
                                    ></div>
                                    <div
                                        v-if="showVerificationConsent(index)"
                                        class="hero-chat__verification"
                                    >
                                        <p class="hero-chat__verification-note">
                                            Privacy consent required before we can share non-public details.
                                        </p>
                                        <div class="hero-chat__verification-actions">
                                            <button
                                                type="button"
                                                class="btn btn-primary btn-sm"
                                                :disabled="thinking"
                                                @click="onVerificationConsent(true, index)"
                                            >
                                                Agree
                                            </button>
                                            <button
                                                type="button"
                                                class="btn btn-sm hero-chat__verification-btn hero-chat__verification-btn--cancel"
                                                :disabled="thinking"
                                                @click="onVerificationConsent(false, index)"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        v-if="showVerificationContact(index)"
                                        class="hero-chat__verification"
                                    >
                                        <label class="hero-chat__verification-label" :for="`verification-contact-${index}`">
                                            Mobile number
                                        </label>
                                        <div class="hero-chat__verification-form">
                                            <input
                                                :id="`verification-contact-${index}`"
                                                v-model="verificationContact"
                                                type="tel"
                                                inputmode="tel"
                                                autocomplete="tel"
                                                class="form-control form-control-sm hero-chat__verification-input"
                                                placeholder="09171234567"
                                                :disabled="thinking"
                                                @keydown.enter.prevent="onVerificationContact(index)"
                                            />
                                            <button
                                                type="button"
                                                class="btn btn-primary btn-sm"
                                                :disabled="thinking || !verificationContact.trim()"
                                                @click="onVerificationContact(index)"
                                            >
                                                Send SMS OTP
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        v-if="showVerificationOtp(index)"
                                        class="hero-chat__verification"
                                    >
                                        <div
                                            v-if="getVerificationDevOtp(index)"
                                            class="hero-chat__verification-dev-otp"
                                        >
                                            <p class="hero-chat__verification-dev-label">Development OTP</p>
                                            <p class="hero-chat__verification-dev-code">{{ getVerificationDevOtp(index) }}</p>
                                            <p class="hero-chat__verification-dev-note">
                                                SMS is not configured on the server. Use this code to continue testing locally.
                                            </p>
                                        </div>
                                        <label class="hero-chat__verification-label" :for="`verification-otp-${index}`">
                                            6-digit OTP
                                        </label>
                                        <div class="hero-chat__verification-form">
                                            <input
                                                :id="`verification-otp-${index}`"
                                                v-model="verificationOtp"
                                                type="text"
                                                inputmode="numeric"
                                                maxlength="6"
                                                class="form-control form-control-sm hero-chat__verification-input"
                                                placeholder="Enter OTP"
                                                :disabled="thinking"
                                                @keydown.enter.prevent="onVerificationOtp(index)"
                                            />
                                            <button
                                                type="button"
                                                class="btn btn-primary btn-sm"
                                                :disabled="thinking || verificationOtp.trim().length < 6"
                                                @click="onVerificationOtp(index)"
                                            >
                                                Verify
                                            </button>
                                        </div>
                                        <p v-if="verificationError" class="hero-chat__verification-error">{{ verificationError }}</p>
                                    </div>
                                    <ChatMediaPreviews
                                        v-if="message.role === 'assistant'"
                                        :content="message.content"
                                    />
                                </div>
                            </div>

                            <div
                                v-if="thinking"
                                class="hero-chat__message-row hero-chat__message-row--assistant"
                            >
                                <span class="hero-chat__message-label">Mr. Boss AI</span>
                                <div class="hero-chat__message hero-chat__message--assistant hero-chat__message--typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>

                        <div class="hero-chat__composer">
                            <textarea
                                ref="chatInput"
                                v-model="draft"
                                rows="1"
                                class="form-control hero-chat__input"
                                placeholder="Ask a follow-up question..."
                                aria-label="Chat with Mr. Boss AI"
                                data-gramm="false"
                                data-gramm_editor="false"
                                data-enable-grammarly="false"
                                :disabled="thinking"
                                @input="resizeChatInput"
                                @keydown.enter.exact.prevent="onSubmit"
                            ></textarea>
                            <button
                                type="submit"
                                class="btn btn-primary hero-chat__send"
                                :disabled="thinking || !draft.trim()"
                                aria-label="Send message"
                            >
                                <i class="ti ti-arrow-up"></i>
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <button
                v-if="showMinimizedTrigger"
                ref="minimizedTrigger"
                type="button"
                class="hero-chat__minimized-trigger"
                aria-label="Open Mr. Boss AI chat"
                @click="restoreFromMinimize"
            >
                <AiOrb
                    v-if="!showFunctionalOrb"
                    :active="assistantActive"
                    :thinking="thinking"
                />
                <span
                    v-else
                    ref="minimizedOrbAnchor"
                    class="hero-chat__minimized-orb-anchor"
                    aria-hidden="true"
                ></span>
            </button>
        </div>

        <div
            v-if="showFunctionalOrb"
            ref="functionalOrb"
            class="hero-functional-orb"
            :class="{ 'hero-functional-orb--animating': orbPinActive || isDockAnimating }"
        >
            <AiOrb :active="assistantActive" :thinking="thinking" />
        </div>

        <Transition name="ai-guide-nudge">
            <div
                v-if="showGuideNudge"
                class="ai-guide-nudge"
                :class="`ai-guide-nudge--${guideNudgePlacement}`"
                role="status"
                aria-live="polite"
            >
                <button
                    type="button"
                    class="ai-guide-nudge__dismiss"
                    aria-label="Dismiss"
                    @click.stop="dismissGuideNudge"
                >
                    <i class="ti ti-x" aria-hidden="true"></i>
                </button>
                <p class="ai-guide-nudge__message">{{ guideNudge.message }}</p>
                <button type="button" class="ai-guide-nudge__link" @click.stop="openGuideModal">
                    {{ guideNudge.linkLabel }}
                    <i class="ti ti-arrow-right" aria-hidden="true"></i>
                </button>
            </div>
        </Transition>

        <AiAssistantGuideModal
            :open="guideModalOpen"
            @update:open="guideModalOpen = $event"
            @try-assistant="focusAssistantInput"
        />
    </div>
</template>

<script>
import AiOrb from '@/components/ai/AiOrb.vue';
import AiAssistantGuideModal from '@/components/ai/AiAssistantGuideModal.vue';
import ChatMediaPreviews from '@/components/chat/ChatMediaPreviews.vue';
import { renderMarkdown } from '@/utils/renderMarkdown';
import {
    SITE_CHAT_INTEREST_EVENT,
    SITE_CHAT_MESSAGE_EVENT,
    SITE_CHAT_STORAGE_KEY,
    dispatchSiteChatConversationChange,
} from '@/utils/siteChat';
import {
    AI_GUIDE_NUDGE_IDLE_MS,
    dismissAiGuideNudge,
    isAiGuideNudgeDismissed,
} from '@/utils/aiGuideNudge';
import { AI_GUIDE_NUDGE } from '@/config/homeContent';

const AI_REPLY_ERROR = 'Failed to generate reply. Please try again.';
const DOCK_FLIP_MS = 620;
const DOCK_FLIP_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)';
const MINIMIZE_CHAT_TUCK_START = 0.4;
const MOBILE_MAX_WIDTH = 767.98;
const CHAT_STORAGE_KEY = SITE_CHAT_STORAGE_KEY;

export default {
    name: 'MrBossAiChatWidget',
    components: { AiOrb, AiAssistantGuideModal, ChatMediaPreviews },
    data() {
        return {
            assistantActive: false,
            thinking: false,
            chatMode: 'minimized',
            isMobile: false,
            isDockAnimating: false,
            dockPhase: null,
            restoreTargetMode: null,
            orbPinActive: false,
            dockedModeAnchorRect: null,
            draft: '',
            messages: [],
            chatSessionId: `website-${Date.now()}`,
            verificationContact: '',
            verificationOtp: '',
            verificationError: '',
            otpVerificationEnabled: false,
            _restoringChatState: false,
            guideModalOpen: false,
            guideNudgeVisible: false,
            guideNudgeDismissed: isAiGuideNudgeDismissed(),
            guideNudge: AI_GUIDE_NUDGE,
            _guideNudgeTimer: null,
        };
    },
    computed: {
        isDocked() {
            return this.chatMode === 'docked';
        },
        isMinimized() {
            return this.chatMode === 'minimized';
        },
        isMinimizingFromDocked() {
            return this.dockPhase === 'to-minimized' && this.isDocked;
        },
        isMinimizingToCorner() {
            return this.dockPhase === 'to-minimized' && this.isDocked;
        },
        isExpandingToDocked() {
            return this.dockPhase === 'from-minimized' && this.restoreTargetMode === 'docked';
        },
        useCornerMinimizedInteraction() {
            if (!this.assistantActive || !this.isMinimized || this.isDockAnimating) return false;
            return true;
        },
        showChatPanel() {
            if (!this.assistantActive) return false;
            if (this.isMinimized && this.dockPhase !== 'from-minimized') return false;
            return true;
        },
        showMinimizedTrigger() {
            if (this.orbPinActive) return false;
            if (this.dockPhase === 'from-minimized') return false;
            if (this.isDockAnimating) return false;
            return this.assistantActive && this.isMinimized;
        },
        showHeaderOrb() {
            return this.assistantActive && this.isDocked && !this.isDockAnimating;
        },
        showFunctionalOrb() {
            if (this.orbPinActive) return true;
            if (
                this.isDockAnimating &&
                (this.dockPhase === 'to-minimized' || this.dockPhase === 'from-minimized')
            ) {
                return true;
            }
            if (!this.assistantActive) return false;
            if (this.isDocked && !this.isDockAnimating) return false;
            return this.isMinimized;
        },
        useDockLayout() {
            return true;
        },
        hasConversation() {
            return this.messages.length > 0;
        },
        showGuideNudge() {
            if (!this.guideNudgeVisible || this.guideNudgeDismissed || this.hasConversation) return false;
            if (this.thinking || this.isDockAnimating || this.guideModalOpen) return false;
            if (this.showMinimizedTrigger || this.isMinimized) return true;
            if (this.isDocked && this.showChatPanel && !this.hasConversation) return true;
            return false;
        },
        guideNudgePlacement() {
            if (this.showMinimizedTrigger || this.isMinimized) return 'minimized';
            if (this.isDocked && this.showChatPanel) return 'docked';
            return 'minimized';
        },
    },
    mounted() {
        this.updateViewportMode();
        if (!this.restoreChatState()) {
            this.activateDefaultMinimizedWidget();
        } else {
            this.normalizeWidgetChatState();
        }
        this._viewportMq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
        this._onViewportChange = () => this.updateViewportMode();
        this._viewportMq.addEventListener('change', this._onViewportChange);
        this._onBeforeUnload = () => this.persistChatState();
        window.addEventListener('pagehide', this._onBeforeUnload);
        this._onSiteChatInterest = (event) => this.handleSiteChatInterest(event);
        this._onSiteChatMessage = (event) => this.handleSiteChatMessage(event);
        window.addEventListener(SITE_CHAT_INTEREST_EVENT, this._onSiteChatInterest);
        window.addEventListener(SITE_CHAT_MESSAGE_EVENT, this._onSiteChatMessage);
        this.bindOrbResizeHandler();
        this.$nextTick(() => {
            this.settleFunctionalOrb();
            dispatchSiteChatConversationChange(this.hasConversation);
        });
        this.scheduleGuideNudge();
    },
    watch: {
        hasConversation(hasMessages) {
            if (hasMessages) {
                this.hideGuideNudgeForSession();
            }
            dispatchSiteChatConversationChange(hasMessages);
        },
        draft() {
            this.$nextTick(this.resizeChatInput);
        },
        assistantActive(active) {
            if (this._restoringChatState) return;
            this.persistChatState();
            if (active) {
                this.$nextTick(this.resizeChatInput);
            }
        },
        chatMode() {
            if (this._restoringChatState) return;
            this.persistChatState();
            if (this.isDockAnimating || this.orbPinActive) return;
            this.$nextTick(this.settleFunctionalOrb);
        },
        messages: {
            deep: true,
            handler() {
                if (this._restoringChatState) return;
                this.persistChatState();
            },
        },
    },
    beforeUnmount() {
        this.clearGuideNudgeTimer();
        this.clearReplyTimers();
        this.unbindOrbResizeHandler();
        this._viewportMq?.removeEventListener('change', this._onViewportChange);
        window.removeEventListener('pagehide', this._onBeforeUnload);
        window.removeEventListener(SITE_CHAT_INTEREST_EVENT, this._onSiteChatInterest);
        window.removeEventListener(SITE_CHAT_MESSAGE_EVENT, this._onSiteChatMessage);
        this.persistChatState();
    },
    methods: {
        renderMessageContent(content) {
            return renderMarkdown(content);
        },

        focusAssistantInput() {
            this.guideNudgeVisible = false;

            if (this.isMinimized) {
                this.restoreFromMinimize();
            }

            this.$nextTick(() => {
                this.$refs.chatInput?.focus({ preventScroll: true });
            });
        },

        scheduleGuideNudge() {
            this.clearGuideNudgeTimer();

            if (this.guideNudgeDismissed || this.hasConversation) return;

            this._guideNudgeTimer = window.setTimeout(() => {
                if (!this.guideNudgeDismissed && !this.hasConversation) {
                    this.guideNudgeVisible = true;
                }
            }, AI_GUIDE_NUDGE_IDLE_MS);
        },

        clearGuideNudgeTimer() {
            if (this._guideNudgeTimer) {
                window.clearTimeout(this._guideNudgeTimer);
                this._guideNudgeTimer = null;
            }
        },

        dismissGuideNudge() {
            this.guideNudgeVisible = false;
            this.hideGuideNudgeForSession();
        },

        hideGuideNudgeForSession() {
            this.guideNudgeVisible = false;
            this.guideNudgeDismissed = true;
            this.clearGuideNudgeTimer();
            dismissAiGuideNudge();
        },

        openGuideModal() {
            this.guideNudgeVisible = false;
            this.guideModalOpen = true;
        },

        registerAiGuideActivity() {
            this.guideNudgeVisible = false;
            this.clearGuideNudgeTimer();

            if (this.hasConversation) {
                this.hideGuideNudgeForSession();
                return;
            }

            this.scheduleGuideNudge();
        },

        persistChatState() {
            if (this._restoringChatState) return;

            if (!this.assistantActive) {
                sessionStorage.removeItem(CHAT_STORAGE_KEY);
                return;
            }

            sessionStorage.setItem(
                CHAT_STORAGE_KEY,
                JSON.stringify({
                    widgetActive: true,
                    assistantActive: true,
                    chatSessionId: this.chatSessionId,
                    messages: this.messages,
                    chatMode: this.chatMode === 'normal' ? 'minimized' : this.chatMode,
                    dockedModeAnchorRect: this.dockedModeAnchorRect,
                })
            );
        },

        restoreChatState() {
            try {
                const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
                if (!raw) return false;

                const saved = JSON.parse(raw);
                const hasMessages = Array.isArray(saved?.messages) && saved.messages.length > 0;
                const shouldRestore =
                    saved?.widgetActive === true ||
                    saved?.assistantActive === true ||
                    hasMessages;

                if (!shouldRestore) return false;

                this._restoringChatState = true;
                this.chatSessionId = saved.chatSessionId || `website-${Date.now()}`;
                this.dockedModeAnchorRect = saved.dockedModeAnchorRect || null;
                this.assistantActive = true;
                this.chatMode = 'minimized';
                this.messages = this.rehydrateStoredMessages(saved.messages || []);
                this._restoringChatState = false;
                this.normalizeWidgetChatState();
                this.persistChatState();
                return true;
            } catch (err) {
                this._restoringChatState = false;
                console.warn('Could not restore chat session:', err);
                sessionStorage.removeItem(CHAT_STORAGE_KEY);
                return false;
            }
        },

        activateDefaultMinimizedWidget() {
            this.assistantActive = true;
            this.chatMode = 'minimized';
            this.persistChatState();
        },

        normalizeWidgetChatState() {
            if (this.chatMode === 'normal') {
                this.chatMode = 'minimized';
            }
        },

        updateViewportMode() {
            this.isMobile = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;
            this.$nextTick(this.settleFunctionalOrb);
        },

        bindOrbResizeHandler() {
            this.unbindOrbResizeHandler();

            this._onOrbViewportChange = () => {
                if (this.orbPinActive || this.isDockAnimating) return;

                if (this._orbResizeRaf) {
                    window.cancelAnimationFrame(this._orbResizeRaf);
                }

                this._orbResizeRaf = window.requestAnimationFrame(() => {
                    this._orbResizeRaf = null;
                    this.settleFunctionalOrb();
                });
            };

            window.addEventListener('resize', this._onOrbViewportChange, { passive: true });
            window.visualViewport?.addEventListener('resize', this._onOrbViewportChange);
        },

        unbindOrbResizeHandler() {
            if (this._orbResizeRaf) {
                window.cancelAnimationFrame(this._orbResizeRaf);
                this._orbResizeRaf = null;
            }

            if (this._onOrbViewportChange) {
                window.removeEventListener('resize', this._onOrbViewportChange);
                window.visualViewport?.removeEventListener('resize', this._onOrbViewportChange);
                this._onOrbViewportChange = null;
            }
        },

        minimizeChat() {
            if (!this.assistantActive || this.isMinimized || this.isDockAnimating) return;

            const el = this.$refs.heroInteraction;
            if (!el) return;

            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (prefersReducedMotion) {
                this.clearFlipPin(el);
                this.clearOrbPin(this.getFunctionalOrbEl());
                this.chatMode = 'minimized';
                this.dockPhase = null;
                this.isDockAnimating = false;
                this.persistChatState();
                this.$nextTick(this.settleFunctionalOrb);
                return;
            }

            this.runMinimizeSequence(el);
        },

        async clearConversation() {
            if (!this.hasConversation || this.thinking || this.isDockAnimating) return;

            const confirmed = await this.$confirm({
                title: 'Delete Chat',
                message: 'Are you sure you want to delete this chat?',
                detail: 'Your messages will be cleared. This action cannot be undone.',
                confirmLabel: 'Delete Chat',
                variant: 'danger',
            });

            if (!confirmed) {
                return;
            }

            this.messages = [];
            this.draft = '';
            this.chatSessionId = `website-${Date.now()}`;

            if (!this.isMinimized) {
                this.clearFlipPin(this.$refs.heroInteraction);
                this.clearOrbPin(this.getFunctionalOrbEl());
                this.chatMode = 'minimized';
                this.dockPhase = null;
                this.isDockAnimating = false;
            }

            this.persistChatState();
            this.scheduleGuideNudge();
        },

        restoreFromMinimize() {
            if (!this.isMinimized || this.isDockAnimating) return;

            const el = this.$refs.heroInteraction;
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (prefersReducedMotion || !el) {
                this.chatMode = 'docked';
                this.persistChatState();
                this.$nextTick(() => {
                    this.resizeChatInput();
                    this.scrollChatToBottom();
                    this.$refs.chatInput?.focus();
                });
                return;
            }

            this.runRestoreFromMinimizeSequence(el);
        },

        clearReplyTimers() {
            // no-op kept for call-site compatibility
        },

        getChatPageUrl() {
            if (typeof window === 'undefined') return '';
            return window.location.href || '';
        },

        async requestAssistantReply(message) {
            this.thinking = true;
            this.verificationError = '';
            this.scrollChatToBottom();

            try {
                const res = await this.$api.post('/ai/reply', {
                    message,
                    source: 'website',
                    senderId: this.chatSessionId,
                    pageUrl: this.getChatPageUrl(),
                });
                this.pushAssistantMessage(res.data);
            } catch (err) {
                console.error('AI reply failed:', err);
                this.pushAssistantMessage({ reply: AI_REPLY_ERROR });
            } finally {
                this.thinking = false;
                this.scrollChatToBottom();
                this.$nextTick(() => {
                    this.$refs.chatInput?.focus();
                    this.resizeChatInput();
                });
            }
        },

        pushAssistantMessage(data) {
            if (typeof data.otpVerificationEnabled === 'boolean') {
                this.otpVerificationEnabled = data.otpVerificationEnabled;
            }

            this.messages.push({
                role: 'assistant',
                content: data.reply,
                verification: this.normalizeAssistantVerification(data),
            });
        },

        messageHasActiveVerification(verification) {
            if (!verification) return false;

            return Boolean(
                verification.showConsentActions
                || verification.showContactForm
                || verification.showOtpForm,
            );
        },

        inferVerificationFromContent(content) {
            if (!this.otpVerificationEnabled) {
                return null;
            }

            const reply = String(content || '');

            if (reply.includes('Under our data privacy policy') && /\bAgree\b/i.test(reply)) {
                return {
                    status: 'consent_pending',
                    showConsentActions: true,
                    showContactForm: false,
                    showOtpForm: false,
                };
            }

            if (reply.includes('free AI chat limit') && /\bAgree\b/i.test(reply)) {
                return {
                    status: 'consent_pending',
                    topic: 'chat_quota',
                    showConsentActions: true,
                    showContactForm: false,
                    showOtpForm: false,
                };
            }

            if (
                reply.includes('Please provide your mobile number so we can send you a one-time password')
                || reply.includes('Please provide your email address so we can send you a one-time password')
            ) {
                return {
                    status: 'contact_pending',
                    showConsentActions: false,
                    showContactForm: true,
                    showOtpForm: false,
                };
            }

            if (
                reply.includes('Please enter the 6-digit code')
                || reply.includes('development code shown below')
                || reply.includes('OTP could not be texted')
                || reply.includes('OTP could not be emailed')
            ) {
                return {
                    status: 'otp_pending',
                    showConsentActions: false,
                    showContactForm: false,
                    showOtpForm: true,
                };
            }

            return null;
        },

        normalizeAssistantVerification(data) {
            if (typeof data.otpVerificationEnabled === 'boolean') {
                this.otpVerificationEnabled = data.otpVerificationEnabled;
            }

            if (!this.otpVerificationEnabled) {
                return null;
            }

            if (data.verificationRequired || data.verification) {
                const verification = {
                    status: 'consent_pending',
                    showConsentActions: false,
                    showContactForm: false,
                    showOtpForm: false,
                    ...(data.verification || {}),
                };

                if (
                    data.verificationRequired
                    && !verification.showContactForm
                    && !verification.showOtpForm
                    && !verification.showConsentActions
                ) {
                    verification.showConsentActions = true;
                }

                return verification;
            }

            return this.inferVerificationFromContent(data.reply);
        },

        getMessageVerification(message) {
            if (!this.otpVerificationEnabled) {
                return null;
            }

            if (message?.verification?.dismissed) {
                return null;
            }

            if (message?.verification && this.messageHasActiveVerification(message.verification)) {
                return message.verification;
            }

            return this.inferVerificationFromContent(message.content);
        },

        rehydrateStoredMessages(messages = []) {
            return messages.map((message) => {
                if (message.role !== 'assistant') return message;

                if (!this.otpVerificationEnabled) {
                    return { ...message, verification: null };
                }

                if (message.verification?.dismissed) {
                    return message;
                }

                if (message.verification && !this.messageHasActiveVerification(message.verification)) {
                    return {
                        ...message,
                        verification: {
                            ...message.verification,
                            dismissed: true,
                        },
                    };
                }

                const verification = this.inferVerificationFromContent(message.content);
                if (!verification) {
                    return { ...message, verification: null };
                }

                return { ...message, verification };
            });
        },

        isActiveVerificationMessage(index) {
            for (let i = this.messages.length - 1; i >= 0; i -= 1) {
                const message = this.messages[i];
                if (message.role !== 'assistant') continue;

                const verification = this.getMessageVerification(message);
                if (!verification || !this.messageHasActiveVerification(verification)) continue;

                return i === index;
            }

            return false;
        },

        showVerificationConsent(index) {
            const message = this.messages[index];
            if (!message || message.role !== 'assistant') return false;

            const verification = this.getMessageVerification(message);
            return Boolean(verification?.showConsentActions && this.isActiveVerificationMessage(index));
        },

        showVerificationContact(index) {
            const message = this.messages[index];
            if (!message || message.role !== 'assistant') return false;

            const verification = this.getMessageVerification(message);
            return Boolean(verification?.showContactForm && this.isActiveVerificationMessage(index));
        },

        showVerificationOtp(index) {
            const message = this.messages[index];
            if (!message || message.role !== 'assistant') return false;

            const verification = this.getMessageVerification(message);
            return Boolean(verification?.showOtpForm && this.isActiveVerificationMessage(index));
        },

        getVerificationDevOtp(index) {
            const message = this.messages[index];
            if (!message) return '';

            return this.getMessageVerification(message)?.devOtpCode || '';
        },

        clearVerificationActions(index) {
            const message = this.messages[index];
            if (!message) return;

            message.verification = {
                ...(message.verification || {}),
                showConsentActions: false,
                showContactForm: false,
                showOtpForm: false,
                dismissed: true,
            };
        },

        async onVerificationConsent(agreed, index) {
            this.thinking = true;
            this.verificationError = '';
            this.clearVerificationActions(index);

            try {
                const endpoint = agreed ? '/ai/verification/consent' : '/ai/verification/cancel';
                const res = await this.$api.post(endpoint, {
                    senderId: this.chatSessionId,
                    source: 'website',
                    agreed,
                });
                this.pushAssistantMessage(res.data);
            } catch (err) {
                console.error('Verification consent failed:', err);
                this.pushAssistantMessage({ reply: AI_REPLY_ERROR });
            } finally {
                this.thinking = false;
                this.scrollChatToBottom();
            }
        },

        async onVerificationContact(index) {
            const contact = this.verificationContact.trim();
            if (!contact) return;

            this.thinking = true;
            this.verificationError = '';
            this.clearVerificationActions(index);

            try {
                const res = await this.$api.post('/ai/verification/contact', {
                    senderId: this.chatSessionId,
                    source: 'website',
                    contact,
                    pageUrl: this.getChatPageUrl(),
                });
                this.verificationContact = '';
                this.pushAssistantMessage(res.data);
            } catch (err) {
                console.error('Verification contact failed:', err);
                this.verificationError = err.response?.data?.error || AI_REPLY_ERROR;
                this.pushAssistantMessage({
                    reply: this.verificationError,
                });
            } finally {
                this.thinking = false;
                this.scrollChatToBottom();
            }
        },

        async onVerificationOtp(index) {
            const code = this.verificationOtp.trim();
            if (code.length < 6) return;

            this.thinking = true;
            this.verificationError = '';
            this.clearVerificationActions(index);

            try {
                const res = await this.$api.post('/ai/verification/verify-otp', {
                    senderId: this.chatSessionId,
                    source: 'website',
                    code,
                    pageUrl: this.getChatPageUrl(),
                });
                this.verificationOtp = '';
                this.pushAssistantMessage(res.data);
            } catch (err) {
                console.error('Verification OTP failed:', err);
                this.verificationError = err.response?.data?.error || 'OTP verification failed.';
                const message = this.messages[index];
                if (message?.verification) {
                    message.verification = {
                        ...message.verification,
                        showOtpForm: true,
                    };
                }
            } finally {
                this.thinking = false;
                this.scrollChatToBottom();
            }
        },

        resizeChatInput() {
            const el = this.$refs.chatInput;
            if (!el) return;

            el.style.removeProperty('height');
            el.style.removeProperty('overflow-y');
        },

        handleSiteChatInterest(event) {
            const message = String(event.detail?.message || '').trim();
            if (!message) return;
            this.submitBackgroundInterest(message);
        },

        handleSiteChatMessage(event) {
            const message = String(event.detail?.message || '').trim();
            if (!message || this.thinking) return;

            this.draft = message;
            this.onSubmit();
        },

        submitBackgroundInterest(message) {
            const text = String(message || '').trim();
            if (!text || this.thinking) return;

            this.registerAiGuideActivity();

            const wasMinimized = this.isMinimized;
            const isEnteringChat = !this.assistantActive;

            if (isEnteringChat) {
                this.assistantActive = true;
            }

            this.draft = '';
            this.clearReplyTimers();

            if (isEnteringChat || wasMinimized) {
                this.openInterestChatImmediate();
                this.requestAssistantReply(text);
                this.persistChatState();
                this.$nextTick(() => {
                    this.resizeChatInput();
                    this.scrollChatToBottom();
                    this.$refs.chatInput?.focus({ preventScroll: true });
                });
                return;
            }

            this.requestAssistantReply(text);
            this.persistChatState();
        },

        openInterestChatImmediate() {
            this.chatMode = 'docked';
            this.dockPhase = null;
            this.isDockAnimating = false;
            this.clearFlipPin(this.$refs.heroInteraction);
            this.$nextTick(this.settleFunctionalOrb);
        },

        onSubmit() {
            const text = this.draft.trim();
            if (!text || this.thinking) return;

            this.registerAiGuideActivity();

            const wasMinimized = this.isMinimized;
            if (!this.assistantActive) {
                this.assistantActive = true;
            }

            this.messages.push({ role: 'user', content: text });
            this.draft = '';
            this.scrollChatToBottom();
            this.$nextTick(this.resizeChatInput);
            this.clearReplyTimers();

            if (wasMinimized || this.chatMode !== 'docked') {
                this.chatMode = 'docked';
                this.clearFlipPin(this.$refs.heroInteraction);
                this.requestAssistantReply(text);
                this.persistChatState();
                this.$nextTick(() => {
                    this.resizeChatInput();
                    this.scrollChatToBottom();
                    this.$refs.chatInput?.focus();
                    this.settleFunctionalOrb();
                });
                return;
            }

            this.requestAssistantReply(text);
            this.persistChatState();
        },

        scrollChatToBottom() {
            this.$nextTick(() => {
                const el = this.$refs.chatTranscript;
                if (el) {
                    el.scrollTop = el.scrollHeight;
                }
            });
        },

        async runMinimizeSequence(el) {
            const panelFirst = el.getBoundingClientRect();
            this.saveDockedModeAnchorRect(panelFirst);

            const panelLast = this.getMinimizedOrbTargetRect();
            const orbLast = panelLast;
            const orbFirst = this.measureHeaderOrbRect();

            this.isDockAnimating = true;
            this.dockPhase = 'to-minimized';

            this.applyFlipPin(el, panelFirst, { clip: true });

            await this.$nextTick();
            this.flushLayout(el);

            const orbEl = this.getFunctionalOrbEl();
            if (!orbEl) {
                this.prepareTransitionChatScale(panelFirst);
                await this.runPanelFlipAnimation(el, panelFirst, panelLast);
                this.finishMinimizeAnimation(el);
                return;
            }

            this.prepareTransitionChatScale(panelFirst);
            this.pinOrbForAnim(orbEl, orbFirst);

            this.orbPinActive = true;
            await this.runLinkedDockAnimation(
                el,
                orbEl,
                panelFirst,
                panelLast,
                orbFirst,
                orbLast
            );
            this.orbPinActive = false;

            this.finishMinimizeAnimation(el);
        },

        async runRestoreFromMinimizeSequence(el) {
            await this.runRestoreToDockedSequence(el);
        },

        async runRestoreToDockedSequence(el) {
            const triggerRect = this.copyRect(
                this.$refs.minimizedTrigger?.getBoundingClientRect() ||
                    this.getMinimizedOrbTargetRect()
            );
            const panelFirst = triggerRect;
            const orbFirst = triggerRect;

            const orbEl = await this.mountFunctionalOrbForAnim(orbFirst);

            this.applyFlipPin(el, panelFirst, { clip: true });
            el.style.visibility = 'hidden';

            this.dockPhase = 'from-minimized';
            this.restoreTargetMode = 'docked';
            // Enable --docking hide styles before layout measure / mode switch paints.
            this.isDockAnimating = true;
            this.chatMode = 'docked';

            await this.$nextTick();
            this.flushLayout(el);
            await this.waitForHeroChat();

            this.resizeChatInput();
            const panelLast = this.resolveExpandDockedPanelTargetRect(el);
            const orbLast = this.getDockedOrbTargetFromPanelRect(panelLast);

            this.applyFlipPin(el, panelFirst, { clip: true });
            el.style.visibility = 'hidden';
            this.flushLayout(el);

            if (!orbEl) {
                this.seedExpandChatScale(panelLast, panelFirst);
                await this.runPanelFlipAnimation(el, panelFirst, panelLast);
                this.finishRestoreFromMinimizeAnimation(el, 'docked');
                return;
            }

            await this.runLinkedDockAnimation(
                el,
                orbEl,
                panelFirst,
                panelLast,
                orbFirst,
                orbLast,
                { seedExpand: true }
            );
            this.orbPinActive = false;

            this.finishRestoreFromMinimizeAnimation(el, 'docked');
        },

        runPanelFlipAnimation(el, panelFirst, panelLast) {
            this.applyFlipPin(el, panelFirst);

            if (el.style.visibility === 'hidden') {
                el.style.visibility = '';
            }

            const isMinimize = this.dockPhase === 'to-minimized';
            const isExpand = this.dockPhase === 'from-minimized';

            return new Promise((resolve) => {
                if (typeof el.animate !== 'function') {
                    if (isMinimize || isExpand) {
                        this.clearTransitionChatScale();
                    }
                    resolve();
                    return;
                }

                const animation = el.animate(
                    [
                        {
                            top: `${panelFirst.top}px`,
                            left: `${panelFirst.left}px`,
                            width: `${panelFirst.width}px`,
                            height: `${panelFirst.height}px`,
                        },
                        {
                            top: `${panelLast.top}px`,
                            left: `${panelLast.left}px`,
                            width: `${panelLast.width}px`,
                            height: `${panelLast.height}px`,
                        },
                    ],
                    {
                        duration: DOCK_FLIP_MS,
                        easing: DOCK_FLIP_EASING,
                        fill: 'forwards',
                    }
                );

                let rafId = null;
                let finished = false;

                const finish = () => {
                    if (finished) return;
                    finished = true;

                    if (rafId) {
                        window.cancelAnimationFrame(rafId);
                        rafId = null;
                    }

                    animation.onfinish = null;

                    if (isMinimize || isExpand) {
                        const direction = isMinimize ? 'minimize' : 'expand';
                        const anchor = isMinimize ? panelFirst : panelLast;
                        this.updateTransitionChatScale(anchor, panelLast, 1, direction);
                        this.clearTransitionChatScale();
                    }

                    if (typeof animation.commitStyles === 'function') {
                        animation.commitStyles();
                    }

                    animation.cancel();

                    resolve();
                };

                const tick = () => {
                    if (finished) return;

                    const progress = this.getAnimProgress(animation, DOCK_FLIP_MS);

                    if (isMinimize) {
                        this.updateTransitionChatScale(
                            panelFirst,
                            this.lerpRect(panelFirst, panelLast, progress),
                            progress,
                            'minimize'
                        );
                    } else if (isExpand) {
                        this.updateTransitionChatScale(
                            panelLast,
                            this.lerpRect(panelFirst, panelLast, progress),
                            progress,
                            'expand'
                        );
                    }

                    if (animation.playState === 'finished' || progress >= 1) {
                        finish();
                        return;
                    }

                    rafId = window.requestAnimationFrame(tick);
                };

                animation.onfinish = finish;
                window.setTimeout(finish, DOCK_FLIP_MS + 120);

                if (isMinimize || isExpand) {
                    animation.ready
                        .then(() => {
                            rafId = window.requestAnimationFrame(tick);
                        })
                        .catch(() => {
                            rafId = window.requestAnimationFrame(tick);
                        });
                }
            });
        },

        finishMinimizeAnimation(el) {
            this.chatMode = 'minimized';
            this.isDockAnimating = false;
            this.dockPhase = null;
            this.commitMinimizedOrbPosition();
            this.orbPinActive = false;
            this.clearTransitionChatScale();
            this.clearFlipPin(el);
            this.persistChatState();

            this.$nextTick(() => {
                this.clearFlipPin(el);
                this.settleFunctionalOrb();
            });
        },

        finishRestoreFromMinimizeAnimation(el, targetMode) {
            this.clearTransitionChatScale();
            this.chatMode = targetMode === 'docked' ? 'docked' : 'docked';
            this.isDockAnimating = false;
            this.dockPhase = null;
            this.restoreTargetMode = null;
            this.orbPinActive = false;
            this.persistChatState();
            this.resizeChatInput();
            this.clearFlipPin(el);

            this.$nextTick(async () => {
                await this.waitForPaint();
                this.saveDockedModeAnchorRect(el.getBoundingClientRect());
                this.persistChatState();
                this.settleFunctionalOrb();
                this.scrollChatToBottom();
                this.$refs.chatInput?.focus();
            });
        },

        getMinimizedOrbSizePx() {
            return this.isMobile ? 64 : 72;
        },

        getWidgetCornerInsetPx(edge = 'bottom') {
            const el = this.$refs.widgetRoot || document.documentElement;
            const prop = edge === 'right'
                ? '--hero-widget-corner-inset-right'
                : '--hero-widget-corner-inset-bottom';
            const fallback = edge === 'right'
                ? (this.isMobile ? 12 : 20)
                : (this.isMobile ? 6 : 12);

            return this.readResolvedCssLengthPx(el, prop) || fallback;
        },

        getMinimizedOrbTargetRect() {
            const size = this.getMinimizedOrbSizePx();
            const bottomInset = this.getWidgetCornerInsetPx('bottom');
            const rightInset = this.getWidgetCornerInsetPx('right');

            return {
                top: window.innerHeight - bottomInset - size,
                left: window.innerWidth - rightInset - size,
                width: size,
                height: size,
            };
        },

        waitForPaint() {
            return new Promise((resolve) => {
                window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
            });
        },

        flushLayout(el) {
            // Sync layout flush — cheaper than waiting two animation frames.
            if (el) void el.offsetWidth;
        },

        async waitForHeroChat() {
            for (let attempt = 0; attempt < 12; attempt += 1) {
                if (this.$refs.heroChat) return;
                await this.$nextTick();
            }
        },

        getAnimProgress(anim, duration) {
            const timing = anim.effect?.getComputedTiming?.();

            if (timing && Number.isFinite(timing.progress)) {
                return Math.min(1, Math.max(0, timing.progress));
            }

            const currentTime = typeof anim.currentTime === 'number' ? anim.currentTime : 0;
            return Math.min(1, Math.max(0, currentTime / duration));
        },

        lerpRect(from, to, progress) {
            const t = Math.min(1, Math.max(0, progress));

            return {
                top: from.top + (to.top - from.top) * t,
                left: from.left + (to.left - from.left) * t,
                width: from.width + (to.width - from.width) * t,
                height: from.height + (to.height - from.height) * t,
            };
        },

        measureHeaderOrbRect() {
            const headerOrb = this.$refs.headerOrb;
            if (headerOrb) {
                return headerOrb.getBoundingClientRect();
            }

            const chatRect = this.getPanelAttachmentRect(this.$refs.heroInteraction);
            return this.getDockedOrbTargetFromPanelRect(chatRect);
        },

        getFunctionalOrbEl() {
            return this.$refs.functionalOrb;
        },

        async mountFunctionalOrbForAnim(orbFirst) {
            let orbEl = this.getFunctionalOrbEl();
            if (!orbEl) {
                await this.$nextTick();
                orbEl = this.getFunctionalOrbEl();
            }

            if (orbEl) {
                this.pinOrbForAnim(orbEl, orbFirst);
                void orbEl.offsetWidth;
                this.orbPinActive = true;
            }

            return orbEl;
        },

        commitMinimizedOrbPosition() {
            const orbEl = this.getFunctionalOrbEl();
            if (!orbEl) return;

            this.pinOrb(orbEl, this.copyRect(this.getMinimizedOrbTargetRect()));
        },

        commitDockedOrbPosition(panelRect) {
            const orbEl = this.getFunctionalOrbEl();
            if (!orbEl) return;

            const rect = panelRect
                ? this.getDockedOrbTargetFromPanelRect(panelRect)
                : this.measureHeaderOrbRect();
            this.pinOrb(orbEl, this.copyRect(rect));
        },

        getFunctionalOrbAnchorEl() {
            if (this.isMinimized && !this.isDockAnimating) {
                return this.$refs.minimizedOrbAnchor || this.$refs.minimizedTrigger;
            }

            if (this.isDocked && !this.isDockAnimating) {
                return this.$refs.headerOrb;
            }

            return null;
        },

        settleFunctionalOrb() {
            if (this.orbPinActive || this.isDockAnimating) return;

            const orbEl = this.getFunctionalOrbEl();
            if (!orbEl || !this.showFunctionalOrb) {
                this.clearOrbPin(orbEl);
                return;
            }

            const anchorEl = this.getFunctionalOrbAnchorEl();
            if (!anchorEl) {
                this.clearOrbPin(orbEl);
                return;
            }

            const rect = anchorEl.getBoundingClientRect();
            if (!rect.width || !rect.height) {
                this.clearOrbPin(orbEl);
                return;
            }

            this.pinOrb(orbEl, rect);
        },

        getPanelAttachmentRect(panelEl) {
            const chatEl = this.$refs.heroChat;
            return chatEl ? chatEl.getBoundingClientRect() : panelEl.getBoundingClientRect();
        },

        async runLinkedDockAnimation(
            panelEl,
            orbEl,
            panelFirst,
            panelLast,
            orbFirst,
            orbLast,
            { seedExpand = false } = {}
        ) {
            this.applyFlipPin(panelEl, panelFirst);
            this.pinOrbForAnim(orbEl, orbFirst);

            if (seedExpand) {
                await this.waitForHeroChat();
                this.seedExpandChatScale(panelLast, panelFirst);
                this.flushLayout(panelEl);
            }

            if (panelEl.style.visibility === 'hidden') {
                panelEl.style.visibility = '';
            }

            return new Promise((resolve) => {
                if (typeof panelEl.animate !== 'function') {
                    this.clearOrbPin(orbEl);
                    this.clearFlipPin(panelEl);
                    resolve();
                    return;
                }

                const panelAnim = panelEl.animate(
                    [
                        {
                            top: `${panelFirst.top}px`,
                            left: `${panelFirst.left}px`,
                            width: `${panelFirst.width}px`,
                            height: `${panelFirst.height}px`,
                        },
                        {
                            top: `${panelLast.top}px`,
                            left: `${panelLast.left}px`,
                            width: `${panelLast.width}px`,
                            height: `${panelLast.height}px`,
                        },
                    ],
                    {
                        duration: DOCK_FLIP_MS,
                        easing: DOCK_FLIP_EASING,
                        fill: 'forwards',
                    }
                );

                let rafId = null;
                let finished = false;
                let frame = 0;

                const finish = () => {
                    if (finished) return;
                    finished = true;

                    if (rafId) {
                        window.cancelAnimationFrame(rafId);
                        rafId = null;
                    }

                    panelAnim.onfinish = null;
                    this.updateOrbTransform(orbEl, orbFirst, orbLast);

                    if (this.dockPhase === 'to-minimized') {
                        this.updateTransitionChatScale(panelFirst, panelLast, 1, 'minimize');
                        this.clearTransitionChatScale();
                    } else if (this.dockPhase === 'from-minimized') {
                        this.updateTransitionChatScale(panelLast, panelLast, 1, 'expand');
                        this.clearTransitionChatScale();
                    }

                    if (typeof panelAnim.commitStyles === 'function') {
                        panelAnim.commitStyles();
                    }

                    panelAnim.cancel();

                    resolve();
                };

                const tick = () => {
                    if (finished) return;

                    frame += 1;
                    const progress = this.getAnimProgress(panelAnim, DOCK_FLIP_MS);
                    const rect = this.lerpRect(orbFirst, orbLast, progress);

                    this.updateOrbTransform(orbEl, orbFirst, rect);

                    if (this.dockPhase === 'to-minimized' && this.isMinimizingToCorner) {
                        this.updateTransitionChatScale(
                            panelFirst,
                            this.lerpRect(panelFirst, panelLast, progress),
                            progress,
                            'minimize'
                        );
                    } else if (this.dockPhase === 'from-minimized') {
                        this.updateTransitionChatScale(
                            panelLast,
                            this.lerpRect(panelFirst, panelLast, progress),
                            progress,
                            'expand'
                        );
                    }

                    const currentTime =
                        typeof panelAnim.currentTime === 'number' ? panelAnim.currentTime : 0;
                    const animStarted = frame > 1 || currentTime > 0;

                    if (animStarted && (panelAnim.playState === 'finished' || progress >= 1)) {
                        finish();
                        return;
                    }

                    rafId = window.requestAnimationFrame(tick);
                };

                panelAnim.onfinish = finish;
                window.setTimeout(finish, DOCK_FLIP_MS + 120);
                panelAnim.ready
                    .then(() => {
                        rafId = window.requestAnimationFrame(tick);
                    })
                    .catch(() => {
                        rafId = window.requestAnimationFrame(tick);
                    });
            });
        },
        seedExpandChatScale(panelLast, panelFirst) {
            const hideUntilExpand =
                this.dockPhase === 'from-minimized' && this.restoreTargetMode === 'docked';
            this.prepareTransitionChatScale(panelLast, { initialOpacity: hideUntilExpand ? '0' : '1' });
            this.updateTransitionChatScale(panelLast, panelFirst, 0, 'expand');
        },

        getChatTuckMultiplier(progress, direction) {
            const tuck =
                direction === 'minimize'
                    ? Math.min(
                          1,
                          Math.max(
                              0,
                              (progress - MINIMIZE_CHAT_TUCK_START) / (1 - MINIMIZE_CHAT_TUCK_START)
                          )
                      )
                    : Math.min(
                          1,
                          Math.max(
                              0,
                              (1 - progress - MINIMIZE_CHAT_TUCK_START) /
                                  (1 - MINIMIZE_CHAT_TUCK_START)
                          )
                      );

            const eased = tuck * tuck * (3 - 2 * tuck);
            return 1 - eased;
        },

        prepareTransitionChatScale(anchorSize, { initialOpacity = '1' } = {}) {
            const chat = this.$refs.heroChat;
            if (!chat || !anchorSize?.width || !anchorSize?.height) return;

            chat.style.width = `${anchorSize.width}px`;
            chat.style.height = `${anchorSize.height}px`;
            chat.style.transformOrigin = 'top left';
            chat.style.willChange = 'transform, opacity';
            chat.style.transform = 'scale(1)';
            chat.style.opacity = initialOpacity;
        },
        updateTransitionChatScale(anchorSize, panelRect, progress = 1, direction = 'minimize') {
            const chat = this.$refs.heroChat;
            if (!chat || !anchorSize?.width || !anchorSize?.height) return;

            const baseScaleX = panelRect.width / anchorSize.width;
            const baseScaleY = panelRect.height / anchorSize.height;

            if (direction === 'expand') {
                chat.style.transform = `scale(${baseScaleX}, ${baseScaleY})`;
                if (this.dockPhase === 'from-minimized' && this.restoreTargetMode === 'docked') {
                    chat.style.opacity = progress > 0 ? '1' : '0';
                } else {
                    chat.style.opacity = '1';
                }
                return;
            }

            const behindOrb = this.getChatTuckMultiplier(progress, direction);

            chat.style.transform = `scale(${baseScaleX * behindOrb}, ${baseScaleY * behindOrb})`;
            chat.style.opacity = String(Math.min(1, Math.max(0, behindOrb)));
        },

        clearTransitionChatScale() {
            const chat = this.$refs.heroChat;
            if (!chat) return;

            ['width', 'height', 'transform', 'transform-origin', 'will-change', 'opacity'].forEach(
                (prop) => chat.style.removeProperty(prop)
            );

            const input = this.$refs.chatInput;
            if (input) {
                input.style.removeProperty('height');
                input.style.removeProperty('overflow-y');
            }
        },

        getDockedOrbTargetFromPanelRect(panelRect) {
            const size = 36;
            const headerPadTop = 10;
            const headerPadLeft = 12;

            return {
                top: panelRect.top + headerPadTop,
                left: panelRect.left + headerPadLeft,
                width: size,
                height: size,
            };
        },

        pinOrbForAnim(el, rect) {
            const box = this.copyRect(rect);
            Object.assign(el.style, {
                position: 'fixed',
                top: `${box.top}px`,
                left: `${box.left}px`,
                width: `${box.width}px`,
                height: `${box.height}px`,
                margin: '0',
                zIndex: '10001',
                pointerEvents: 'none',
                transformOrigin: 'top left',
                transform: 'translate3d(0, 0, 0) scale(1)',
                willChange: 'transform',
            });

            const aiOrb = el.querySelector('.ai-orb');
            if (aiOrb) {
                aiOrb.style.setProperty('--orb-size', `${box.width}px`);
            }
        },

        updateOrbTransform(el, orbFirst, targetRect) {
            const dx = targetRect.left - orbFirst.left;
            const dy = targetRect.top - orbFirst.top;
            const sx = targetRect.width / orbFirst.width;
            const sy = targetRect.height / orbFirst.height;

            el.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`;
        },

        pinOrb(el, rect) {
            this.pinOrbForAnim(el, rect);
            el.style.transform = 'translate3d(0, 0, 0) scale(1)';
        },

        clearOrbPin(el) {
            if (!el) return;

            el.querySelector('.ai-orb')?.style.removeProperty('--orb-size');

            [
                'position',
                'top',
                'left',
                'width',
                'height',
                'margin',
                'z-index',
                'pointer-events',
                'transform',
                'transform-origin',
                'will-change',
            ].forEach((prop) => el.style.removeProperty(prop));
        },

        measureDockedRect(el) {
            this.clearFlipPin(el);
            return this.copyRect(el.getBoundingClientRect());
        },

        copyRect(rect) {
            return {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            };
        },

        applyFlipPin(el, rect, { clip = false } = {}) {
            const box = this.copyRect(rect);
            Object.assign(el.style, {
                position: 'fixed',
                top: `${box.top}px`,
                left: `${box.left}px`,
                width: `${box.width}px`,
                height: `${box.height}px`,
                maxWidth: 'none',
                margin: '0',
                bottom: 'auto',
                right: 'auto',
                zIndex: '10000',
                overflow: clip ? 'hidden' : '',
            });
        },
        saveDockedModeAnchorRect(rect) {
            if (!rect?.width || !rect?.height) return;

            this.dockedModeAnchorRect = {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            };
        },

        measureDockedLayoutRect(el) {
            if (!el) return null;

            const saved = {
                visibility: el.style.visibility,
                position: el.style.position,
                top: el.style.top,
                left: el.style.left,
                width: el.style.width,
                height: el.style.height,
                maxWidth: el.style.maxWidth,
                margin: el.style.margin,
                bottom: el.style.bottom,
                right: el.style.right,
                overflow: el.style.overflow,
                zIndex: el.style.zIndex,
            };

            // Keep invisible across clearFlipPin — it strips visibility and would
            // otherwise flash the full docked panel (visible over open modals).
            el.style.visibility = 'hidden';
            this.clearFlipPin(el);
            el.style.visibility = 'hidden';
            el.style.height = 'auto';

            this.resizeChatInput();

            const rect = el.getBoundingClientRect();
            const measured = this.copyRect(rect);

            Object.assign(el.style, {
                position: saved.position,
                top: saved.top,
                left: saved.left,
                width: saved.width,
                height: saved.height,
                maxWidth: saved.maxWidth,
                margin: saved.margin,
                bottom: saved.bottom,
                right: saved.right,
                overflow: saved.overflow,
                zIndex: saved.zIndex,
                // Caller controls when to show; never restore a visible frame here.
                visibility: 'hidden',
            });
            if (!saved.height) {
                el.style.removeProperty('height');
            }

            if (measured.width > 120 && measured.height > 120) {
                this.saveDockedModeAnchorRect(measured);
                return measured;
            }

            return null;
        },

        readResolvedCssLengthPx(containerEl, customProperty) {
            const probe = document.createElement('div');
            probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:var(${customProperty})`;
            containerEl.appendChild(probe);
            const lengthPx = parseFloat(getComputedStyle(probe).width) || 0;
            containerEl.removeChild(probe);
            return lengthPx;
        },

        getHeroChatMessagesHeightPx(el) {
            const scope =
                el?.closest?.('.mrboss-chat-widget') ||
                document.documentElement;

            return this.readResolvedCssLengthPx(scope, '--hero-chat-messages-height') || 260;
        },

        resolveExpandDockedPanelTargetRect(el) {
            const anchor = this.dockedModeAnchorRect;

            if (anchor?.width > 120 && anchor?.height > 120) {
                return { ...anchor };
            }

            const measured = this.measureDockedLayoutRect(el);
            if (measured?.width > 120 && measured?.height > 120) {
                return measured;
            }

            const estimated = this.getEstimatedDockedPanelRect(el);
            if (measured?.height > 120) {
                return { ...estimated, height: measured.height };
            }

            return estimated;
        },

        getEstimatedDockedPanelRect(el) {
            const messagesHeight = this.getHeroChatMessagesHeightPx(el);
            const headerHeight = 56;
            const composerHeight = 68;
            const height = messagesHeight + headerHeight + composerHeight;
            const rightInset = this.getWidgetCornerInsetPx('right');
            const bottomInset = this.getWidgetCornerInsetPx('bottom');

            if (this.isMobile) {
                const width = window.innerWidth - rightInset * 2;
                return {
                    top: window.innerHeight - bottomInset - height,
                    left: rightInset,
                    width,
                    height,
                };
            }

            const width = Math.min(352, window.innerWidth - rightInset * 2);
            return {
                top: window.innerHeight - bottomInset - height,
                left: window.innerWidth - rightInset - width,
                width,
                height,
            };
        },

        clearFlipPin(el) {
            if (!el) return;

            [
                'position',
                'top',
                'left',
                'width',
                'height',
                'max-width',
                'margin',
                'bottom',
                'right',
                'z-index',
                'visibility',
                'pointer-events',
                'transform',
                'transform-origin',
                'transition',
                'overflow',
            ].forEach((prop) => el.style.removeProperty(prop));

            if (typeof el.getAnimations === 'function') {
                el.getAnimations().forEach((activeAnimation) => activeAnimation.cancel());
            }
        },

        finishDockToggle(nextMode) {
            this.persistChatState();

            this.$nextTick(() => {
                this.resizeChatInput();
                if (nextMode === 'docked') {
                    this.saveDockedModeAnchorRect(this.$refs.heroInteraction?.getBoundingClientRect());
                }
            });
        },
    },
};
</script>

<style lang="scss">
@use './MrBossAiChatWidget.scss';
</style>

