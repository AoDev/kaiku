import * as store from '@lib/mobx/store.helpers'
import {isAlbumCoverDetails} from '@rootsrc/types/Cover'
import type {Album, Artist, Song} from '@rootsrc/types/MusicLibrary.types'
import type {ScanProgress} from '@rootsrc/types/ScanProgress'
import {debounce, groupBy} from 'lodash'
import {keyBy} from 'lodash'
import {action, makeAutoObservable} from 'mobx'
import {getSongListFromFolder, sortSongsByDiskAndTrack} from './MusicLibrary.helpers'

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
  // filePath of the song that is currently selected
  songSelected = ''

  artistPlaying: Artist | null = null
  albumPlaying: Album | null = null
  songPlaying: Song | null = null

  get indexedAlbums() {
    return keyBy(this.albums, 'id')
  }

  get indexedArtists() {
    return keyBy(this.artists, 'id')
  }

  get filteredArtists() {
    const filter = this.filter
    return filter ? this.artists.filter((artist) => filter.test(artist.name)) : this.artists
  }

  get filteredSongs() {
    if (this.albumSelected) {
      return this.getAlbumSongs(this.albumSelected)
    }

    if (this.artistSelected) {
      return this.getArtistSongs(this.artistSelected)
    }

    const filter = this.filter
    if (filter) {
      return this.songs.filter((song) => filter.test(song.title))
    }

    if (this.songSelected) {
      return this.songs.filter((song) => song.filePath === this.songSelected)
    }

    // Avoid displaying all songs if there is no filtering criteria.
    return []
  }

  get filteredAlbums() {
    if (this.artistSelected) {
      return this.indexedArtists[this.artistSelected].albums.map(
        (albumId) => this.indexedAlbums[albumId]
      )
    }

    const filter = this.filter
    if (filter) {
      return this.albums.filter((album) => filter.test(album.name))
    }

    if (this.albumSelected) {
      return this.albums.filter((album) => album.id === this.albumSelected)
    }

    if (this.songSelected) {
      const song = this.songs.find((song) => song.filePath === this.songSelected)
      if (song) {
        const album = this.albums.find((album) => album.id === song.albumId)
        if (album) {
          return [album]
        }
      }
    }

    // Avoid displaying all albums if there is no filtering criteria.
    return []
  }

  // Cleanup function for IPC listeners
  private cleanupListeners: (() => void) | null = null

  selectAlbum(albumId: string) {
    if (albumId === this.albumSelected && !this.filter && !this.artistSelected) {
      // Avoid deselecting album when there is no filter
      return
    }
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
    if (artistId === this.artistSelected && !this.filter) {
      // Avoid deselecting artist when there is no filter
      this.assign({albumSelected: ''})
      return
    }

    this.assign({
      artistSelected: this.artistSelected === artistId ? '' : artistId,
      albumSelected: '',
    })

    const artist = this.indexedArtists[artistId]
    if (!artist) {
      return
    }
    const albumsWithoutCover = artist.albums.reduce((acc: Album[], albumId) => {
      const album = this.indexedAlbums[albumId]
      if (!album.coverExtension) {
        acc.push(album)
      }
      return acc
    }, [])

    this.updateAlbumCovers(albumsWithoutCover)
  }

  selectSong(filePath: string) {
    this.songSelected = filePath
  }

  setFilter(filter: string) {
    if (filter.length < 2) {
      this.filter = null
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

    const albumsWithoutCover = this.filteredAlbums.filter((album) => !album.coverExtension)
    this.updateAlbumCovers(albumsWithoutCover)
  }

  setFilterDebounced = debounce(
    (filter: string) => {
      this.setFilter(filter)
    },
    300,
    {trailing: true}
  )

  getSong(filePath: string) {
    const song = this.songs.find((song) => song.filePath === filePath)
    return song ? [song] : []
  }

  getAlbumSongs(albumId: string) {
    return this.songs.filter((song) => song.albumId === albumId).sort(sortSongsByDiskAndTrack)
  }

  getArtistSongs(artistId: string) {
    const songsByAlbum = groupBy(
      this.songs.filter((song) => song.artistId === artistId).sort(sortSongsByDiskAndTrack),
      'albumId'
    )
    return Object.entries(songsByAlbum)
      .sort(([a], [b]) => this.indexedAlbums[a].year - this.indexedAlbums[b].year)
      .flatMap(([_, songs]) => songs)
  }

  /**
   * Get songs grouped by album for an artist
   */
  getSongsByAlbum(artistId: string): [Album, Song[]][] {
    const songs = this.artistSelected === artistId ? this.filteredSongs : this.songs
    const songsByAlbum = groupBy(
      songs.filter((song) => song.artistId === artistId).sort(sortSongsByDiskAndTrack),
      'albumId'
    )

    // Sort albums by year
    return Object.keys(songsByAlbum)
      .sort((a, b) => this.indexedAlbums[a].year - this.indexedAlbums[b].year)
      .map((albumId) => [this.indexedAlbums[albumId], songsByAlbum[albumId]])
  }

  // Setup IPC listeners for scan progress updates
  setupScanProgressListener() {
    this.cleanupListeners?.()

    const scanListener = window.electron.ipcRenderer.on(
      'scan-progress-update',
      action((_event, progress: ScanProgress) => {
        this.scanProgress = progress
      })
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

    const artistsUpdated = Object.values(artistIndex).sort((a, b) =>
      compareArtistName(a.name, b.name)
    )
    const artistSelected = artistsUpdated[0]?.id ?? ''

    this.assign({
      songs: Object.values(songIndex),
      artists: artistsUpdated,
      albums: Object.values(albumIndex).sort((a, b) => a.year - b.year),
      artistSelected,
      albumSelected: '',
      songSelected: '',
    })

    if (artistSelected) {
      setTimeout(() => {
        const albumsWithoutCover = this.albums.filter(
          (album) => album.artistId === artistSelected && !album.coverExtension
        )
        this.updateAlbumCovers(albumsWithoutCover)
      }, 250)
    }
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
