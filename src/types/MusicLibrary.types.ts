export type Artist = {
  id: string
  name: string
  /** Album IDs */
  albums: string[]
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

export function isArtist(artist: unknown): artist is Artist {
  return (
    typeof artist === 'object' &&
    artist !== null &&
    'id' in artist &&
    'name' in artist &&
    'albums' in artist &&
    Array.isArray(artist.albums)
  )
}

export function isAlbum(album: unknown): album is Album {
  return typeof album === 'object' && album !== null && 'id' in album && 'artistId' in album
}

/**
 * Check if the library has the correct shape
 */
export function isAudioLibrary(library: unknown): library is AudioLibrary {
  const hasShape =
    typeof library === 'object' &&
    library !== null &&
    'songs' in library &&
    'albums' in library &&
    'artists' in library

  if (!hasShape) {
    return false
  }

  return (
    Array.isArray(library.artists) &&
    library.artists.every(isArtist) &&
    Array.isArray(library.albums) &&
    library.albums.every(isAlbum) &&
    Array.isArray(library.songs)
  )
}
