import * as store from '@lib/mobx/store.helpers'
import {hasOneItemMin} from '@rootsrc/lib/array'
import type {CoverExtractResult} from '@rootsrc/types/Cover'
import type {Album, Artist, AudioLibrary, Song} from '@rootsrc/types/MusicLibrary.types'
import type {ScanProgress} from '@rootsrc/types/ScanProgress'
import {debounce, groupBy} from 'lodash'
import {keyBy} from 'lodash'
import {type IReactionDisposer, action, makeAutoObservable, reaction} from 'mobx'
import {
  getSongListFromFolder,
  getSongsToExtractCoverFrom,
  sortArtistsByName,
  sortSongsByDiskAndTrack,
} from './MusicLibrary.helpers'
import type {RootStore} from './RootStore'

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
  saveAfterCoverUpdateTimer: NodeJS.Timeout | null = null

  artistSelected = ''
  albumSelected = ''
  /** filePath of the song that is currently selected */
  songSelected = ''
  rootStore: RootStore

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

  /**
   * Returns a map of album ids to sorted songs
   * Songs are already sorted by disk number and track number
   * `{[albumId]: [song1, song2, ...]}`
   */
  get indexedSongsByAlbum(): Record<string, Song[]> {
    const byAlbum = groupBy(this.songs, 'albumId')
    for (const album of this.albums) {
      const songs = byAlbum[album.id] || []
      if (songs.length > 0) {
        console.warn('No songs found for album', album)
      }
      byAlbum[album.id] = songs.sort(sortSongsByDiskAndTrack)
    }
    return byAlbum
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
    const artist = this.indexedArtists[this.artistSelected]
    if (artist) {
      return artist.albums
        .map((albumId) => this.indexedAlbums[albumId])
        .filter((album) => !!album)
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

  /**
   * Schedule a save of the library after cover updates
   * Cover can update often so it's a compromise because we currently always send the entire library to the main process for saving
   * TODO: we should improve this process
   */
  private scheduleSaveAfterCoverUpdate() {
    if (this.saveAfterCoverUpdateTimer) {
      clearTimeout(this.saveAfterCoverUpdateTimer)
    }
    this.saveAfterCoverUpdateTimer = setTimeout(
      () => {
        this.saveLibrary()
      },
      5 * 60 * 1000
    )
  }

  /**
   * Update the cover of the given albums
   */
  private async _updateAlbumCovers(albums: Album[]) {
    const {songs, albumsMissingSongs} = getSongsToExtractCoverFrom(albums, this.indexedSongsByAlbum)

    if (albumsMissingSongs.length > 0) {
      console.error('No song found for albums', albumsMissingSongs)
    }

    // Request covers to be extracted from the songs (TODO: typesafety electron messages)
    const results: CoverExtractResult[] = await window.electron.ipcRenderer.invoke(
      'extractCoverFromSongs',
      songs
    )

    // Update the albums with the new cover
    const indexedUpdatedAlbums = results.reduce((acc: Record<string, Album>, coverResult) => {
      const {cover, albumId} = coverResult
      const album = this.indexedAlbums[albumId]
      if (cover && album) {
        acc[albumId] = {...album, coverExtension: cover.fileExtension}
      } else if (coverResult.error) {
        console.error('Failed to extract cover for album', albumId, coverResult.error)
      }
      return acc
    }, {})

    this.assign({albums: this.albums.map((album) => indexedUpdatedAlbums[album.id] ?? album)})

    const erroredAlbums = results.find((album) => !!album.error)
    if (erroredAlbums) {
      this.rootStore.showHandledError({
        title: 'Failed to update album covers',
        description: '',
        error: erroredAlbums.error,
      })
    }

    this.scheduleSaveAfterCoverUpdate()
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

  getAlbumSongs(albumId: string): Song[] {
    const songs = this.indexedSongsByAlbum[albumId] || []
    if (songs.length === 0) {
      console.warn('No songs found for album', albumId)
    }
    return songs
  }

  getArtistSongs(artistId: string): Song[] {
    const songsByAlbum = groupBy(
      this.songs.filter((song) => song.artistId === artistId).sort(sortSongsByDiskAndTrack),
      'albumId'
    )
    return Object.entries(songsByAlbum)
      .sort(([a], [b]) => (this.indexedAlbums[a]?.year ?? 0) - (this.indexedAlbums[b]?.year ?? 0))
      .flatMap(([_, songs]) => songs)
  }

  getArtistAlbums(artistId: string): Album[] {
    const artist = this.indexedArtists[artistId]
    if (!artist) {
      return []
    }
    return artist.albums.reduce((acc: Album[], albumId) => {
      const album = this.indexedAlbums[albumId]
      if (album) {
        acc.push(album)
      }
      return acc
    }, [])
  }

  /**
   * Get songs grouped by album for an artist, sorted by album year
   */
  getArtistSongsByAlbum(artistId: string): [Album, Song[]][] {
    const artist = this.indexedArtists[artistId]
    if (!artist) {
      return []
    }
    const artistAlbums = this.getArtistAlbums(artistId).sort((a, b) => a.year - b.year)
    return artistAlbums.map((album) => [album, this.getAlbumSongs(album.id)])
  }

  /**
   * Used when the filter is active and an album is selected
   */
  getAlbumAndSongs(albumId: string): [Album, Song[]][] {
    const album = this.indexedAlbums[albumId]
    const songs = this.indexedSongsByAlbum[albumId] || []
    if (!album) {
      console.warn('No album found for albumId', album)
      return []
    }
    return [[album, songs]]
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

  /**
   * Save the current music library to a JSON file
   */
  async saveLibrary(): Promise<boolean> {
    try {
      const library = {
        artists: this.artists,
        albums: this.albums,
        songs: this.songs,
      }
      return await window.electron.ipcRenderer.invoke('saveMusicLibrary', library)
    } catch (error) {
      console.error('Failed to save music library:', error)
      return false
    }
  }

  /**
   * Load the music library from a JSON file
   */
  async loadLibrary(): Promise<boolean> {
    // TODO: need to look into typesafety of electron messages
    const library: AudioLibrary | null =
      await window.electron.ipcRenderer.invoke('loadMusicLibrary')

    if (!library) {
      console.log('No saved music library found')
      return false
    }

    this.assign({
      artists: library.artists,
      albums: library.albums,
      songs: library.songs,
      artistSelected: hasOneItemMin(library.artists) ? library.artists[0].id : '',
      albumSelected: '',
      songSelected: '',
    })

    return true
  }

  async selectAndLoadFromFolder() {
    const selectedPath: string = await window.electron.ipcRenderer.invoke('selectDirectory')
    if (!selectedPath) {
      return
    }
    await this.loadFromFolder(selectedPath)
  }

  async loadFromFolder(selectedPath: string, selectedArtistId?: string) {
    if (!selectedPath) {
      return
    }
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

    const {folderPath, songs, artists, albums} = await getSongListFromFolder(selectedPath)

    if (!folderPath) {
      // User cancelled the dialog probably
      return
    }

    this.folderPath = folderPath

    const newArtistsMap = new Map(artists.map((artist) => [artist.id, artist]))
    const newAlbumsMap = new Map(albums.map((album) => [album.id, album]))

    // Keep songs that are outside the folder that was scanned
    for (const song of this.songs) {
      if (!song.filePath.startsWith(folderPath)) {
        songs.push(song)
        const updatedArtist = newArtistsMap.get(song.artistId)
        if (!updatedArtist) {
          const artist = this.indexedArtists[song.artistId]
          if (artist) {
            newArtistsMap.set(song.artistId, artist)
          }
        } else {
          // Preserve existing artist albums
          const currentArtist = this.indexedArtists[song.artistId]
          if (currentArtist && !updatedArtist.albums.includes(song.albumId)) {
            updatedArtist.albums.push(song.albumId)
          }
        }
        if (!newAlbumsMap.has(song.albumId)) {
          const album = this.indexedAlbums[song.albumId]
          if (album) {
            newAlbumsMap.set(song.albumId, album)
          }
        }
      }
    }

    // Convert to sorted arrays and update state
    const sortedArtists = Array.from(newArtistsMap.values()).sort(sortArtistsByName)
    const sortedAlbums = Array.from(newAlbumsMap.values()).sort((a, b) => a.year - b.year)
    const artistSelected =
      selectedArtistId && newArtistsMap.has(selectedArtistId)
        ? selectedArtistId
        : sortedArtists[0]?.id || ''

    // Remove albums that don't exist anymore in the Unknown Artist
    // eg: tags were updated and now what was unknown album / artist is known
    const unknownArtist = sortedArtists.find((artist) => artist.name === 'Unknown Artist')
    if (unknownArtist) {
      unknownArtist.albums = unknownArtist.albums.filter((albumId) => newAlbumsMap.has(albumId))
    }

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

    // Save the library after loading from folder
    this.saveLibrary()
  }

  /**
   * Reset the scan progress
   */
  resetProgress() {
    this.scanProgress = {completed: 0, total: 0, status: 'idle'}
  }

  clearLibrary() {
    this.artists = []
    this.albums = []
    this.songs = []
    this.folderPath = ''
    this.artistSelected = ''
    this.albumSelected = ''
    this.songSelected = ''
    this.resetProgress()
    this.saveLibrary()
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
    this.resetProgress()
  }

  constructor(rootStore: RootStore) {
    makeAutoObservable(this, undefined, {deep: false, autoBind: true})
    this.rootStore = rootStore
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
