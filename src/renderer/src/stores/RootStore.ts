import * as store from '@lib/mobx/store.helpers'
import {sleep} from '@rootsrc/lib/async'
import {revealLibraryItem} from '@src/lib/musicLibrary'
import {type IReactionDisposer, makeAutoObservable, reaction} from 'mobx'
import {MusicLibrary} from './MusicLibrary'
import {MusicPlayer} from './MusicPlayerWaveSurfer'
import {SettingsDataStore, SettingsStore} from './Settings'
import {UIStore} from './UIStore'

type AppStatus = 'init' | 'loading-library' | 'ready'

export type HandledError = {
  title: string
  description: string
  error: Error | null
}

export class RootStore {
  set: store.SetMethod<RootStore>
  assign: store.AssignMethod<RootStore>

  appIsLoading = true
  musicLibrary: MusicLibrary
  musicPlayer: MusicPlayer
  settings: SettingsStore
  uiStore: UIStore
  coverPath = ''
  storage: {settings: SettingsDataStore}
  /** For errors that we catch and handle, usually to display a warning to the user */
  handledError: HandledError | null = null
  /** For unexpected errors that bubbles to React boundaries, blocks the app and shows the error screen */
  unexpectedError: Error | null = null
  errorInfo: React.ErrorInfo | null = null
  stopRefreshSongPlayingCover: IReactionDisposer
  appStatus: AppStatus = 'init'

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
    // Listen for uncaught errors
    window.addEventListener('error', ({error}) => {
      this.set('unexpectedError', error)
    })

    window.addEventListener('unhandledrejection', ({reason}) => {
      this.set('unexpectedError', reason)
    })

    try {
      const coverPath = await window.electron.ipcRenderer.invoke('getCoverFolderPath')
      this.set('coverPath', coverPath)
    } catch (error) {
      console.error('Failed to get cover folder path:', error)
    }

    await this.storage.settings.init()
    this.uiStore.init()
    this.set('appIsLoading', false)

    this.set('appStatus', 'loading-library')
    await this.musicLibrary.loadLibrary()
    await sleep(1000) // Fake delay to show loading state
    this.set('appStatus', 'ready')
    return true
  }

  /** Keep track of unexpected errors that bubble to React boundaries */
  setErrorFromReactBoundary(unexpectedError: Error, errorInfo: React.ErrorInfo) {
    this.assign({unexpectedError, errorInfo})
  }

  /** Show an error that we caught to the user */
  showHandledError(handledError: HandledError) {
    this.assign({handledError})
    this.uiStore.handledErrorDialog.show()
  }

  showAudioFileError(_filePath: string, error: Error) {
    this.showHandledError({
      title: 'Error Loading Audio file',
      description: 'There is an issue with the audio file you are trying to play.',
      error,
    })
  }

  constructor() {
    this.set = store.setMethod<RootStore>(this)
    this.assign = store.assignMethod<RootStore>(this)

    this.settings = new SettingsStore()
    this.storage = {settings: new SettingsDataStore(this.settings)}
    this.uiStore = new UIStore(this)
    this.musicLibrary = new MusicLibrary(this)

    makeAutoObservable(
      this,
      {musicLibrary: false, settings: false, storage: false, uiStore: false},
      {deep: false, autoBind: true}
    )

    this.musicPlayer = new MusicPlayer({onLoadAudioFileError: this.showAudioFileError})

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
