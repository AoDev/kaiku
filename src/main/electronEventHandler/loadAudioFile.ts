import {readFile, stat} from 'node:fs/promises'
import {isAbsolute} from 'node:path'
import type {IpcMainInvokeEvent} from 'electron'

// Maximum allowed file size (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024

// Allowed audio file extensions
const ALLOWED_AUDIO_EXTENSIONS = new Set(['.mp3', '.m4a', '.flac', '.wav', '.ogg', '.aac'])

/**
 * Validate if a file path is safe to access
 */
function validateFilePath(filePath: string): boolean {
  if (!isAbsolute(filePath)) {
    throw new Error('File path must be absolute')
  }

  const extension = filePath.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!extension || !ALLOWED_AUDIO_EXTENSIONS.has(extension)) {
    throw new Error('Invalid file type')
  }

  return true
}

/**
 * Load an audio file and return it as a buffer
 */
export async function handleLoadAudioFile(
  _event: IpcMainInvokeEvent,
  filePath: string
): Promise<Buffer> {
  try {
    validateFilePath(filePath)

    // Check file size
    const stats = await stat(filePath)
    if (stats.size > MAX_FILE_SIZE) {
      throw new Error('File too large')
    }

    // Read file
    const buffer = await readFile(filePath)
    return buffer
  } catch (error) {
    console.error('Failed to load audio file:', error)
    throw error
  }
}
