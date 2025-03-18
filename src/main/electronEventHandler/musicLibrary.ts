import {readFile, writeFile} from 'node:fs/promises'
import {type AudioLibrary, isAudioLibrary} from '../../types/MusicLibrary.types'
import {MUSIC_LIBRARY_FILE} from '../config'

/**
 * Save the music library to a JSON file
 */
export async function saveMusicLibrary(library: AudioLibrary): Promise<boolean> {
  try {
    await writeFile(MUSIC_LIBRARY_FILE, JSON.stringify(library), 'utf-8')
    return true
  } catch (error) {
    console.error('Failed to save music library:', error)
    return false
  }
}

/**
 * Load the music library from a JSON file
 */
export async function loadMusicLibrary(): Promise<AudioLibrary | null> {
  try {
    const data = await readFile(MUSIC_LIBRARY_FILE, 'utf-8')
    const library = JSON.parse(data)
    return isAudioLibrary(library) ? library : null
  } catch (error) {
    console.error('Failed to load music library:', error)
    return null
  }
}
