import * as store from '@lib/mobx/store.helpers'
import {getDatasetValue} from '@rootsrc/lib/dom/getDatasetValue'
import type {Album, Artist, Song} from '@rootsrc/types/MusicLibrary.types'
import {revealByPriority} from '@src/lib/musicLibrary'
import type {RootStore} from '@src/stores'
import type {DialogVM} from '@ui'
import {type IReactionDisposer, makeAutoObservable, reaction} from 'mobx'
import {zoomTransition} from '../../config'
import type {ContextMenuState} from './shared/ContextMenu'

export class MusicLibraryVM {
  rootStore: RootStore
  set: store.SetMethod<MusicLibraryVM>
  assign: store.AssignMethod<MusicLibraryVM>
  stopRevealArtist: IReactionDisposer
  songDetailsDialog: DialogVM
  songMenuDialog: DialogVM
  albumMenuDialog: DialogVM
  artistMenuDialog: DialogVM

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
    return (
      !!this.rootStore.musicLibrary.artistSelected && !this.rootStore.musicLibrary.albumSelected
    )
  }

  get groupedSongsByAlbum(): [Album, Song[]][] {
    const {musicLibrary} = this.rootStore
    return this.shouldGroupByAlbum ? musicLibrary.getSongsByAlbum(musicLibrary.artistSelected) : []
  }

  /**
   * Handle artist clicks
   * - single click selects the artist
   * - double click plays all songs by the artist
   */
  onArtistClick(event: React.MouseEvent<HTMLDivElement>) {
    const {musicLibrary, musicPlayer} = this.rootStore
    const artistId = getDatasetValue(event, 'artistId')
    const clickCount = event.detail
    if (!artistId) {
      return
    }
    if (clickCount === 1) {
      const artistSelected =
        musicLibrary.filter && musicLibrary.artistSelected === artistId ? '' : artistId
      musicLibrary.assign({artistSelected, albumSelected: '', songSelected: ''})
    } else if (clickCount === 2) {
      musicLibrary.assign({artistSelected: artistId, albumSelected: '', songSelected: ''})
      musicPlayer.replacePlaylistAndPlay(musicLibrary.getArtistSongs(artistId))
    }
  }

  /**
   * Handle album clicks
   * - single click selects the album
   * - double click plays all songs in the album
   */
  onAlbumClick(event: React.MouseEvent<HTMLDivElement>) {
    const {musicLibrary, musicPlayer} = this.rootStore
    const albumId = getDatasetValue(event, 'albumId')
    const clickCount = event.detail
    if (!albumId) {
      return
    }
    if (clickCount === 1) {
      const albumSelected = albumId === musicLibrary.albumSelected ? '' : albumId
      musicLibrary.assign({albumSelected, songSelected: ''})
    } else if (clickCount === 2) {
      musicLibrary.assign({albumSelected: albumId, songSelected: ''})
      musicPlayer.replacePlaylistAndPlay(musicLibrary.getAlbumSongs(albumId))
    }
  }

  /**
   * Handle song clicks
   * - single click selects the song
   * - double click plays the song
   */
  onSongClick(event: React.MouseEvent<HTMLDivElement>) {
    const {musicLibrary, musicPlayer} = this.rootStore
    const filePath = getDatasetValue(event, 'filePath')
    const clickCount = event.detail
    if (!filePath) {
      return
    }
    if (clickCount === 1) {
      const songSelected = filePath === musicLibrary.songSelected ? '' : filePath
      musicLibrary.assign({songSelected})
    } else if (clickCount === 2) {
      musicLibrary.assign({songSelected: filePath})
      musicPlayer.replacePlaylistAndPlay(musicLibrary.getSong(filePath))
    }
  }

  onSongContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    // Prevent default behavior to avoid opening the default context menu
    event.preventDefault()
    const {musicLibrary} = this.rootStore
    const filePath = getDatasetValue(event, 'filePath')

    if (!filePath) {
      return
    }

    if (musicLibrary.songSelected !== filePath) {
      musicLibrary.selectSong(filePath)
    }
    // Find the song by file path
    const song = musicLibrary.songs.find((s) => s.filePath === filePath)
    if (song) {
      Object.assign(this.songContextMenu, {x: event.clientX, y: event.clientY, data: song})
      this.songMenuDialog.show()
    }
  }

  onAlbumContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    // Prevent default behavior to avoid opening the default context menu
    event.preventDefault()
    const {musicLibrary} = this.rootStore
    const albumId = getDatasetValue(event, 'albumId')
    if (!albumId) {
      return
    }
    if (musicLibrary.albumSelected !== albumId) {
      musicLibrary.selectAlbum(albumId)
    }
    const album = musicLibrary.indexedAlbums[albumId]
    if (album) {
      Object.assign(this.albumContextMenu, {x: event.clientX, y: event.clientY, data: album})
      this.albumMenuDialog.show()
    }
  }

  onArtistContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    // Prevent default behavior to avoid opening the default context menu
    event.preventDefault()
    const {musicLibrary} = this.rootStore
    const artistId = getDatasetValue(event, 'artistId')
    if (!artistId) {
      return
    }
    if (musicLibrary.artistSelected !== artistId) {
      musicLibrary.selectArtist(artistId)
    }
    const artist = musicLibrary.indexedArtists[artistId]
    if (artist) {
      Object.assign(this.artistContextMenu, {x: event.clientX, y: event.clientY, data: artist})
      this.artistMenuDialog.show()
    }
  }

  onDocumentClick() {
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
    document.removeEventListener('click', this.onDocumentClick)
  }

  constructor({rootStore}: {rootStore: RootStore}) {
    this.rootStore = rootStore
    this.set = store.setMethod<MusicLibraryVM>(this)
    this.assign = store.assignMethod<MusicLibraryVM>(this)
    makeAutoObservable(this, {rootStore: false}, {autoBind: true, deep: false})

    this.songDetailsDialog = rootStore.uiStore.dialogs.create({transition: zoomTransition})
    this.songMenuDialog = rootStore.uiStore.dialogs.create({transition: zoomTransition})
    this.albumMenuDialog = rootStore.uiStore.dialogs.create({transition: zoomTransition})
    this.artistMenuDialog = rootStore.uiStore.dialogs.create({transition: zoomTransition})

    this.stopRevealArtist = reaction(
      () => this.rootStore.musicLibrary.filter,
      (filter) => setTimeout(() => !filter && revealByPriority(this.rootStore), 200)
    )
    document.addEventListener('click', this.onDocumentClick)
  }
}
