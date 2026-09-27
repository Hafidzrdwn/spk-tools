/// <reference types="vitest" />
import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    process.env.ANALYZE === 'true' &&
      (visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }) as PluginOption),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const norm = id.replace(/\\/g, '/');
          if (norm.includes('/node_modules/')) {
            if (norm.includes('/react/') || norm.includes('/react-dom/')) {
              return 'react-vendor';
            }
            if (norm.includes('/recharts/')) {
              return 'chart-vendor';
            }
            if (norm.includes('/@react-pdf/')) {
              return 'pdf-vendor';
            }
            if (norm.includes('/react-joyride/')) {
              return 'tour-vendor';
            }
            if (norm.includes('/framer-motion/')) {
              return 'motion-vendor';
            }
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
  },
});
