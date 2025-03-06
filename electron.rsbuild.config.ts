import {resolve} from 'node:path'
import {defineConfig} from '@rsbuild/core'
import {pluginReact} from '@rsbuild/plugin-react'
import {pluginLess} from '@rsbuild/plugin-less'
import {pluginSvgIcons} from 'rsbuild-plugin-svg-icons'
import {listIconsPlugin} from './tools/iconList'

const RENDERER_FOLDER = resolve(__dirname, 'src', 'renderer', 'src')
const ICON_FOLDER = resolve(RENDERER_FOLDER, 'ui-framework', 'components', 'Icon')

export default defineConfig({
  root: resolve(__dirname, '.'),
  environments: {
    // main
    main: {},
    // preload
    preload: {},
    // renderer
    renderer: {
      resolve: {
        alias: {
          '@lib': resolve(__dirname, 'src', 'lib'),
          '@ui': resolve(__dirname, 'src', 'renderer', 'src', 'ui-framework'),
          '@src': resolve(__dirname, 'src', 'renderer', 'src'),
          '@rootsrc': resolve(__dirname, 'src'),
        },
      },
      plugins: [
        pluginReact(),
        pluginLess(),
        pluginSvgIcons({
          iconDirs: [resolve(RENDERER_FOLDER, 'assets', 'svg-sprite')],
          symbolId: '[name]',
        }),
        listIconsPlugin({
          srcFolder: resolve(RENDERER_FOLDER, 'assets', 'svg-sprite'),
          // destFile: path.resolve(SRC_FOLDER, 'assets', 'svg-sprite', 'icons.ts'),
          destTsDefinitions: resolve(ICON_FOLDER, 'iconNames.d.ts'),
        }),
      ],
      html: {
        template: resolve(__dirname, 'src/renderer/src/index.html'),
      },
    },
  },
})
