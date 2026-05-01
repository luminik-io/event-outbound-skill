import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.{test,spec}.ts', 'evals/**/*.eval.ts'],
    environment: 'jsdom',
    testTimeout: 120000,
  },
});
