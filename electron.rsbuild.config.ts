import {resolve} from 'node:path'
import {defineConfig} from '@rsbuild/core'
import {pluginLess} from '@rsbuild/plugin-less'
import {pluginReact} from '@rsbuild/plugin-react'
import {pluginSvgIcons} from 'rsbuild-plugin-svg-icons'
import {listIconsPlugin} from './tools/iconList'
import {biomeFormat} from './tools/iconList/formatters/biomeFormat'

const RENDERER_FOLDER = resolve(__dirname, 'src', 'renderer', 'src')
const ICON_FOLDER = resolve(RENDERER_FOLDER, 'ui-framework', 'components', 'Icon')

// biome-ignore lint/style/noDefaultExport: rsbuild expects default export
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
          formatCode: biomeFormat,
        }),
      ],
      html: {
        template: resolve(__dirname, 'src/renderer/src/index.html'),
        tags: [
          {
            tag: 'meta',
            attrs: {
              'http-equiv': 'Content-Security-Policy',
              content: [
                // Restricts all resources to same origin by default
                "default-src 'self'",
                // Controls JavaScript execution - allows inline scripts and eval() in development
                `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
                // Allows CSS from same origin and inline styles
                "style-src 'self' 'unsafe-inline'",
                // Allows images from same origin, data URLs, blob URLs, and our custom cover protocol
                "img-src 'self' data: blob: cover:",
                // Allows fonts from same origin and data URLs
                "font-src 'self' data:",
                // Allows network connections to same origin and blob URLs (for audio playback)
                "connect-src 'self' blob:",
                // Allows media (audio/video) from same origin and blob URLs
                "media-src 'self' blob:",
                // Allows web workers from same origin and blob URLs
                "worker-src 'self' blob:",
                // Controls which URLs can be used in <base> tags
                "base-uri 'self'",
                // Controls which URLs can be used as form submission targets
                "form-action 'self'",
                // Controls which URLs can be loaded in <iframe> elements
                "frame-src 'none'",
                // Controls which URLs can be loaded in <object>, <embed>, or <applet> elements
                "object-src 'none'",
                // Controls which URLs can be loaded as web app manifests
                "manifest-src 'self'",
                // Prevents loading of mixed content (HTTP resources on HTTPS pages)
                'block-all-mixed-content',
                // Forces the browser to upgrade HTTP to HTTPS
                'upgrade-insecure-requests',
              ].join('; '),
            },
          },
        ],
      },
    },
  },
})
