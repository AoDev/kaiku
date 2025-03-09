import {exec} from 'node:child_process'
import {randomUUID} from 'node:crypto'
import {readFile, rm, writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {promisify} from 'node:util'

const execAsync = promisify(exec)

const generateTempFilename = () => {
  return resolve(__dirname, `.temp-biome-format-${randomUUID()}.ts`)
}

/**
 * Formats JS code using Biome formatter.
 *
 * The function is safe for concurrent use as it generates unique temporary filenames.
 * If formatting fails, it returns the original unformatted code.
 *
 * biome does not have a JS api, we use npx to call biome.
 *
 * @param code - The code to format as a string
 * @returns Promise of formatted code, or the original code if formatting fails
 *
 * @example
 * const formatted = await biomeFormat('export const x = 1;')
 */
export const biomeFormat = async (code: string) => {
  try {
    const tempFile = generateTempFilename()
    await writeFile(tempFile, code)
    await execAsync(`npx @biomejs/biome format --write "${tempFile}"`)

    const formattedCode = await readFile(tempFile, 'utf-8')
    await rm(tempFile)

    return formattedCode
  } catch (error) {
    console.error('Biome formatting failed:', error)
    return code // Return unformatted code on error
  }
}
