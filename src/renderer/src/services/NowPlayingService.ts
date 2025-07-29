import type {Song} from '@rootsrc/types/MusicLibrary.types'
import {getAlbumCover} from '../config/appConfig'
import {createBlobFromImageUrl} from '../lib/image/createBlobFromImageUrl'
import type {MusicLibrary} from '../stores/MusicLibrary'
import type {MusicPlayer} from '../stores/MusicPlayerWaveSurfer'

function getImageMimeType(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    default:
      return 'image/jpeg' // A sensible default
  }
}

export class NowPlayingService {
  private musicPlayer: MusicPlayer
  private musicLibrary: MusicLibrary
  private coverFolderPath: string | null = null
  private currentArtworkUrl: string | null = null

  private onSongChanged = (song: Song) => this.updateMetadata(song)
  private onPlay = () => this.updatePlaybackState('playing')
  private onPause = () => this.updatePlaybackState('paused')
  private onStop = () => this.clearMediaSession()

  constructor(musicPlayer: MusicPlayer, musicLibrary: MusicLibrary) {
    this.musicPlayer = musicPlayer
    this.musicLibrary = musicLibrary
    this.initialize()
  }

  private async initialize() {
    this.coverFolderPath = await window.electron.ipcRenderer.invoke('getCoverFolderPath')
    this.registerListeners()
  }

  private registerListeners() {
    this.musicPlayer.events.on('songchanged', this.onSongChanged)
    this.musicPlayer.events.on('play', this.onPlay)
    this.musicPlayer.events.on('pause', this.onPause)
    this.musicPlayer.events.on('stop', this.onStop)
  }

  private async updateMetadata(song: Song) {
    if (!('mediaSession' in navigator) || !this.coverFolderPath) {
      return
    }

    // Revoke the previous artwork URL to prevent memory leaks
    if (this.currentArtworkUrl) {
      URL.revokeObjectURL(this.currentArtworkUrl)
      this.currentArtworkUrl = null
    }

    const album = this.musicLibrary.indexedAlbums[song.albumId]
    const artworkPath = getAlbumCover(album)
    const artworkBlob = await createBlobFromImageUrl(artworkPath)
    let artwork: MediaImage[] = []

    if (artworkBlob) {
      const mimeType = getImageMimeType(artworkPath)
      this.currentArtworkUrl = URL.createObjectURL(artworkBlob)
      artwork = [{src: this.currentArtworkUrl, type: mimeType}]
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artist,
      album: song.album,
      artwork,
    })

    navigator.mediaSession.setActionHandler('play', () => this.musicPlayer.togglePause())
    navigator.mediaSession.setActionHandler('pause', () => this.musicPlayer.togglePause())
    navigator.mediaSession.setActionHandler('previoustrack', () => this.musicPlayer.prev())
    navigator.mediaSession.setActionHandler('nexttrack', () => this.musicPlayer.next())
  }

  private updatePlaybackState(state: 'playing' | 'paused' | 'none') {
    if (!('mediaSession' in navigator)) {
      return
    }
    navigator.mediaSession.playbackState = state
  }

  private clearMediaSession() {
    if (!('mediaSession' in navigator)) {
      return
    }
    navigator.mediaSession.playbackState = 'none'
    navigator.mediaSession.metadata = null
    if (this.currentArtworkUrl) {
      URL.revokeObjectURL(this.currentArtworkUrl)
      this.currentArtworkUrl = null
    }
  }

  destroy() {
    this.musicPlayer.events.off('songchanged', this.onSongChanged)
    this.musicPlayer.events.off('play', this.onPlay)
    this.musicPlayer.events.off('pause', this.onPause)
    this.musicPlayer.events.off('stop', this.onStop)
    this.clearMediaSession()
  }
}
