import {createHash} from 'node:crypto'
import {readdir} from 'node:fs/promises'
import {join} from 'node:path'
import {BrowserWindow, dialog, ipcMain} from 'electron'
import {parseFile} from 'music-metadata'
import type {Album, Artist, AudioLibrary, Song} from '../../types/Song'
import {cpus} from 'node:os'
import {asyncMapLimitSettled} from '../../lib/async'

function generateId(str: string): string {
  return createHash('md5').update(str).digest('hex')
}

// Create a single regex pattern for all supported audio extensions
// The 'i' flag makes it case-insensitive
const AUDIO_FILE_REGEX = /\.(mp3|m4a|flac|wav|ogg|aac)$/i

// Directories to skip (common non-media directories)
const SKIP_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  '$recycle.bin',
  'system volume information',
  'program files',
  'windows',
  '$windows.~bt',
  'appdata',
  'temp',
])

async function getAllAudioFiles(basePath: string, window?: BrowserWindow): Promise<string[]> {
  const result: string[] = []
  const pendingDirectories: string[] = [basePath]
  let fileCount = 0
  let lastReportTime = Date.now()

  // Helper function to report progress to renderer
  const reportProgress = () => {
    const now = Date.now()
    // Only report every 100ms to avoid overwhelming the IPC channel
    if (window && now - lastReportTime > 100) {
      window.webContents.send('scan-progress-update', {
        count: fileCount,
        status: 'scanning',
      })
      lastReportTime = now
    }
  }

  // Process directories in batches to avoid excessive recursion
  while (pendingDirectories.length > 0) {
    // Take a batch of directories to process (up to 50 at a time)
    const batch = pendingDirectories.splice(0, 50)

    // Process this batch of directories in parallel
    const batchResults = await Promise.all(
      batch.map(async (dirPath) => {
        const dirResults: {files: string[]; directories: string[]} = {
          files: [],
          directories: [],
        }

        try {
          const entries = await readdir(dirPath, {withFileTypes: true})

          for (const entry of entries) {
            // Skip hidden files and directories (starting with .)
            if (entry.name.startsWith('.')) continue

            const fullPath = join(dirPath, entry.name)

            if (entry.isDirectory()) {
              if (!SKIP_DIRECTORIES.has(entry.name)) {
                dirResults.directories.push(fullPath)
              }
            } else if (entry.isFile()) {
              // Use regex test for efficient case-insensitive extension matching
              if (AUDIO_FILE_REGEX.test(entry.name)) {
                dirResults.files.push(fullPath)
              }
            }
          }
        } catch (error) {
          // Silently skip directories we can't access
          console.warn(`Skipping inaccessible directory: ${dirPath}`, error)
        }

        return dirResults
      })
    )

    // Collect results from this batch
    for (const batchResult of batchResults) {
      pendingDirectories.push(...batchResult.directories)
      for (const file of batchResult.files) {
        result.push(file)
        fileCount++
      }
    }

    // Report progress after processing each batch
    reportProgress()
  }

  // Send final count
  if (window) {
    window.webContents.send('scan-progress-update', {
      count: fileCount,
      status: 'complete',
    })
  }

  return result
}

async function handleListAudioFiles(event, path: string): Promise<AudioLibrary> {
  try {
    // Get the BrowserWindow that sent the request
    const window = event.sender
      ? BrowserWindow.fromWebContents(event.sender) || undefined
      : undefined

    // Initialize progress
    if (window) {
      window.webContents.send('scan-progress-update', {
        count: 0,
        status: 'starting',
      })
    }

    const audioFiles = await getAllAudioFiles(path, window)

    const artistsMap = new Map<string, Artist>()
    const albumsMap = new Map<string, Album>()

    // Determine a reasonable concurrency limit based on CPU cores
    const concurrencyLimit = Math.max(2, Math.min(8, cpus().length))

    // Use our new utility function with controlled concurrency
    const results = await asyncMapLimitSettled(
      audioFiles,
      async (file) => {
        const metadata = await parseFile(file)
        const artistName = metadata.common.artist ?? 'Unknown Artist'
        const albumName = metadata.common.album ?? 'Unknown Album'

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
      },
      concurrencyLimit,
      // Optional progress callback for metadata parsing progress
      window
        ? (completed, total) => {
            if (completed % 10 === 0 || completed === total) {
              // Update every 10 files or on completion
              window.webContents.send('metadata-progress-update', {
                completed,
                total,
                status: completed === total ? 'complete' : 'processing',
              })
            }
          }
        : undefined
    )

    // Filter out failed results and keep only successful ones
    const songs = results
      .filter((result): result is PromiseFulfilledResult<Song> => result.status === 'fulfilled')
      .map((result) => result.value)

    // Log the number of failed files
    const failedCount = results.filter((result) => result.status === 'rejected').length
    if (failedCount > 0) {
      console.warn(`Failed to parse ${failedCount} audio files`)
    }

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
