import {protocol} from 'electron'

export function setupProtocolHandler(): void {
  // Register protocol for local media files
  protocol.registerFileProtocol('media', (request, callback) => {
    const filePath = decodeURI(request.url.replace('media://', ''))
    try {
      return callback(filePath)
    } catch (error) {
      console.error(error)
      return callback({error: -2})
    }
  })
}
