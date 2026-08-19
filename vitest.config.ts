import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // cast needed: vitest bundles its own vite, causing Plugin type mismatch with @vitejs/plugin-react
  plugins: [react() as never],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
