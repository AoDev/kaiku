import {promises as fs} from 'node:fs'
import path from 'node:path'
import prettier from 'prettier'

async function listFiles(srcFolder: string): Promise<string[]> {
  try {
    const files = await fs.readdir(srcFolder)
    const svgFiles = files
      .filter((file) => path.extname(file).toLowerCase() === '.svg')
      .map((file) => path.parse(file).name)
      .sort()

    return svgFiles
  } catch (err) {
    throw new Error(`Error reading folder: ${err instanceof Error ? err.message : String(err)}`)
  }
}

export interface WriteFilesOptions {
  svgFiles: string[]
  destFile?: string
  destTsDefinitions: string
}

async function writeFiles({
  svgFiles,
  destFile,
  destTsDefinitions,
}: WriteFilesOptions): Promise<void> {
  const prettierOptions = await prettier.resolveConfig(path.resolve(__dirname, '..', '.prettierrc'))
  const tsDefinitionsFormatted = await prettier.format(
    `/** Auto-generated file */\n export type IconName = ${svgFiles.map((file) => JSON.stringify(file)).join('|')}`,
    {
      ...prettierOptions,
      parser: 'typescript',
    }
  )
  await fs.writeFile(destTsDefinitions, tsDefinitionsFormatted)

  if (destFile) {
    const iconListFormatted = await prettier.format(
      `/** Auto-generated file */\n import {IconName} from 'src/ui-framework/components/Icon/iconNames.d'\n const list: IconName[] = ${JSON.stringify(
        svgFiles
      )}; export default list`,
      {
        ...prettierOptions,
        parser: 'typescript',
      }
    )
    await fs.writeFile(destFile, iconListFormatted)
  }
}

export {listFiles, writeFiles}
