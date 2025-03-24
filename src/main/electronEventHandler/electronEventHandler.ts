import {BrowserWindow, type IpcMainInvokeEvent, ipcMain} from 'electron'
import type {AudioLibrary} from '../../types/MusicLibrary.types'
import type {ScanProgress} from '../../types/ScanProgress'
import {COVER_FOLDER} from '../config'
import {extractCoverFromSongs} from './extractCoverFromSong'
import {listAudioFiles} from './listAudioFiles'
import {saveMusicLibrary} from './musicLibrary'
import {loadMusicLibrary} from './musicLibrary'
import {selectDirectory} from './selectDirectory'

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
    ? (arg: ScanProgress) => window.webContents.send('scan-progress-update', arg)
    : undefined

  return listAudioFiles(path, reportProgress)
}

export function setupHandlers(): void {
  ipcMain.handle('selectDirectory', selectDirectory)
  ipcMain.handle('listAudioFiles', handleListAudioFiles)
  ipcMain.handle('getCoverFolderPath', () => COVER_FOLDER)
  ipcMain.handle('saveMusicLibrary', (_, library: AudioLibrary) => saveMusicLibrary(library))
  ipcMain.handle('loadMusicLibrary', loadMusicLibrary)
  ipcMain.handle('extractCoverFromSongs', (_, songs: {albumId: string; filePath: string}[]) =>
    extractCoverFromSongs(songs)
  )
}
