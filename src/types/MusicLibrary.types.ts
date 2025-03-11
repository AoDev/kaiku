export type Artist = {
  id: string
  name: string
}

export type Album = {
  id: string
  artistId: string
  name: string
  year: number
  coverExtension: string
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
  disk: {no: number; of: number}
  // duration: number
}

export interface AudioLibrary {
  songs: Song[]
  albums: Album[]
  artists: Artist[]
}
