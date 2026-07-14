import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { confirm } from '@/utils/confirmDialog';

export default {
    install(app) {
        app.component('ConfirmDialog', ConfirmDialog);
        app.config.globalProperties.$confirm = confirm;
    },
};
