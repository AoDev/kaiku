import {BrowserWindow, type IpcMainInvokeEvent, dialog, ipcMain} from 'electron'
import type {ScanProgress} from '../../types/ScanProgress'
import type {AudioLibrary} from '../../types/Song'
import {COVER_FOLDER} from '../config'
import {extractCoverFromSong} from './extractCoverFromSong'
import {listAudioFiles} from './listAudioFiles'

/**
 * Use the native OS dialog to select a directory
 */
async function selectDirectory() {
  const result = await dialog.showOpenDialog({properties: ['openDirectory']})
  return result.filePaths[0]
}

/**
 * List all audio files in the given directory
 */
export async function handleListAudioFiles(
  event: IpcMainInvokeEvent,
  path: string
): Promise<AudioLibrary> {
  // Get the BrowserWindow that sent the request
  const window = event.sender ? BrowserWindow.fromWebContents(event.sender) || undefined : undefined

  const reportProgress = window
    ? (arg: ScanProgress) => {
        window.webContents.send('scan-progress-update', arg)
      }
    : undefined

  return listAudioFiles(path, reportProgress)
}

export function setupFileSystemHandlers(): void {
  ipcMain.handle('selectDirectory', selectDirectory)
  ipcMain.handle('listAudioFiles', handleListAudioFiles)
  ipcMain.handle('extractCoverFromSong', (_, song: {albumId: string; filePath: string}) =>
    extractCoverFromSong(song)
  )
  ipcMain.handle('getCoverFolderPath', () => COVER_FOLDER)
}
