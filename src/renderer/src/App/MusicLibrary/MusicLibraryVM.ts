import * as store from '@lib/mobx/store.helpers'
import {getDatasetValue} from '@rootsrc/lib/dom/getDatasetValue'
import type {Album, Artist, Song} from '@rootsrc/types/MusicLibrary.types'
import {findSongsFolders, revealByPriority} from '@src/lib/musicLibrary'
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
  refreshDialog: DialogVM
  clickTimers: {[key: string]: NodeJS.Timeout} = {}
  refresh = {
    folders: [] as string[],
    artistId: '',
    folderSelected: '',
  }

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

  // Define context menu configurations
  private contextMenuHandlers = {
    artist: {
      getIdFromEvent: (event: ItemClickEvent) => getDatasetValue(event, 'artistId'),
      getData: (id: string) => this.musicLibrary.indexedArtists[id],
      onSelect: (id: string) => this.musicLibrary.assign({artistSelected: id}),
      menuState: () => this.artistContextMenu,
      dialog: () => this.artistMenuDialog,
    },
    song: {
      getIdFromEvent: (event: ItemClickEvent) => getDatasetValue(event, 'filePath'),
      getData: (id: string) => this.musicLibrary.songs.find((s) => s.filePath === id),
      onSelect: (id: string) => this.musicLibrary.assign({songSelected: id}),
      menuState: () => this.songContextMenu,
      dialog: () => this.songMenuDialog,
    },
    album: {
      getIdFromEvent: (event: ItemClickEvent) => getDatasetValue(event, 'albumId'),
      getData: (id: string) => this.musicLibrary.indexedAlbums[id],
      onSelect: (id: string) => this.musicLibrary.assign({albumSelected: id, songSelected: ''}),
      menuState: () => this.albumContextMenu,
      dialog: () => this.albumMenuDialog,
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
      {
        icon: 'refresh',
        label: 'Refresh',
        onClick: () => {
          const {data} = this.artistContextMenu
          data && this.showRefreshDialog(data)
          this.artistMenuDialog.hide()
        },
      },
    ],
  }

  get shouldGroupByAlbum() {
    const {artistSelected, albumSelected} = this.rootStore.musicLibrary
    return (!!artistSelected && !albumSelected) || !!albumSelected
  }

  get groupedSongsByAlbum(): [Album, Song[]][] {
    const {musicLibrary} = this.rootStore
    if (!this.shouldGroupByAlbum) {
      return []
    }
    if (musicLibrary.albumSelected) {
      return musicLibrary.getAlbumAndSongs(musicLibrary.albumSelected)
    }
    return musicLibrary.getArtistSongsByAlbum(musicLibrary.artistSelected)
  }

  showRefreshDialog(artist: Artist) {
    const songs = this.rootStore.musicLibrary.getArtistSongs(artist.id)
    const {artistFolder, parentFolders} = findSongsFolders(artist, songs)
    this.assign({
      refresh: {
        folders: parentFolders,
        folderSelected: artistFolder || parentFolders[1] || parentFolders[0] || '',
        artistId: artist.id,
      },
    })
    this.refreshDialog.show()
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

  /**
   * Generic context menu handler to manage context menu behavior consistently
   */
  private onContextMenu(event: ItemClickEvent, type: 'artist' | 'album' | 'song') {
    event.preventDefault()
    this.hideAllContextMenus()

    const handler = this.contextMenuHandlers[type]
    const id = handler.getIdFromEvent(event)
    if (!id) {
      return
    }

    handler.onSelect(id)

    const data = handler.getData(id)
    if (data) {
      Object.assign(handler.menuState(), {x: event.clientX, y: event.clientY, data})
      handler.dialog().show()
    }
  }

  onSongContextMenu(event: ItemClickEvent) {
    this.onContextMenu(event, 'song')
  }

  onAlbumContextMenu(event: ItemClickEvent) {
    this.onContextMenu(event, 'album')
  }

  onArtistContextMenu(event: ItemClickEvent) {
    this.onContextMenu(event, 'artist')
  }

  hideAllContextMenus() {
    this.songMenuDialog.visible && this.songMenuDialog.hide()
    this.albumMenuDialog.visible && this.albumMenuDialog.hide()
    this.artistMenuDialog.visible && this.artistMenuDialog.hide()
  }

  selectRefreshFolder(folderSelected: string) {
    this.assign({refresh: {...this.refresh, folderSelected}})
  }

  refreshArtist() {
    this.refreshDialog.hide(() => {
      const {artistId} = this.refresh
      if (this.musicLibrary.artistSelected === artistId) {
        this.musicLibrary.assign({artistSelected: '', albumSelected: '', songSelected: ''})
      }
      this.rootStore.musicLibrary.loadFromFolder(this.refresh.folderSelected, artistId)
    })
  }

  destroyVM() {
    this.stopRevealArtist()
    this.rootStore.uiStore.dialogs.remove([
      this.songDetailsDialog,
      this.songMenuDialog,
      this.albumMenuDialog,
      this.artistMenuDialog,
      this.refreshDialog,
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
    this.refreshDialog = rootStore.uiStore.dialogs.create({transition: zoomTransition})

    this.stopRevealArtist = reaction(
      () => this.rootStore.musicLibrary.filter,
      (filter) => setTimeout(() => !filter && revealByPriority(this.rootStore), 200)
    )
    document.addEventListener('click', this.hideAllContextMenus)
  }
}
