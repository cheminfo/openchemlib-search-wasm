import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Derived from the repository's first commit (2026-06-06): 6 + 06 + 06 = 60606, over 60000 so
// minus 50000. Never Vite's stock 5173 — two checkouts must not fight over the same port.
const port = Number(process.env.PORT ?? 10606);

// SharedArrayBuffer is only constructible in a cross-origin-isolated context, and the corpus, the
// offset table and every result buffer are shared. Without both headers `globalThis
// .crossOriginIsolated` is false and the app says so instead of failing on the constructor.
const isolation = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
};

export default defineConfig({
  plugins: [react()],
  server: { port, strictPort: true, headers: isolation },
  preview: { port, strictPort: true, headers: isolation },
  worker: { format: 'es' },
});
