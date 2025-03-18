import {isAbsolute, join} from 'node:path'
import {protocol} from 'electron'
import {COVER_FOLDER} from '../config'

export function setupProtocolHandler(): void {
  // Register protocol for local media files
  protocol.registerFileProtocol('media', (request, callback) => {
    const filePath = decodeURI(request.url.replace('media://', ''))
    try {
      if (!isAbsolute(filePath)) {
        throw new Error('File path must be absolute')
      }
      return callback(filePath)
    } catch (error) {
      console.error(error)
      return callback({error: -2})
    }
  })

  // Register protocol for album cover images
  protocol.registerFileProtocol('cover', (request, callback) => {
    const imagePath = decodeURI(request.url.replace('cover://', ''))
    try {
      // Join the cover folder path with the requested image path
      const fullPath = join(COVER_FOLDER, imagePath)
      if (!isAbsolute(fullPath)) {
        throw new Error('Cover path must be absolute')
      }
      if (!/^[^<>:"/\\|?*]+\.[a-zA-Z0-9]+$/.test(imagePath)) {
        throw new Error('Invalid image path format')
      }
      return callback(fullPath)
    } catch (error) {
      console.error(error)
      return callback({error: -2})
    }
  })
}
