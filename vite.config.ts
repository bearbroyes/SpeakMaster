import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const openaiKey = env.VITE_OPENAI_API_KEY?.trim();

  return {
    base: '/SpeakMaster/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: openaiKey
        ? {
            '/api/openai': {
              target: 'https://api.openai.com',
              changeOrigin: true,
              rewrite: (p) => p.replace(/^\/api\/openai/, ''),
              headers: { Authorization: `Bearer ${openaiKey}` },
            },
          }
        : undefined,
    },
    test: {
      environment: 'node',
      globals: true,
    },
  };
});
