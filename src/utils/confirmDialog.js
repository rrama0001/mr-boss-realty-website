import mitt from 'mitt';

export const confirmDialogBus = mitt();

export const CONFIRM_DIALOG_EVENTS = {
    open: 'open',
};

/**
 * @param {object} options
 * @param {string} [options.title]
 * @param {string} [options.message]
 * @param {string} [options.detail]
 * @param {string} [options.confirmLabel]
 * @param {string} [options.cancelLabel]
 * @param {'primary'|'danger'} [options.variant]
 * @param {boolean} [options.closeOnBackdrop]
 * @returns {Promise<boolean>}
 */
export function confirm(options = {}) {
    return new Promise((resolve) => {
        confirmDialogBus.emit(CONFIRM_DIALOG_EVENTS.open, {
            title: options.title || 'Are you sure?',
            message: options.message || '',
            detail: options.detail || '',
            confirmLabel: options.confirmLabel || 'Yes, proceed',
            cancelLabel: options.cancelLabel || 'Cancel',
            variant: options.variant === 'danger' ? 'danger' : 'primary',
            closeOnBackdrop: options.closeOnBackdrop !== false,
            resolve,
        });
    });
}
