import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const apiBase = env.VITE_API_URL || 'http://localhost:3000/api';
    const proxyTarget = apiBase.replace(/\/api\/?$/, '');

    return {
        base: '/',
        build: {
            outDir: 'dist',
            rollupOptions: {
                output: {
                    manualChunks: {
                        vue: ['vue', 'vue-router'],
                    },
                },
            },
        },
        plugins: [vue()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@components': path.resolve(__dirname, './src/components'),
                '@plugins': path.resolve(__dirname, './src/plugins'),
                '@styles': path.resolve(__dirname, './src/assets/styles'),
                '@assets': path.resolve(__dirname, './src/assets'),
                '@config': path.resolve(__dirname, './src/config'),
                '@views': path.resolve(__dirname, './src/views'),
                '@layouts': path.resolve(__dirname, './src/layouts'),
            },
        },
        optimizeDeps: {
            include: ['axios'],
        },
        server: {
            port: 5174,
            proxy: {
                '/api': {
                    target: proxyTarget,
                    changeOrigin: true,
                },
                '/uploads': {
                    target: proxyTarget,
                    changeOrigin: true,
                },
                '/robots.txt': {
                    target: proxyTarget,
                    changeOrigin: true,
                },
                '^/sitemap.*\\.xml$': {
                    target: proxyTarget,
                    changeOrigin: true,
                },
            },
        },
    };
});
