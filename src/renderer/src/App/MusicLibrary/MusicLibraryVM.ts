import * as store from '@lib/mobx/store.helpers'
import {getDatasetValue} from '@rootsrc/lib/dom/getDatasetValue'
import type {Album, Artist, Song} from '@rootsrc/types/MusicLibrary.types'
import {revealByPriority} from '@src/lib/musicLibrary'
import type {MusicLibrary, RootStore} from '@src/stores'
import type {DialogVM} from '@ui'
import {type IReactionDisposer, makeAutoObservable, reaction} from 'mobx'
import {zoomTransition} from '../../config'
import type {ContextMenuState} from './shared/ContextMenu'

type ItemClickEvent = React.MouseEvent<HTMLDivElement>

export class MusicLibraryVM {
  rootStore: RootStore
  musicLibrary: MusicLibrary
  set: store.SetMethod<MusicLibraryVM>
  assign: store.AssignMethod<MusicLibraryVM>
  stopRevealArtist: IReactionDisposer
  songDetailsDialog: DialogVM
  songMenuDialog: DialogVM
  albumMenuDialog: DialogVM
  artistMenuDialog: DialogVM
  clickTimers: {[key: string]: NodeJS.Timeout} = {}

  // Define item click configurations
  private clickHandlers = {
    artist: {
      getIdFromEvent: (event: ItemClickEvent) => getDatasetValue(event, 'artistId'),
      isSelected: (id: string) => this.musicLibrary.artistSelected === id,
      onSelect: (id: string) =>
        this.musicLibrary.assign({artistSelected: id, albumSelected: '', songSelected: ''}),
      onDeselect: () =>
        this.musicLibrary.assign({artistSelected: '', albumSelected: '', songSelected: ''}),
      onPlay: (id: string) =>
        this.rootStore.musicPlayer.replacePlaylistAndPlay(this.musicLibrary.getArtistSongs(id)),
    },
    album: {
      getIdFromEvent: (event: ItemClickEvent) => getDatasetValue(event, 'albumId'),
      isSelected: (id: string) => this.musicLibrary.albumSelected === id,
      onSelect: (id: string) => this.musicLibrary.assign({albumSelected: id, songSelected: ''}),
      onDeselect: () => this.musicLibrary.assign({albumSelected: '', songSelected: ''}),
      onPlay: (id: string) =>
        this.rootStore.musicPlayer.replacePlaylistAndPlay(this.musicLibrary.getAlbumSongs(id)),
    },
    song: {
      getIdFromEvent: (event: ItemClickEvent) => getDatasetValue(event, 'filePath'),
      isSelected: (id: string) => this.musicLibrary.songSelected === id,
      onSelect: (id: string) => this.musicLibrary.assign({songSelected: id}),
      onDeselect: () => this.musicLibrary.assign({songSelected: ''}),
      onPlay: (id: string) =>
        this.rootStore.musicPlayer.replacePlaylistAndPlay(this.musicLibrary.getSong(id)),
    },
  }

  songContextMenu: ContextMenuState<Song> = {
    x: 0,
    y: 0,
    items: [
      {
        icon: 'plus',
        label: 'Add to Playlist',
        onClick: () => {
          const {data} = this.songContextMenu
          if (data) {
            this.rootStore.musicPlayer.addToPlaylist([data])
          }
          this.songMenuDialog.hide()
        },
      },
      {
        icon: 'info-wire',
        label: 'Song details',
        onClick: () => {
          this.songMenuDialog.hide()
          this.songDetailsDialog.show()
        },
      },
    ],
  }

  albumContextMenu: ContextMenuState<Album> = {
    x: 0,
    y: 0,
    items: [
      {
        icon: 'plus',
        label: 'Add to Playlist',
        onClick: () => {
          const {data} = this.albumContextMenu
          if (data) {
            const songs = this.rootStore.musicLibrary.getAlbumSongs(data.id)
            this.rootStore.musicPlayer.addToPlaylist(songs)
          }
          this.albumMenuDialog.hide()
        },
      },
    ],
  }

  artistContextMenu: ContextMenuState<Artist> = {
    x: 0,
    y: 0,
    items: [
      {
        icon: 'plus',
        label: 'Add to Playlist',
        onClick: () => {
          const {data} = this.artistContextMenu
          if (data) {
            const songs = this.rootStore.musicLibrary.getArtistSongs(data.id)
            this.rootStore.musicPlayer.addToPlaylist(songs)
          }
          this.artistMenuDialog.hide()
        },
      },
    ],
  }

  get shouldGroupByAlbum() {
    return !!this.rootStore.musicLibrary.artistSelected
  }

  get groupedSongsByAlbum(): [Album, Song[]][] {
    const {musicLibrary} = this.rootStore
    return this.shouldGroupByAlbum ? musicLibrary.getSongsByAlbum(musicLibrary.artistSelected) : []
  }

