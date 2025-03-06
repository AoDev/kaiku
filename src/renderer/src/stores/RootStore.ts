import * as store from '@lib/mobx/store.helpers'
import {makeAutoObservable} from 'mobx'
import {MusicLibrary} from './MusicLibrary'
import {MusicPlayer} from './MusicPlayer'
import {SettingsDataStore, SettingsStore} from './Settings'
import UIStore from './UIStore'

export class RootStore {
  set: store.SetMethod<RootStore>

  appIsLoading = true
  musicLibrary = new MusicLibrary()
  musicPlayer = new MusicPlayer()
  settings: SettingsStore
  uiStore: UIStore
  coverPath = ''
  storage: {settings: SettingsDataStore}
  unexpectedError: Error | null = null

  async init() {
    try {
      const coverPath = await window.electron.ipcRenderer.invoke('getCoverFolderPath')
      this.set('coverPath', coverPath)
    } catch (error) {
      console.error('Failed to get cover folder path:', error)
    }

    await this.storage.settings.init()
    this.uiStore.init()

    // Listen for uncaught errors
    window.addEventListener('error', ({error}) => {
      this.set('unexpectedError', error)
      this.uiStore.unexpectedErrorDialog.show()
    })

    window.addEventListener('unhandledrejection', ({reason}) => {
      this.set('unexpectedError', reason)
      this.uiStore.unexpectedErrorDialog.show()
    })
    this.set('appIsLoading', false)

    return true
  }

  constructor() {
    this.settings = new SettingsStore()
    this.storage = {
      settings: new SettingsDataStore(this.settings),
    }

    this.uiStore = new UIStore(this)

    this.set = store.setMethod<RootStore>(this)
    makeAutoObservable(
      this,
      {musicLibrary: false, settings: false, storage: false, uiStore: false},
      {deep: false, autoBind: true},
    )
  }
}
