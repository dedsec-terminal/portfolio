import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    environment: 'node',
    exclude: ['.tmp/**', 'node_modules/**'],
  },
});
