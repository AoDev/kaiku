export type Artist = {
  id: string
  name: string
}

export type Album = {
  id: string
  artistId: string
  name: string
  year: number
}

export type Song = {
  year: number
  trackNumber: number
  title: string
  artist: string
  artistId: string
  album: string
  albumId: string
  filePath: string
  // duration: number
}

export interface AudioLibrary {
  songs: Song[]
  albums: Album[]
  artists: Artist[]
}
