<template>
    <Teleport to="body">
        <div
            v-if="state"
            class="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            :aria-describedby="descriptionId"
            @click.self="onBackdropClick"
        >
            <div class="confirm-dialog__panel">
                <h3 :id="titleId" class="confirm-dialog__title">{{ state.title }}</h3>
                <p
                    v-if="state.message"
                    :id="descriptionId"
                    class="confirm-dialog__message"
                >
                    {{ state.message }}
                </p>
                <p v-if="state.detail" class="confirm-dialog__detail">{{ state.detail }}</p>
                <div class="confirm-dialog__actions">
                    <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="cancel"
                    >
                        {{ state.cancelLabel }}
                    </button>
                    <button
                        type="button"
                        class="btn"
                        :class="confirmButtonClass"
                        @click="confirm"
                    >
                        {{ state.confirmLabel }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script>
import { confirmDialogBus, CONFIRM_DIALOG_EVENTS } from '@/utils/confirmDialog';

let dialogInstanceId = 0;

export default {
    name: 'ConfirmDialog',
    data() {
        return {
            state: null,
            dialogId: 0,
        };
    },
    computed: {
        titleId() {
            return `confirm-dialog-title-${this.dialogId}`;
        },
        descriptionId() {
            return `confirm-dialog-description-${this.dialogId}`;
        },
        confirmButtonClass() {
            if (!this.state) return 'btn-primary';
            return this.state.variant === 'danger' ? 'btn-danger' : 'btn-primary';
        },
    },
    mounted() {
        confirmDialogBus.on(CONFIRM_DIALOG_EVENTS.open, this.onOpenRequest);
        document.addEventListener('keydown', this.handleEscape);
    },
    beforeUnmount() {
        confirmDialogBus.off(CONFIRM_DIALOG_EVENTS.open, this.onOpenRequest);
        document.removeEventListener('keydown', this.handleEscape);
        this.finish(false);
    },
    methods: {
        onOpenRequest(payload) {
            if (this.state?.resolve) {
                this.state.resolve(false);
            }

            dialogInstanceId += 1;
            this.dialogId = dialogInstanceId;
            this.state = payload;
            document.body.classList.add('confirm-dialog-open');
        },
        onBackdropClick() {
            if (!this.state?.closeOnBackdrop) {
                return;
            }

            this.cancel();
        },
        handleEscape(event) {
            if (event.key !== 'Escape' || !this.state) {
                return;
            }

            this.cancel();
        },
        confirm() {
            this.finish(true);
        },
        cancel() {
            this.finish(false);
        },
        finish(confirmed) {
            if (!this.state) {
                return;
            }

            const { resolve } = this.state;
            this.state = null;
            document.body.classList.remove('confirm-dialog-open');
            resolve(Boolean(confirmed));
        },
    },
};
</script>
