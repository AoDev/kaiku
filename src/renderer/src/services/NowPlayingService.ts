import {getAlbumCover} from '@renderer/config/appConfig'
import {createBlobFromImageUrl} from '@renderer/lib/image/createBlobFromImageUrl'
import type {MusicLibrary} from '@renderer/stores/MusicLibrary'
import type {MusicPlayer} from '@renderer/stores/MusicPlayerWaveSurfer'
import type {Song} from '@rootsrc/types/MusicLibrary.types'
import {type IReactionDisposer, reaction} from 'mobx'

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

/**
 * Manages the Media Session API to provide rich media controls to the operating system.
 *
 * THE CHALLENGE:
 * There is a complex race condition related to displaying album artwork. The cover for an album
 * might not exist on the file system when a song first starts playing, because the cover
 * extraction process is asynchronous and runs in the main process.
 *
 * This service needs to update the OS media controls immediately when a song changes, but it
 * also needs to wait for the cover image file to be created before it can generate a blob URL
 * for the artwork.
 *
 * REQUIREMENTS:
 * 1. It handles the case where the cover already exists and display it immediately.
 * 2. It handles the case where the cover does not exist and wait for it.
 * 3. It handles the case where a cover is never found for a track.
 * 4. It handles rapid song changes, ensuring that a delayed update for a *previous* song
 *    does not incorrectly overwrite the artwork for the *current* song.
 * 5. It must not leak memory by leaving reactions or listeners active.
 *
 * THE SOLUTION:
 * We use a self-managing, temporary MobX reaction to declaratively handle the cover loading.
 *
 * When a song changes (`updateMetadata` is called):
 * 1. Any existing, pending reaction for a previous song is immediately disposed of.
 * 2. The `currentAlbumIdForCover` is set to the new song's album ID. This acts as a "context guard"
 *    to solve the race condition.
 * 3. The media session metadata (title, artist, album) is set immediately.
 * 4. If the cover already exists on disk (checked via `album.coverExtension`), the artwork is
 *    created and set right away.
 * 5. If the cover is missing, a temporary `reaction` is created. This reaction watches for changes
 *    to the specific album object in the `musicLibrary.indexedAlbums` map.
 * 6. When the reaction fires, it first checks if the updated album's ID matches the
 *    `currentAlbumIdForCover`. If it doesn't, the reaction is for a stale, previous song, and it is
 *    disposed of without doing anything.
 * 7. If the IDs match, it means the cover for the correct song is now ready. The reaction disposes
 *    of itself to prevent memory leaks, and then updates the media session artwork.
 */
export class NowPlayingService {
  private musicPlayer: MusicPlayer
  private musicLibrary: MusicLibrary
  private coverFolderPath: string | null = null
  private currentArtworkUrl: string | null = null
  private disposeCoverReaction: IReactionDisposer | null = null
  private currentAlbumIdForCover: string | null = null

  // Event handlers for the music player
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

  private async updateArtwork(artworkPath: string) {
    // Revoke the previous artwork URL to prevent memory leaks
    if (this.currentArtworkUrl) {
      URL.revokeObjectURL(this.currentArtworkUrl)
      this.currentArtworkUrl = null
    }

    const artworkBlob = await createBlobFromImageUrl(artworkPath)
    if (artworkBlob && navigator.mediaSession.metadata) {
      const mimeType = getImageMimeType(artworkPath)
      this.currentArtworkUrl = URL.createObjectURL(artworkBlob)
      navigator.mediaSession.metadata.artwork = [{src: this.currentArtworkUrl, type: mimeType}]
    }
  }

  private async updateMetadata(song: Song) {
    if (!('mediaSession' in navigator) || !this.coverFolderPath) {
      return
    }

    // 1. Cleanup any pending reaction from the previous song
    this.disposeCoverReaction?.()
    this.disposeCoverReaction = null

    // 2. Set the context for the new song
    this.currentAlbumIdForCover = song.albumId

    // 3. Set the base metadata immediately, without the artwork
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artist,
      album: song.album,
    })

    const album = this.musicLibrary.indexedAlbums[song.albumId]
    if (!album) {
      return
    }

    // 4. If the cover already exists, update the artwork and we're done
    if (album.coverExtension) {
      const artworkPath = getAlbumCover(album)
      this.updateArtwork(artworkPath)
      return
    }

    // 5. If the cover does not exist, set up a reaction to wait for it
    this.disposeCoverReaction = reaction(
      () => this.musicLibrary.indexedAlbums[song.albumId],
      (updatedAlbum, previousAlbum) => {
        // Guard against premature firing or non-existent albums
        if (!updatedAlbum || updatedAlbum === previousAlbum) {
          return
        }

        // Guard: Is this reaction for the currently playing song?
        if (updatedAlbum.id !== this.currentAlbumIdForCover) {
          this.disposeCoverReaction?.() // It's for a previous song, so clean up and ignore
          return
        }

        // The cover has been updated for the correct song, so clean up the reaction
        this.disposeCoverReaction?.()
        this.disposeCoverReaction = null

        if (updatedAlbum.coverExtension) {
          this.updateArtwork(getAlbumCover(updatedAlbum))
        }
      }
    )

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
    this.disposeCoverReaction?.()
    this.disposeCoverReaction = null

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
