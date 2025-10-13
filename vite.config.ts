import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const normaliseBasePath = (value: string | undefined): string => {
    if (!value) {
        return '/';
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return '/';
    }

    if (trimmed === '/') {
        return '/';
    }

    return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const basePath = normaliseBasePath(env.VITE_BASE_PATH);

    return {
        base: basePath,
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            },
        },
    };
});
