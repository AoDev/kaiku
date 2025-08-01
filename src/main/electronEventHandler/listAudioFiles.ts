import {createHash} from 'node:crypto'
import {readdir} from 'node:fs/promises'
import {cpus} from 'node:os'
import {dirname, join} from 'node:path'
import {parseFile} from 'music-metadata'
import {asyncMapLimitSettled} from '../../lib/async'
import type {Album, Artist, AudioLibrary, Song} from '../../types/MusicLibrary.types'
import type {ScanProgress} from '../../types/ScanProgress'

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

async function getAllAudioFiles(
  basePath: string,
  onProgress?: (arg: ScanProgress) => void
): Promise<string[]> {
  let result: string[] = []
  let pendingDirectories: string[] = [basePath]
  let fileCount = 0
  let lastReportTime = Date.now()

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
            if (entry.name.startsWith('.')) {
              continue
            }

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
      pendingDirectories = pendingDirectories.concat(batchResult.directories)
      result = result.concat(batchResult.files)
      fileCount += batchResult.files.length
    }

    // Report progress after processing each batch
    // Throttle progress reporting to avoid overwhelming the IPC channel
    if (onProgress && Date.now() - lastReportTime > 100) {
      onProgress({completed: 0, total: fileCount, status: 'scanning'})
      lastReportTime = Date.now()
    }
  }

  // Send final count
  onProgress?.({completed: fileCount, total: fileCount, status: 'scanning'})

  return result
}

/**
 * Get the album name from the metadata or use the parent folder name as fallback
 */
function getAlbumName(albumMetadata: string | undefined, parentFolder: string): string {
  if (albumMetadata) {
    return albumMetadata
  }
  const pathComponents = parentFolder.split(/[/\\]/)
  const parentFolderName = pathComponents[pathComponents.length - 1] || 'Unknown Album'
  const grandParentFolderName = pathComponents[pathComponents.length - 2] || ''
  return grandParentFolderName ? `${grandParentFolderName} - ${parentFolderName}` : parentFolderName
}

export async function listAudioFiles(
  path: string,
  onProgress?: (arg: ScanProgress) => void
): Promise<AudioLibrary> {
  try {
    onProgress?.({completed: 0, total: 0, status: 'starting'})

    const audioFiles = await getAllAudioFiles(path, onProgress)

    const artistsMap = new Map<string, Artist>()
    const albumsMap = new Map<string, Album>()

    // Determine a reasonable concurrency limit based on CPU cores
    const concurrencyLimit = Math.max(2, Math.min(8, cpus().length))

    // Use our new utility function with controlled concurrency
    const results = await asyncMapLimitSettled<string, Song>(
      audioFiles,
      async (file) => {
        const metadata = await parseFile(file, {skipCovers: true})
        const artistName = metadata.common.artist || 'Unknown Artist'

        // Get the parent folder path and name
        const parentFolder = dirname(file)
        const albumName = getAlbumName(metadata.common.album, parentFolder)

        const year = metadata.common.year || 0

        // Check if the parent folder is a CD folder (CD1, CD2, Disc 1, etc.)
        const cdPattern = /[\/\\]((CD|Disc|Disk)\s*\d+|Bonus(?:\s*\d+)?)$/i
        let albumFolder = parentFolder

        if (cdPattern.test(parentFolder)) {
          // If it's a CD folder, use the parent of the CD folder instead
          albumFolder = dirname(parentFolder)
        }

        const artistId = generateId(artistName)
        // Use album folder path + album name for albumId
        // This ensures songs in the same album (even across CD folders) are grouped together
        const albumId = generateId(`${albumFolder}:${albumName}`)

        // Store artist if new
        if (artistName && !artistsMap.has(artistId)) {
          artistsMap.set(artistId, {id: artistId, name: artistName, albums: []})
        }

        // Store album if new
        if (!albumsMap.has(albumId)) {
          // Use the current artist's ID directly
          albumsMap.set(albumId, {
            artistId,
            coverExtension: '',
            id: albumId,
            name: albumName,
            year,
          })
        }

        const artist = artistsMap.get(artistId)
        if (artist && !artist.albums.includes(albumId)) {
          artist.albums.push(albumId)
        }

        return {
          album: albumName,
          albumId,
          artist: artistName,
          artistId,
          disk: {no: metadata.common.disk?.no ?? 1, of: metadata.common.disk?.of ?? 1},
          filePath: file,
          title: metadata.common.title ?? '',
          trackNumber: metadata.common.track.no ?? 0,
          year,
        }
      },
      concurrencyLimit,
      // Optional progress callback for metadata parsing progress
      onProgress
        ? (completed, total) => {
            if (completed % 10 === 0 || completed === total) {
              onProgress({completed, total, status: completed === total ? 'complete' : 'scanning'})
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
