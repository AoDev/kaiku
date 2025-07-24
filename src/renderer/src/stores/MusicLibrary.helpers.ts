import type {Album, Artist, AudioLibrary, Song} from '@rootsrc/types/MusicLibrary.types'

/**
 * Comparison function for sorting songs by disk number and track number
 * Short-circuits to just track number comparison if there's only one disk
 */
export function sortSongsByDiskAndTrack(a: Song, b: Song): number {
  // If either song has disk.of > 1, we need to sort by disk number first
  if ((a.disk?.of ?? 1) > 1 || (b.disk?.of ?? 1) > 1) {
    const diskA = a.disk?.no ?? 1
    const diskB = b.disk?.no ?? 1

    if (diskA !== diskB) {
      return diskA - diskB
    }
  }

  // Sort by track number
  return a.trackNumber - b.trackNumber
}

export async function getSongListFromFolder(selectedPath: string): Promise<
  AudioLibrary & {
    folderPath: string
  }
> {
  try {
    const audioLibrary: AudioLibrary = await window.electron.ipcRenderer.invoke(
      'listAudioFiles',
      selectedPath
    )
    return {folderPath: selectedPath, ...audioLibrary}
  } catch (error) {
    console.error('Error selecting directory:', error)
    return {folderPath: '', songs: [], artists: [], albums: []}
  }
}

/**
 * Compare artist names in a case-insensitive manner
 */
const compareArtistName = new Intl.Collator('en', {sensitivity: 'base'}).compare
export const sortArtistsByName = (a: Artist, b: Artist) => compareArtistName(a.name, b.name)

/**
 * Get songs from which we'll extract the cover, and albums that don't have a song (unexpected)
 */
export function getSongsToExtractCoverFrom(
  albums: Album[],
  indexedSongsByAlbum: Record<string, Song[]>
) {
  return albums.reduce(
    (acc: {songs: Song[]; albumsMissingSongs: Album[]}, album) => {
      const song = indexedSongsByAlbum[album.id]?.[0]
      if (song) {
        acc.songs.push(song)
      } else {
        acc.albumsMissingSongs.push(album)
      }
      return acc
    },
    {songs: [], albumsMissingSongs: []}
  )
}
