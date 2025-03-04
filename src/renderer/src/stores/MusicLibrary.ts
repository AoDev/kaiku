import {makeAutoObservable} from 'mobx'
import type {Artist, Album, Song, AudioLibrary} from '../../../types/Song'

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

  artistSelected = ''
  albumSelected = ''
  songSelected = ''

  artistPlaying: Artist | null = null
  albumPlaying: Album | null = null
  songPlaying: Song | null = null

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

  async loadFromFolder() {
    const {folderPath, songs, artists, albums} = await getSongListFromFolder()
    this.folderPath = folderPath
    this.songs = this.songs.concat(songs)
    this.artists = this.artists.concat(artists)
    this.albums = this.albums.concat(albums)
  }

  destroy() {
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
  }

  constructor() {
    makeAutoObservable(this, undefined, {deep: false, autoBind: true})
  }
}
