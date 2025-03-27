import type {ElectronAPI} from '@electron-toolkit/preload'

interface CustomAPI {
  loadAudioFile: (filePath: string) => Promise<Buffer>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
