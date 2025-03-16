import * as store from '@lib/mobx/store.helpers'
import {isAlbumCoverDetails} from '@rootsrc/types/Cover'
import type {Album, Artist, Song} from '@rootsrc/types/MusicLibrary.types'
import type {ScanProgress} from '@rootsrc/types/ScanProgress'
import {debounce, groupBy} from 'lodash'
import {keyBy} from 'lodash'
import {type IReactionDisposer, action, makeAutoObservable, reaction} from 'mobx'
import {
  getSongListFromFolder,
  sortArtistsByName,
  sortSongsByDiskAndTrack,
} from './MusicLibrary.helpers'

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
  stopUpdateAlbumCovers: IReactionDisposer
  scanProgress: ScanProgress = {completed: 0, total: 0, status: 'idle'}

  artistSelected = ''
  albumSelected = ''
  /** filePath of the song that is currently selected */
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
      return this.indexedArtists[this.artistSelected].albums
        .map((albumId) => this.indexedAlbums[albumId])
        .sort((a, b) => a.year - b.year)
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

  private async _updateAlbumCovers(albums: Album[]) {
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

  updateAlbumCovers = debounce((albums: Album[]) => this._updateAlbumCovers(albums), 200, {
    trailing: true,
  })

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
    this.scanProgress = {completed: 0, total: 0, status: 'idle'}

    const stats = {
      before: {
        artistCount: this.artists.length,
        albumCount: this.albums.length,
        songCount: this.songs.length,
      },
      after: {
        artistCount: 0,
        albumCount: 0,
        songCount: 0,
      },
    }

    const {folderPath, songs, artists, albums} = await getSongListFromFolder()
    this.folderPath = folderPath

    const newArtistsMap = new Map(artists.map((artist) => [artist.id, artist]))
    const newAlbumsMap = new Map(albums.map((album) => [album.id, album]))

    // Keep songs that are outside the folder that was scanned
    for (const song of this.songs) {
      if (!song.filePath.startsWith(folderPath)) {
        songs.push(song)
        if (!newArtistsMap.has(song.artistId)) {
          newArtistsMap.set(song.artistId, this.indexedArtists[song.artistId])
        }
        if (!newAlbumsMap.has(song.albumId)) {
          newAlbumsMap.set(song.albumId, this.indexedAlbums[song.albumId])
        }
      }
    }

    // Convert to sorted arrays and update state
    const sortedArtists = Array.from(newArtistsMap.values()).sort(sortArtistsByName)
    const sortedAlbums = Array.from(newAlbumsMap.values()).sort((a, b) => a.year - b.year)
    const artistSelected = sortedArtists[0]?.id ?? ''

    stats.after.artistCount = sortedArtists.length
    stats.after.albumCount = sortedAlbums.length
    stats.after.songCount = songs.length

    this.assign({
      songs,
      artists: sortedArtists,
      albums: sortedAlbums,
      artistSelected,
      albumSelected: '',
      songSelected: '',
    })

    // Update album covers for the selected artist
    if (artistSelected) {
      setTimeout(() => {
        const albumsWithoutCover = sortedAlbums.filter(
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
    this.stopUpdateAlbumCovers()

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

    // Update album covers when the artist selected changes
    this.stopUpdateAlbumCovers = reaction(
      () => this.artistSelected,
      (artistSelected) => {
        if (artistSelected) {
          const artist = this.indexedArtists[artistSelected]
          if (artist) {
            const albumsWithoutCover = artist.albums.reduce((acc: Album[], albumId) => {
              const album = this.indexedAlbums[albumId]
              if (album) {
                !album.coverExtension && acc.push(album)
              } else {
                console.error('album not found for cover update', {albumId, artistSelected, artist})
              }
              return acc
            }, [])
            this.updateAlbumCovers(albumsWithoutCover)
          }
        }
      },
      {name: 'updateAlbumCovers'}
    )
  }
}
