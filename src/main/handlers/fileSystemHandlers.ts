import {ipcMain, dialog} from 'electron'
import {readdir} from 'node:fs/promises'
import {join} from 'node:path'
import {parseFile} from 'music-metadata'
import type {Song, Artist, Album, AudioLibrary} from '../../types/Song'
import {createHash} from 'node:crypto'

function generateId(str: string): string {
  return createHash('md5').update(str).digest('hex')
}

async function getAllAudioFiles(basePath: string): Promise<string[]> {
  const result: string[] = []

  async function scanDirectory(dirPath: string) {
    const entries = await readdir(dirPath, {withFileTypes: true})

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name)

      if (entry.isDirectory()) {
        await scanDirectory(fullPath)
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.mp3')) {
        result.push(fullPath)
      }
    }
  }

  await scanDirectory(basePath)
  return result
}

async function handleListAudioFiles(_, path: string): Promise<AudioLibrary> {
  try {
    const audioFiles = await getAllAudioFiles(path)

    // First pass: collect all artists and albums
    const artistsMap = new Map<string, Artist>()
    const albumsMap = new Map<string, Album>()

    const songs = await Promise.all(
      audioFiles.map(async (file): Promise<Song> => {
        const metadata = await parseFile(file)
        const artistName = metadata.common.artist ?? ''
        const albumName = metadata.common.album ?? ''

        // Generate IDs
        const artistId = generateId(artistName)
        const albumId = generateId(`${artistName}:${albumName}`)

        // Store artist if new
        if (artistName && !artistsMap.has(artistId)) {
          artistsMap.set(artistId, {
            id: artistId,
            name: artistName,
          })
        }

        // Store album if new
        if (albumName && !albumsMap.has(albumId)) {
          albumsMap.set(albumId, {
            id: albumId,
            name: albumName,
            artistId,
            year: metadata.common.year ?? 0,
          })
        }

        return {
          title: metadata.common.title ?? '',
          artist: artistName,
          artistId: artistId,
          album: albumName,
          albumId: albumId,
          year: metadata.common.year ?? 0,
          trackNumber: metadata.common.track.no ?? 0,
          filePath: file,
        }
      })
    )

    return {
      songs,
      albums: Array.from(albumsMap.values()),
      artists: Array.from(artistsMap.values()),
    }
  } catch (err) {
    console.error('Error parsing audio files:', err)
    return {songs: [], albums: [], artists: []}
  }
}

async function handleListFiles(_, path: string) {
  try {
    const files = await readdir(path, {withFileTypes: true})
    return files.map((file) => join(path, file.name))
  } catch (error) {
    console.error('Error reading directory:', error)
    throw error
  }
}

async function handleDirectorySelection() {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })
  return result.filePaths[0]
}

export function setupFileSystemHandlers(): void {
  ipcMain.handle('list-files', handleListFiles)
  ipcMain.handle('select-directory', handleDirectorySelection)
  ipcMain.handle('listAudioFiles', handleListAudioFiles)
}
