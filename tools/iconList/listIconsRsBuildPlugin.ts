import {watch} from 'node:fs'
import path from 'node:path'
import type {RsbuildPlugin} from '@rsbuild/core'
import {listFiles, writeFiles} from './listIcons'

interface ListIconsPluginOptions {
  srcFolder: string
  destFile?: string
  destTsDefinitions: string
}

export function listIconsPlugin(options: ListIconsPluginOptions): RsbuildPlugin {
  let cache: string[] = []
  let watcher: ReturnType<typeof watch> | null = null

  return {
    name: 'list-icons-plugin',
    setup(api) {
      api.onBeforeEnvironmentCompile(async ({isWatch}) => {
        const {srcFolder, ...restOptions} = options
        const svgFiles = await listFiles(srcFolder)

        if (JSON.stringify(cache) === JSON.stringify(svgFiles)) {
          return
        }

        try {
          console.log(`SVGs found for svg sprite: ${svgFiles.length}`)
          await writeFiles({svgFiles, ...restOptions})
          cache = svgFiles

          // Set up file watcher in watch mode
          if (isWatch && !watcher) {
            let debounceTimer: NodeJS.Timeout

            watcher = watch(srcFolder, {recursive: true}, async (eventType, filename) => {
              if (filename && path.extname(filename).toLowerCase() === '.svg') {
                // Debounce updates to handle multiple rapid changes
                clearTimeout(debounceTimer)
                debounceTimer = setTimeout(async () => {
                  console.log(`[listIconsPlugin] SVG file changed: ${filename}`)
                  const updatedFiles = await listFiles(srcFolder)
                  await writeFiles({
                    svgFiles: updatedFiles,
                    ...restOptions,
                  })
                  cache = updatedFiles
                }, 300)
              }
            })

            // Clean up watcher when build ends
            api.onBeforeCreateCompiler(() => {
              watcher?.close()
              watcher = null
            })
          }
        } catch (err) {
          console.error('Error in list-icons-plugin:', err)
          throw err
        }
      })
    },
  }
}
