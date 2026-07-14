import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import apiClient from './plugins/axios';
import mediaViewerPlugin from './plugins/mediaViewer';
import confirmDialogPlugin from './plugins/confirmDialog';
import '@tabler/core/dist/css/tabler.min.css';
import '@tabler/icons-webfont/dist/tabler-icons.min.css';
import '@/assets/styles/main.scss';
import faviconUrl from '@/assets/images/favicon.png';
import { updatePageMeta, getDefaultPageMeta } from '@/utils/seo';

const app = createApp(App);

app.config.globalProperties.$api = apiClient;
app.use(router);
app.use(mediaViewerPlugin);
app.use(confirmDialogPlugin);

const faviconLink = document.querySelector("link[rel*='icon']") || document.createElement('link');
faviconLink.type = 'image/png';
faviconLink.rel = 'icon';
faviconLink.href = faviconUrl;
document.head.appendChild(faviconLink);

updatePageMeta(getDefaultPageMeta());
console.log('VITE_API_URL =', import.meta.env.VITE_API_URL);
app.mount('#app');
