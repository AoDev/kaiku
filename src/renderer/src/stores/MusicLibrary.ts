import * as store from '@lib/mobx/store.helpers'
import {isAlbumCoverDetails} from '@rootsrc/types/Cover'
import type {ScanProgress} from '@rootsrc/types/ScanProgress'
import type {Album, Artist, AudioLibrary, Song} from '@rootsrc/types/Song'
import {debounce} from 'lodash'
import {keyBy} from 'lodash'
import {action, makeAutoObservable} from 'mobx'

const compareArtistName = new Intl.Collator('en', {sensitivity: 'base'}).compare

// This list is there to be able to ignore variants of characters in searches.
const CHAR_RANGES = {
  a: '[aáäâàå]',
  e: '[eéëêè]',
  i: '[iíïîì]',
  o: '[oöô]',
  u: '[uüû]',
  y: '[yýÝ]',
  l: '[lł]',
}

async function getSongListFromFolder(): Promise<
  AudioLibrary & {
    folderPath: string
  }
> {
  try {
    const selectedPath: string = await window.electron.ipcRenderer.invoke('selectDirectory')
    if (selectedPath) {
      // Automatically list files after selection
      const audioLibrary: AudioLibrary = await window.electron.ipcRenderer.invoke(
        'listAudioFiles',
        selectedPath,
      )
      return {folderPath: selectedPath, ...audioLibrary}
    }
    return {folderPath: '', songs: [], artists: [], albums: []}
  } catch (error) {
    console.error('Error selecting directory:', error)
    return {folderPath: '', songs: [], artists: [], albums: []}
  }
}

export class MusicLibrary {
  assign: store.AssignMethod<MusicLibrary>
  artists: Artist[] = []
  albums: Album[] = []
  songs: Song[] = []
  folderPath = ''
  filter: RegExp | null = null

  scanProgress: ScanProgress = {completed: 0, total: 0, status: 'idle'}

  artistSelected = ''
  albumSelected = ''
  songSelected = ''

  artistPlaying: Artist | null = null
  albumPlaying: Album | null = null
  songPlaying: Song | null = null

  get filteredArtists() {
    const filter = this.filter
    if (!filter) {
      return this.artists
    }
    return this.artists.filter((artist) => filter.test(artist.name))
  }

  get filteredSongs() {
    if (this.albumSelected) {
      return this.songs.filter((song) => song.albumId === this.albumSelected)
    }

    if (this.artistSelected) {
      return this.songs.filter((song) => song.artistId === this.artistSelected)
    }

    const filter = this.filter
    if (filter) {
      return this.songs.filter((song) => filter.test(song.title))
    }

    // Avoid displaying all songs if, for some mistake, there is no
    // filtering criteria.
    return []
  }

  get filteredAlbums() {
    if (this.artistSelected) {
      return this.albums.filter((album) => album.artistId === this.artistSelected)
    }

    const filter = this.filter
    if (filter) {
      return this.albums.filter((album) => filter.test(album.name))
    }

    return this.albums
  }

  // Cleanup function for IPC listeners
  private cleanupListeners: (() => void) | null = null

  selectAlbum(albumId: string) {
    this.albumSelected = this.albumSelected === albumId ? '' : albumId
  }

  async updateAlbumCovers(albums: Album[]) {
    for (const album of albums) {
      const song = this.songs.find((song) => song.albumId === album.id)
      if (song) {
        const cover = await window.electron.ipcRenderer.invoke('extractCoverFromSong', song)
        if (isAlbumCoverDetails(cover)) {
          album.coverExtension = cover.fileExtension
        }
      }
    }
    const indexedUpdatedAlbums = keyBy(albums, 'id')
    this.assign({albums: this.albums.map((album) => indexedUpdatedAlbums[album.id] ?? album)})
  }

  async selectArtist(artistId: string) {
    this.assign({artistSelected: artistId, albumSelected: ''})

    const albumsWithoutCover = this.albums.filter(
      (album) => album.artistId === artistId && !album.coverExtension,
    )
    this.updateAlbumCovers(albumsWithoutCover)
  }

  selectSong(filePath: string) {
    this.songSelected = filePath
  }

  setFilter(filter: string) {
    if (filter.length < 2) {
      this.filter = null
      this.artistSelected = this.artists[0]?.id || ''
      this.albumSelected = ''
      this.songSelected = ''
      return
    }

    const utf8Filter = Array.prototype.map
      .call(filter, (char) => {
        return CHAR_RANGES[char] ? CHAR_RANGES[char] : char
      })
      .join('')

    this.filter = new RegExp(utf8Filter, 'i')
    this.artistSelected = ''
    this.albumSelected = ''
    this.songSelected = ''
  }

  setFilterDebounced = debounce(
    (filter: string) => {
      this.setFilter(filter)
    },
    300,
    {trailing: true},
  )

  // Setup IPC listeners for scan progress updates
  setupScanProgressListener() {
    this.cleanupListeners?.()

    const scanListener = window.electron.ipcRenderer.on(
      'scan-progress-update',
      action((_event, progress: ScanProgress) => {
        this.scanProgress = progress
      }),
    )

    this.cleanupListeners = () => {
      scanListener()
    }
  }

  async loadFromFolder() {
    this.setupScanProgressListener()

    // Reset scan progress
    this.scanProgress = {completed: 0, total: 0, status: 'idle'}

    const {folderPath, songs, artists, albums} = await getSongListFromFolder()
    this.folderPath = folderPath

    // Create indexes using plain objects
    const songIndex: Record<string, Song> = {}
    const artistIndex: Record<string, Artist> = {}
    const albumIndex: Record<string, Album> = {}

    // Index existing items
    for (const song of this.songs) {
      songIndex[song.filePath] = song
    }

    for (const artist of this.artists) {
      artistIndex[artist.id] = artist
    }

    for (const album of this.albums) {
      albumIndex[album.id] = album
    }

    // Update with new items
    for (const song of songs) {
      songIndex[song.filePath] = song
    }

    for (const artist of artists) {
      artistIndex[artist.id] = artist
    }

    for (const album of albums) {
      albumIndex[album.id] = album
    }

    // Update the collections with the indexed items
    this.songs = Object.values(songIndex)
    this.artists = Object.values(artistIndex).sort((a, b) => compareArtistName(a.name, b.name))
    this.albums = Object.values(albumIndex)

    // Ensure status is set to complete when done
    this.scanProgress.status = 'complete'
    this.artistSelected = this.artists[0]?.id ?? ''
    this.albumSelected = ''
    this.songSelected = ''
  }

  resetProgress() {
    this.scanProgress = {completed: 0, total: 0, status: 'idle'}
  }

  destroy() {
    // Clean up listeners
    this.cleanupListeners?.()
    this.cleanupListeners = null

    this.artists = []
    this.albums = []
    this.songs = []
    this.folderPath = ''
    this.artistSelected = ''
    this.albumSelected = ''
    this.songSelected = ''
    this.artistPlaying = null
    this.albumPlaying = null
    this.songPlaying = null
    this.resetProgress()
  }

  constructor() {
    makeAutoObservable(this, undefined, {deep: false, autoBind: true})
    this.assign = store.assignMethod<MusicLibrary>(this)
    this.setupScanProgressListener()
  }
}
