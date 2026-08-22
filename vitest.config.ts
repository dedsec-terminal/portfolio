import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src'),
    },
  },
  plugins: [],
  test: {
    environment: 'node',
    exclude: ['.tmp/**', 'node_modules/**'],
    pool: 'forks',
    maxWorkers: 1,
  },
});
