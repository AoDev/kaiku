import {promises as fs} from 'node:fs'
import path from 'node:path'
import {normalizeError} from '../../src/lib/error'

async function listFiles(srcFolder: string): Promise<string[]> {
  try {
    const files = await fs.readdir(srcFolder)
    const svgFiles = files
      .filter((file) => path.extname(file).toLowerCase() === '.svg')
      .map((file) => path.parse(file).name)
      .sort()

    return svgFiles
  } catch (err) {
    throw new Error(`Error reading folder: ${normalizeError(err)}`)
  }
}

export interface WriteFilesOptions {
  svgFiles: string[]
  destFile?: string
  destTsDefinitions: string
  formatCode?: (code: string, parser?: string) => Promise<string>
}

async function writeFiles({
  svgFiles,
  destFile,
  destTsDefinitions,
  formatCode = (code) => Promise.resolve(code),
}: WriteFilesOptions): Promise<void> {
  const tsDefinitions = `/** Auto-generated file */\n export type IconName = ${svgFiles
    .map((file) => JSON.stringify(file))
    .join('|')}`

  const formattedTsDefinitions = await formatCode(tsDefinitions, 'typescript')
  await fs.writeFile(destTsDefinitions, formattedTsDefinitions)

  if (destFile) {
    const iconList = `/** Auto-generated file */\n import {IconName} from 'src/ui-framework/components/Icon/iconNames.d'\n const list: IconName[] = ${JSON.stringify(
      svgFiles
    )}; export default list`

    const formattedIconList = await formatCode(iconList, 'typescript')
    await fs.writeFile(destFile, formattedIconList)
  }
}

export {listFiles, writeFiles}
