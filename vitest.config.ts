import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: ['src/test/extension.test.ts', 'node_modules'],
  },
})
