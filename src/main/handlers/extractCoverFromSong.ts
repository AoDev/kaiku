import fs from 'node:fs/promises'
import {join} from 'node:path'
import {parseFile} from 'music-metadata'
import type {AlbumCoverDetails} from '../../types/Cover'
import {COVER_FOLDER} from '../config'

export async function createCoverFolder() {
  try {
    const stats = await fs.stat(COVER_FOLDER)
    if (!stats.isDirectory()) {
      console.error('Covers path exists but is not a directory.')
    }
  } catch (error) {
    // Directory doesn't exist, create it
    console.log('Creating covers cache dir...')
    await fs.mkdir(COVER_FOLDER, {recursive: true})
  }
}

/**
 * Given a song data, try to extract the album cover from its file metadata
 */
export async function extractCoverFromSong(song: {
  albumId: string
  filePath: string
}): Promise<AlbumCoverDetails | null> {
  const songMetadata = await parseFile(song.filePath)
  const pic = songMetadata.common.picture?.[0]

  if (pic) {
    const ext = pic.format === 'image/jpeg' ? 'jpg' : pic.format
    const filePath = join(COVER_FOLDER, `${song.albumId}.${ext}`)
    await fs.writeFile(filePath, pic.data)
    return {fileExtension: ext, filePath}
  }
  return null
}
