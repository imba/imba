import { imba } from 'vite-plugin-imba'
import { defineConfig } from 'vite'
import GithubActionsReporter from 'vitest-github-actions-reporter-temp'

export default defineConfig({
  plugins: [imba()],
  define: {
    'import.meta.vitest': 'undefined'
  },
  test: {
    globals: true,
    include: ['**/*.{test,spec}.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    includeSource: ['src/**/*.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./test/setup.imba'],
    reporters: process.env.GITHUB_ACTIONS
      ? new GithubActionsReporter()
      : 'default'
  },
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // Tauri expects a fixed port, fail if that port is not available
  server: {
    strictPort: true
  },
  // to make use of `TAURI_PLATFORM`, `TAURI_ARCH`, `TAURI_FAMILY`,
  // `TAURI_PLATFORM_VERSION`, `TAURI_PLATFORM_TYPE` and `TAURI_DEBUG`
  // env variables
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri supports es2021
    target: ['es2021', 'chrome100', 'safari13'],
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG
  }
})
