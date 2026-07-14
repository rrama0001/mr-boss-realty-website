<template>
    <div class="modal d-block modal-backdrop-custom" tabindex="-1" @click.self="onBackdropClick">
        <div
            class="modal-dialog modal-dialog-scrollable"
            :class="dialogClasses"
            role="document"
        >
            <div class="modal-content">
                <slot />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ModalShell',
    props: {
        size: {
            type: String,
            default: 'lg',
            validator: (value) => ['sm', 'md', 'lg', 'xl', ''].includes(value),
        },
        fullscreenSmDown: {
            type: Boolean,
            default: true,
        },
        closeOnBackdrop: {
            type: Boolean,
            default: false,
        },
        dialogClass: {
            type: String,
            default: '',
        },
        fullscreen: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        dialogClasses() {
            return {
                'modal-sm': this.size === 'sm' && !this.fullscreen,
                'modal-lg': this.size === 'lg' && !this.fullscreen,
                'modal-xl': this.size === 'xl' && !this.fullscreen,
                'modal-fullscreen': this.fullscreen,
                'modal-fullscreen-sm-down': this.fullscreenSmDown && !this.fullscreen,
                'modal-dialog-centered': !this.fullscreen,
                [this.dialogClass]: Boolean(this.dialogClass),
            };
        },
    },
    methods: {
        onBackdropClick() {
            if (this.closeOnBackdrop) {
                this.$emit('backdrop-click');
            }
        },
    },
};
</script>
