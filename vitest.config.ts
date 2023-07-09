import { defineConfig } from 'vitest/config'
process.env = { ...process.env, CI: 'true', TESTING: 'true' }
export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'c8',
      reporter: ['lcov'],
      exclude: ['dist/**', 'tests/**/*.test.ts']
    }
  }
})
