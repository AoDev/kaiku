import * as store from '@lib/mobx/store.helpers'
import {revealLibraryItem} from '@src/lib/musicLibrary'
import {type IReactionDisposer, makeAutoObservable, reaction} from 'mobx'
import {MusicLibrary} from './MusicLibrary'
import {MusicPlayer} from './MusicPlayer'
import {SettingsDataStore, SettingsStore} from './Settings'
import {UIStore} from './UIStore'

export class RootStore {
  set: store.SetMethod<RootStore>
  assign: store.AssignMethod<RootStore>

  appIsLoading = true
  musicLibrary = new MusicLibrary()
  musicPlayer = new MusicPlayer()
  settings: SettingsStore
  uiStore: UIStore
  coverPath = ''
  storage: {settings: SettingsDataStore}
  unexpectedError: Error | null = null
  errorInfo: React.ErrorInfo | null = null
  stopRefreshSongPlayingCover: IReactionDisposer

  /**
   * Scrolls to the artist, album, song node of the song playing
   */
  revealSongPlaying() {
    const {musicPlayer} = this
    const {song} = musicPlayer
    if (!song) {
      return
    }
    this.musicLibrary.setFilter('')
    revealLibraryItem(song, this)
  }

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
    })

    window.addEventListener('unhandledrejection', ({reason}) => {
      this.set('unexpectedError', reason)
    })
    this.set('appIsLoading', false)

    return true
  }

  setErrorFromReactBoundary(unexpectedError: Error, errorInfo: React.ErrorInfo) {
    this.assign({unexpectedError, errorInfo})
  }

  constructor() {
    this.set = store.setMethod<RootStore>(this)
    this.assign = store.assignMethod<RootStore>(this)

    this.settings = new SettingsStore()
    this.storage = {
      settings: new SettingsDataStore(this.settings),
    }
    this.uiStore = new UIStore(this)
    makeAutoObservable(
      this,
      {musicLibrary: false, settings: false, storage: false, uiStore: false},
      {deep: false, autoBind: true}
    )
    this.stopRefreshSongPlayingCover = reaction(
      () => this.musicPlayer.song,
      (song) => {
        if (song) {
          // Check for album cover so it can be shown for the song playing
          const {musicLibrary} = this
          const album = musicLibrary.indexedAlbums[song.albumId]
          album && !album.coverExtension && musicLibrary.updateAlbumCovers([album])
        }
      },
      {name: 'refresh-song-playing-cover'}
    )
  }
}
