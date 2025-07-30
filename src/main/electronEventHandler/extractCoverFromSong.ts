import fs from 'node:fs/promises'
import {join} from 'node:path'
import {parseFile} from 'music-metadata'
import {normalizeError} from '../../lib/error'
import type {AlbumCoverDetails, CoverExtractResult} from '../../types/Cover'
import {COVER_FOLDER} from '../config'

type SongProps = {
  albumId: string
  filePath: string
}

const mimeTypes: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/jpg': 'jpg',
  'image/bmp': 'bmp',
}

export async function createCoverFolder() {
  try {
    const stats = await fs.stat(COVER_FOLDER)
    if (!stats.isDirectory()) {
      console.error('Covers path exists but is not a directory.')
    }
  } catch {
    // Directory doesn't exist, create it
    console.log('Creating covers cache dir...')
    await fs.mkdir(COVER_FOLDER, {recursive: true})
  }
}

/**
 * Given a song data, try to extract the album cover from its file metadata
 */
export async function extractCoverFromSong(song: SongProps): Promise<AlbumCoverDetails | null> {
  const songMetadata = await parseFile(song.filePath)
  const pic = songMetadata.common.picture?.[0]

  if (pic) {
    const fileExtension = mimeTypes[pic.format]
    if (!fileExtension) {
      throw new Error(`Unsupported image format: ${pic.format} ${song.filePath}`)
    }
    const filePath = join(COVER_FOLDER, `${song.albumId}.${fileExtension}`)
    await fs.writeFile(filePath, pic.data)
    return {fileExtension, filePath}
  }
  return null
}

/**
 * Process a single song and return its cover extraction result
 */
async function tryExtractCover(song: SongProps): Promise<CoverExtractResult> {
  try {
    const cover = await extractCoverFromSong(song)
    return {albumId: song.albumId, cover, error: null}
  } catch (err) {
    return {albumId: song.albumId, cover: null, error: normalizeError(err)}
  }
}

/**
 * Given multiple song data, try to extract the album cover from their file metadata
 */
export async function extractCoverFromSongs(songs: SongProps[]): Promise<CoverExtractResult[]> {
  const promises = songs.map((song) => tryExtractCover(song))
  const results = await Promise.all(promises)
  return results
}
