import {resolve} from 'node:path'
import {defineConfig} from '@rsbuild/core'
import {pluginReact} from '@rsbuild/plugin-react'
import {pluginLess} from '@rsbuild/plugin-less'

export default defineConfig({
  root: resolve(__dirname, '.'),
  environments: {
    // main
    main: {},
    // preload
    preload: {},
    // renderer
    renderer: {
      plugins: [pluginReact(), pluginLess()],
      html: {
        template: resolve(__dirname, 'src/renderer/src/index.html'),
      },
    },
  },
})
