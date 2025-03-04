import {Howl} from 'howler'
import {action, makeAutoObservable} from 'mobx'
import type {Song} from '../../../types/Song'
import {percentage} from '../../../lib/math'

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export class MusicPlayer {
  isPlaying = false
  position = 0
  duration = 0
  ended = false
  howl?: Howl
  song?: Song
  playlist: Song[] = []
  playlistIndex = 0
  volume = 0.3
  positionTimer?: NodeJS.Timeout

  get positionInPercent() {
    return percentage(this.position, this.duration)
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

  play(newIndex?: number) {
    const index = isNumber(newIndex) ? newIndex : this.playlistIndex
    const song = this.playlist[index]

    console.log({index, song})

    if (song) {
      if (this.howl) {
        this.howl.stop()
        this.howl.unload()
      }

      this.song = song
      this.playlistIndex = index
      this.isPlaying = true

      this.howl = new Howl({
        src: [`media://${song.filePath}`],
        html5: true,
        autoplay: true,
        volume: this.volume,
        onplay: action(() => {
          this.isPlaying = true
          this.duration = this.howl?.duration() ?? 0
          console.log('onplay')
        }),
        onpause: action(() => {
          this.isPlaying = false
        }),
        onstop: action(() => {
          this.isPlaying = false
        }),
        onend: action(() => {
          this.isPlaying = false
          this.next()
          console.log('onend')
        }),
      })

      this.howl.play()
    }
  }

  stop() {
    if (this.howl && this.isPlaying) {
      this.howl.stop()
      this.isPlaying = false
    }
  }

  togglePause() {
    if (!this.howl) {
      return
    }
    if (this.howl.playing()) {
      this.howl.pause()
      this.isPlaying = false
    } else {
      this.howl.play()
      this.isPlaying = true
    }
  }

  next() {
    this.play((this.playlistIndex + 1) % this.playlist.length)
  }

  prev() {
    this.play(this.playlistIndex === 0 ? this.playlist.length - 1 : this.playlistIndex - 1)
  }

  updatePositionFromHowl() {
    this.position = this.howl?.seek() ?? 0
  }

  setPositionFromPercent(percent: number) {
    let position = this.duration * (percent / 100)
    if (position < 0) {
      position = 0
    } else if (position > this.duration) {
      position = this.duration
    }
    this.howl?.seek(position)
  }

  setVolume(volume: number) {
    this.volume = volume
    this.howl?.volume(volume)
  }

  constructor() {
    makeAutoObservable(this, undefined, {autoBind: true, deep: false})
    this.positionTimer = setInterval(this.updatePositionFromHowl, 500)
  }
}
