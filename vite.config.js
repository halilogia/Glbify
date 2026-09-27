import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const nodeBuiltinShim = fileURLToPath(new URL('./src/shims/node-builtins.js', import.meta.url));

export default defineConfig({
    base: './',
    define: {
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
    },
    resolve: {
        alias: {
            'node:fs': nodeBuiltinShim,
            'node:path': nodeBuiltinShim,
        },
    },
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/three[\\/]build[\\/]three\.(webgpu|tsl)/.test(id)) return 'three-webgpu';
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/@gltf-transform')) return 'gltf-transform';
          return null;
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['favicon.png', 'icons/*.png', 'draco/manifest.json'],
      manifest: {
        id: '/',
        name: 'Glbify - 3D Dönüştürücü',
        short_name: 'Glbify',
        description:
          'Tarayıcıda çalışan 3D model dönüştürücü: FBX, GLB/GLTF, OBJ, STL ve USDZ dönüştürme, görüntüleme ve DRACO sıkıştırma.',
        lang: 'tr',
        dir: 'ltr',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'any',
        background_color: '#121212',
        theme_color: '#22c55e',
        categories: ['graphics', 'productivity', 'utilities'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,wasm,json}'],
        globIgnores: [
          '**/node_modules/**',
          '**/workbox-*.js',
          '**/registerSW.js',
          '**/sw.js',
          '**/basis_encoder-*.wasm',
          '**/three-webgpu-*.js',
        ],
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/draco\//],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'wasm',
            handler: 'CacheFirst',
            options: {
              cacheName: 'glbify-wasm',
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 90 },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