  /**
   * Generic click handler to manage single/double click behavior consistently
   * - single click selects the artist, album, or song
   * - double click plays songs by the artist, album, or song
   */
  private onItemClick(event: React.MouseEvent<HTMLDivElement>, type: 'artist' | 'album' | 'song') {
    const handler = this.clickHandlers[type]
    const id = handler.getIdFromEvent(event)
    if (!id) {
      return
    }

    const isSelected = handler.isSelected(id)
    const timerKey = `${type}-${id}`
    const clickCount = event.detail

    // For double clicks, always select and play
    if (clickCount === 2) {
      if (this.clickTimers[timerKey]) {
        clearTimeout(this.clickTimers[timerKey])
        delete this.clickTimers[timerKey]
      }
      handler.onSelect(id)
      handler.onPlay(id)
      return
    }

    // For single clicks on already selected item, use delayed execution
    if (isSelected) {
      // If there's already a timer, don't set another one
      if (this.clickTimers[timerKey]) {
        return
      }

      // Set a timer to handle the single click if no double click occurs
      this.clickTimers[timerKey] = setTimeout(() => {
        // Deselect after delay if it was a genuine single click
        handler.onDeselect()
        delete this.clickTimers[timerKey]
      }, 300) // Wait for potential double click
    } else {
      // Item is not selected yet, so select it immediately
      handler.onSelect(id)
    }
  }

  onArtistClick(event: ItemClickEvent) {
    this.onItemClick(event, 'artist')
  }

  onAlbumClick(event: ItemClickEvent) {
    this.onItemClick(event, 'album')
  }

  onSongClick(event: ItemClickEvent) {
    this.onItemClick(event, 'song')
  }

  onSongContextMenu(event: ItemClickEvent) {
    // Prevent default behavior to avoid opening the default context menu
    event.preventDefault()
    this.hideAllContextMenus()
    const {musicLibrary} = this.rootStore
    const filePath = getDatasetValue(event, 'filePath')

    if (!filePath) {
      return
    }

    if (musicLibrary.songSelected !== filePath) {
      musicLibrary.assign({songSelected: filePath})
    }
    // Find the song by file path
    const song = musicLibrary.songs.find((s) => s.filePath === filePath)
    if (song) {
      Object.assign(this.songContextMenu, {x: event.clientX, y: event.clientY, data: song})
      this.songMenuDialog.show()
    }
  }

  onAlbumContextMenu(event: ItemClickEvent) {
    // Prevent default behavior to avoid opening the default context menu
    event.preventDefault()
    this.hideAllContextMenus()
    const {musicLibrary} = this.rootStore
    const albumId = getDatasetValue(event, 'albumId')
    if (!albumId) {
      return
    }
    if (musicLibrary.albumSelected !== albumId) {
      musicLibrary.assign({albumSelected: albumId, songSelected: ''})
    }
    const album = musicLibrary.indexedAlbums[albumId]
    if (album) {
      Object.assign(this.albumContextMenu, {x: event.clientX, y: event.clientY, data: album})
      this.albumMenuDialog.show()
    }
  }

  onArtistContextMenu(event: ItemClickEvent) {
    // Prevent default behavior to avoid opening the default context menu
    event.preventDefault()
    this.hideAllContextMenus()
    const {musicLibrary} = this.rootStore
    const artistId = getDatasetValue(event, 'artistId')
    if (!artistId) {
      return
    }
    if (musicLibrary.artistSelected !== artistId) {
      musicLibrary.assign({artistSelected: artistId})
    }
    const artist = musicLibrary.indexedArtists[artistId]
    if (artist) {
      Object.assign(this.artistContextMenu, {x: event.clientX, y: event.clientY, data: artist})
      this.artistMenuDialog.show()
    }
  }

  hideAllContextMenus() {
    this.songMenuDialog.visible && this.songMenuDialog.hide()
    this.albumMenuDialog.visible && this.albumMenuDialog.hide()
    this.artistMenuDialog.visible && this.artistMenuDialog.hide()
  }

  destroyVM() {
    this.stopRevealArtist()
    this.rootStore.uiStore.dialogs.remove([
      this.songDetailsDialog,
      this.songMenuDialog,
      this.albumMenuDialog,
      this.artistMenuDialog,
    ])
    document.removeEventListener('click', this.hideAllContextMenus)
  }

  constructor({rootStore}: {rootStore: RootStore}) {
    this.rootStore = rootStore
    this.musicLibrary = rootStore.musicLibrary
    this.set = store.setMethod<MusicLibraryVM>(this)
    this.assign = store.assignMethod<MusicLibraryVM>(this)
    makeAutoObservable(this, {rootStore: false, musicLibrary: false}, {autoBind: true, deep: false})

    this.songDetailsDialog = rootStore.uiStore.dialogs.create({transition: zoomTransition})
    this.songMenuDialog = rootStore.uiStore.dialogs.create({transition: zoomTransition})
    this.albumMenuDialog = rootStore.uiStore.dialogs.create({transition: zoomTransition})
    this.artistMenuDialog = rootStore.uiStore.dialogs.create({transition: zoomTransition})

    this.stopRevealArtist = reaction(
      () => this.rootStore.musicLibrary.filter,
      (filter) => setTimeout(() => !filter && revealByPriority(this.rootStore), 200)
    )
    document.addEventListener('click', this.hideAllContextMenus)
  }
}
