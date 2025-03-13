import * as store from '@lib/mobx/store.helpers'
import {getDatasetValue} from '@rootsrc/lib/dom/getDatasetValue'
import type {Album, Song} from '@rootsrc/types/MusicLibrary.types'
import {revealByPriority} from '@src/lib/musicLibrary'
import type {RootStore} from '@src/stores'
import type {DialogVM, IconName} from '@ui'
import {type IReactionDisposer, makeAutoObservable, reaction} from 'mobx'
import {zoomTransition} from '../../config'

export class MusicLibraryVM {
  rootStore: RootStore
  set: store.SetMethod<MusicLibraryVM>
  assign: store.AssignMethod<MusicLibraryVM>
  stopRevealArtist: IReactionDisposer
  songDetailsDialog: DialogVM
  songMenuDialog: DialogVM
  songContextMenu: {x: number; y: number; song?: Song} = {x: 0, y: 0}

  songMenuItems: {icon: IconName; label: string; onClick: () => void}[] = [
    {
      icon: 'plus',
      label: 'Add to Playlist',
      onClick: () => {
        const {song} = this.songContextMenu
        if (song) {
          this.rootStore.musicPlayer.addToPlaylist([song])
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
  ]

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
      this.songContextMenu = {x: event.clientX, y: event.clientY, song}
      this.songMenuDialog.show()
    }
  }

  onDocumentClick() {
    this.songMenuDialog.visible && this.songMenuDialog.hide()
  }

  destroyVM() {
    this.stopRevealArtist()
    this.rootStore.uiStore.dialogs.remove([this.songDetailsDialog, this.songMenuDialog])
    document.removeEventListener('click', this.onDocumentClick)
  }

  constructor({rootStore}: {rootStore: RootStore}) {
    this.rootStore = rootStore
    this.set = store.setMethod<MusicLibraryVM>(this)
    this.assign = store.assignMethod<MusicLibraryVM>(this)
    makeAutoObservable(this, {rootStore: false}, {autoBind: true, deep: false})
    this.songDetailsDialog = rootStore.uiStore.dialogs.create({transition: zoomTransition})
    this.songMenuDialog = rootStore.uiStore.dialogs.create({transition: zoomTransition})

    this.stopRevealArtist = reaction(
      () => this.rootStore.musicLibrary.filter,
      (filter) => setTimeout(() => !filter && revealByPriority(this.rootStore), 200)
    )
    document.addEventListener('click', this.onDocumentClick)
  }
}
