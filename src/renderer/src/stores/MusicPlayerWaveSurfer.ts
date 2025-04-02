import {percentage} from '@lib/math'
import {normalizeError} from '@rootsrc/lib/error'
import type {Song} from '@rootsrc/types/MusicLibrary.types'
import {debounce} from 'lodash'
import {action, makeAutoObservable} from 'mobx'
import WaveSurfer from 'wavesurfer.js'

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

// Map file extensions to MIME types
const MIME_TYPES: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.flac': 'audio/flac',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.aac': 'audio/aac',
}

function getMimeType(filePath: string): string {
  const extension = filePath.toLowerCase().match(/\.[^.]+$/)?.[0]
  return extension ? MIME_TYPES[extension] || 'audio/mpeg' : 'audio/mpeg'
}

type MusicPlayerOptions = {
  onLoadAudioFileError?: (filePath: string, error: Error) => void
}

export class MusicPlayer {
  isPlaying = false
  position = 0
  duration = 0
  ended = false
  wavesurfer?: WaveSurfer
  song?: Song
  playlist: Song[] = []
  playlistIndex = 0
  volume = 0.3
  positionTimer?: ReturnType<typeof setInterval>
  positionTracking = true
  options: MusicPlayerOptions
  private container: HTMLDivElement

  get positionInPercent() {
    return this.duration > 0 ? percentage(this.position, this.duration) : 0
  }

  get positionInMinSec() {
    return {
      minutes: Math.floor(this.position / 60),
      seconds: Math.floor(this.position % 60),
    }
  }

  get durationInMinSec() {
    return {
      minutes: Math.floor(this.duration / 60),
      seconds: Math.floor(this.duration % 60),
    }
  }

  addToPlaylist(songs: Song[]) {
    this.playlist = this.playlist.concat(songs)
  }

  replacePlaylist(songs: Song[]) {
    this.playlist = songs
    this.playlistIndex = 0
  }

  async play(newIndex?: number) {
    const index = isNumber(newIndex) ? newIndex : this.playlistIndex
    const song = this.playlist[index]

    if (song) {
      if (this.wavesurfer) {
        this.wavesurfer.stop()
        this.wavesurfer.destroy()
      }

      this.song = song
      this.playlistIndex = index
      this.isPlaying = true
      this.position = 0
      this.positionTracking = true

      this.wavesurfer = WaveSurfer.create({
        container: this.container,
        backend: 'MediaElement',
        mediaControls: false,
        normalize: true,
        fillParent: true,
      })

      try {
        // Load the audio file through IPC
        const audioBuffer = await window.api.loadAudioFile(song.filePath)
        // Create a blob from the buffer with the correct MIME type
        const mimeType = getMimeType(song.filePath)
        const blob = new Blob([audioBuffer], {type: mimeType})
        // Create an object URL from the blob
        const url = URL.createObjectURL(blob)

        // Load the audio using the object URL
        this.wavesurfer.load(url)
        // Set the volume after loading
        this.wavesurfer.setVolume(this.volume)

        this.wavesurfer.on(
          'ready',
          action(() => {
            this.duration = this.wavesurfer?.getDuration() || 0
          })
        )

        this.wavesurfer.on(
          'play',
          action(() => {
            this.isPlaying = true
          })
        )

        this.wavesurfer.on(
          'pause',
          action(() => {
            this.isPlaying = false
          })
        )

        this.wavesurfer.on(
          'finish',
          action(() => {
            this.isPlaying = false
            this.next()
          })
        )

        this.wavesurfer.play()
      } catch (error) {
        console.error('Failed to load audio file:', error)
        this.options?.onLoadAudioFileError?.(song.filePath, normalizeError(error))
        this.isPlaying = false
      }
    }
  }

  replacePlaylistAndPlay(songs: Song[]) {
    this.replacePlaylist(songs)
    this.play()
  }

  stop() {
    if (this.wavesurfer && this.isPlaying) {
      this.wavesurfer.stop()
      this.isPlaying = false
    }
  }

  togglePause() {
    if (!this.wavesurfer) {
      return
    }
    if (this.wavesurfer.isPlaying()) {
      this.wavesurfer.pause()
      this.isPlaying = false
    } else {
      this.wavesurfer.play()
      this.isPlaying = true
    }
  }

  next() {
    this.play((this.playlistIndex + 1) % this.playlist.length)
  }

  prev() {
    this.play(this.playlistIndex === 0 ? this.playlist.length - 1 : this.playlistIndex - 1)
  }

  updatePositionFromWaveSurfer() {
    if (this.positionTracking) {
      this.position = this.wavesurfer?.getCurrentTime() || 0
    }
  }

  setPositionDebounced = debounce(
    (position: number) => {
      this.wavesurfer?.seekTo(position / this.duration)
      this.positionTracking = true
    },
    200,
    {trailing: true}
  )

  setPositionFromPercent(percent: number) {
    let position = this.duration * (percent / 100)
    if (position < 0) {
      position = 0
    } else if (position > this.duration) {
      position = this.duration
    }
    this.position = position
    this.positionTracking = false
    this.setPositionDebounced(position)
  }

  setVolume(volume: number) {
    this.volume = volume
    this.wavesurfer?.setVolume(volume)
  }

  destroy() {
    if (this.positionTimer) {
      clearInterval(this.positionTimer)
    }
    if (this.wavesurfer) {
      this.wavesurfer.destroy()
      this.wavesurfer = undefined
    }
    this.container.remove()
  }

  constructor(options?: MusicPlayerOptions) {
    this.options = options || {}
    makeAutoObservable(this, {options: false}, {autoBind: true, deep: false})
    this.container = document.createElement('div')
    this.positionTimer = setInterval(this.updatePositionFromWaveSurfer, 100)
  }
}
