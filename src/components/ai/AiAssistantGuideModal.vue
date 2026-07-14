<template>
    <ModalShell
        v-if="open"
        size="lg"
        :close-on-backdrop="true"
        @backdrop-click="close"
    >
        <div class="modal-header ai-guide-modal__header">
            <div class="ai-guide-modal__header-main">
                <div class="ai-guide-modal__orb" aria-hidden="true">
                    <AiOrb :active="true" :thinking="false" />
                </div>
                <div class="ai-guide-modal__header-copy">
                    <span class="ai-guide-modal__eyebrow">{{ notice.eyebrow }}</span>
                    <h2 id="ai-guide-modal-title" class="modal-title ai-guide-modal__title">{{ notice.title }}</h2>
                </div>
            </div>
            <button type="button" class="btn-close ai-guide-modal__close" aria-label="Close" @click="close"></button>
        </div>
        <div class="modal-body ai-guide-modal__body">
            <p class="ai-guide-modal__lead">{{ notice.lead }}</p>

            <ul class="ai-guide-modal__points">
                <li v-for="point in notice.points" :key="point.title" class="ai-guide-modal__point">
                    <span class="ai-guide-modal__point-icon">
                        <i :class="point.icon" aria-hidden="true"></i>
                    </span>
                    <div>
                        <h3 class="ai-guide-modal__point-title">{{ point.title }}</h3>
                        <p class="ai-guide-modal__point-text">{{ point.text }}</p>
                    </div>
                </li>
            </ul>

            <p class="ai-guide-modal__disclaimer">
                <i class="ti ti-info-circle" aria-hidden="true"></i>
                {{ notice.disclaimer }}
            </p>
        </div>
        <div class="modal-footer ai-guide-modal__footer">
            <button type="button" class="btn btn-secondary" @click="close">Close</button>
            <button type="button" class="btn btn-primary ai-guide-modal__cta" @click="tryAssistant">
                {{ notice.ctaLabel }}
                <i class="ti ti-message-chatbot" aria-hidden="true"></i>
            </button>
        </div>
    </ModalShell>
</template>

<script>
import AiOrb from '@/components/ai/AiOrb.vue';
import ModalShell from '@/components/ModalShell.vue';
import { AI_ASSISTANT_NOTICE } from '@/config/homeContent';

export default {
    name: 'AiAssistantGuideModal',
    components: {
        AiOrb,
        ModalShell,
    },
    props: {
        open: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:open', 'try-assistant'],
    data() {
        return {
            notice: AI_ASSISTANT_NOTICE,
        };
    },
    methods: {
        close() {
            this.$emit('update:open', false);
        },
        tryAssistant() {
            this.$emit('try-assistant');
            this.close();
        },
    },
};
</script>
