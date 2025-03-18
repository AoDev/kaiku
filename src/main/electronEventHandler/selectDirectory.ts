import {dialog} from 'electron'

/**
 * Use the native OS dialog to select a directory
 */
export async function selectDirectory() {
  const result = await dialog.showOpenDialog({properties: ['openDirectory']})
  return result.filePaths[0]
}
