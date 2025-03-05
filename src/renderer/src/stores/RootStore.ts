import {makeAutoObservable} from 'mobx'
import {MusicLibrary} from './MusicLibrary'
import {MusicPlayer} from './MusicPlayer'
import * as store from 'lib/mobx/store.helpers'

export class RootStore {
  set: store.SetMethod<RootStore>

  musicLibrary = new MusicLibrary()
  musicPlayer = new MusicPlayer()
  coverPath = ''

  async init() {
    try {
      const coverPath = await window.electron.ipcRenderer.invoke('getCoverFolderPath')
      this.set('coverPath', coverPath)
    } catch (error) {
      console.error('Failed to get cover folder path:', error)
    }
  }

  constructor() {
    this.set = store.setMethod<RootStore>(this)
    makeAutoObservable(this, {musicLibrary: false}, {deep: false, autoBind: true})
  }
}
