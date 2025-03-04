import {makeAutoObservable} from 'mobx'
import type {Artist, Album, Song, AudioLibrary} from '../../../types/Song'

// Define the scan progress type
interface ScanProgress {
  count: number
  status: 'starting' | 'scanning' | 'complete' | 'idle'
}

// Define the metadata progress type
interface MetadataProgress {
  completed: number
  total: number
  status: 'processing' | 'complete' | 'idle'
}

async function getSongListFromFolder(): Promise<
  AudioLibrary & {
    folderPath: string
  }
> {
  try {
    const selectedPath: string = await window.electron.ipcRenderer.invoke('select-directory')
    if (selectedPath) {
      // Automatically list files after selection
      const audioLibrary: AudioLibrary = await window.electron.ipcRenderer.invoke(
        'listAudioFiles',
        selectedPath
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
  artists: Artist[] = []
  albums: Album[] = []
  songs: Song[] = []
  folderPath = ''

  // Scan progress tracking
  scanProgress: ScanProgress = {
    count: 0,
    status: 'idle',
  }

  // Metadata parsing progress tracking
  metadataProgress: MetadataProgress = {
    completed: 0,
    total: 0,
    status: 'idle',
  }

  artistSelected = ''
  albumSelected = ''
  songSelected = ''

  artistPlaying: Artist | null = null
  albumPlaying: Album | null = null
  songPlaying: Song | null = null

  // Cleanup function for IPC listeners
  private cleanupListeners: (() => void) | null = null

  selectAlbum(albumId: string) {
    this.albumSelected = this.albumSelected === albumId ? '' : albumId
  }

  selectArtist(artistId: string) {
    this.artistSelected = this.artistSelected === artistId ? '' : artistId
    this.albumSelected = ''
  }

  get filteredSongs() {
    if (this.albumSelected) {
      return this.songs.filter((song) => song.albumId === this.albumSelected)
    }

    if (this.artistSelected) {
      return this.songs.filter((song) => song.artistId === this.artistSelected)
    }

    return this.songs
  }

  get filteredAlbums() {
    if (this.artistSelected) {
      return this.albums.filter((album) => album.artistId === this.artistSelected)
    }

    return this.albums
  }

  // Setup IPC listeners for scan progress updates
  setupScanProgressListener() {
    this.cleanupListeners?.()

    const scanListener = window.electron.ipcRenderer.on(
      'scan-progress-update',
      (_event, progress: ScanProgress) => {
        this.scanProgress = progress
      }
    )

    const metadataListener = window.electron.ipcRenderer.on(
      'metadata-progress-update',
      (_event, progress: MetadataProgress) => {
        this.metadataProgress = progress
      }
    )

    this.cleanupListeners = () => {
      scanListener()
      metadataListener()
    }
  }

  async loadFromFolder() {
    this.setupScanProgressListener()

    // Reset scan progress
    this.scanProgress = {count: 0, status: 'idle'}

    const {folderPath, songs, artists, albums} = await getSongListFromFolder()
    this.folderPath = folderPath
    this.songs = this.songs.concat(songs)
    this.artists = this.artists.concat(artists)
    this.albums = this.albums.concat(albums)

    // Ensure status is set to complete when done
    this.scanProgress.status = 'complete'
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
    this.scanProgress = {
      count: 0,
      status: 'idle',
    }
    this.metadataProgress = {
      completed: 0,
      total: 0,
      status: 'processing',
    }
  }

  constructor() {
    makeAutoObservable(this, undefined, {deep: false, autoBind: true})
    this.setupScanProgressListener()
  }
}
