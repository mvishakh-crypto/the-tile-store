import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },

    // ── Build Optimization ──────────────────────────────────────
    build: {
      // Warn when a chunk exceeds 1MB (down from default 500KB)
      chunkSizeWarningLimit: 1000,

      rollupOptions: {
        output: {
          /**
           * Manual chunk splitting — separates large vendor libraries into
           * their own cacheable bundles. This dramatically improves repeat
           * load times since cached chunks aren't re-downloaded on deploys.
           */
          manualChunks: (id: string) => {
            // React core — smallest, most stable, cached aggressively
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
            // Motion/Framer — large animation library
            if (id.includes('node_modules/motion/') || id.includes('node_modules/framer-motion/')) {
              return 'vendor-motion';
            }
            // Lucide icons — ~500KB uncompressed
            if (id.includes('node_modules/lucide-react/')) {
              return 'vendor-icons';
            }
            // Supabase client
            if (id.includes('node_modules/@supabase/')) {
              return 'vendor-supabase';
            }
            // TanStack Query
            if (id.includes('node_modules/@tanstack/')) {
              return 'vendor-query';
            }
            // Zod validation
            if (id.includes('node_modules/zod/')) {
              return 'vendor-zod';
            }
            // Google AI SDK
            if (id.includes('node_modules/@google/')) {
              return 'vendor-google-ai';
            }
            // All other node_modules → shared vendor chunk
            if (id.includes('node_modules/')) {
              return 'vendor-misc';
            }
          },
        },
      },

      // Enable source maps for production debugging (optional: remove for smaller builds)
      sourcemap: false,

      // Target modern browsers (reduces polyfill overhead)
      target: 'es2020',
    },

    // ── Dependency Pre-Bundling ────────────────────────────────
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'motion/react',
        'lucide-react',
        '@supabase/supabase-js',
        '@tanstack/react-query',
        'zod',
      ],
      // Force re-optimization when Supabase or Motion updates
      force: false,
    },
  };
});
