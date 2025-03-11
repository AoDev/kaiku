import type {AudioLibrary, Song} from '@rootsrc/types/MusicLibrary.types'

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

export async function getSongListFromFolder(): Promise<
  AudioLibrary & {
    folderPath: string
  }
> {
  try {
    const selectedPath: string = await window.electron.ipcRenderer.invoke('selectDirectory')
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
