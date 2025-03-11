import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  resolve: {
    alias: {
      '@rootsrc': '/src',
      '@renderer': '/src/renderer/src',
      '@lib': '/src/lib',
      '@src': '/src/renderer/src',
      '@ui': '/src/renderer/src/ui-framework',
    },
  },
})
