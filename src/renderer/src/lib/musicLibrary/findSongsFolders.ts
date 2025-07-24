import type {Artist, Song} from '@rootsrc/types/MusicLibrary.types'

/**
 * Result type for findSongsFolders
 */
export type ArtistFolderResult = {
  artistFolder: string
  parentFolders: string[]
}

/**
 * Find the folder path for an artist by analyzing their songs' file paths
 * Assumes all songs for an artist are in a single folder named after the artist
 */
export function findSongsFolders(artist: Artist, songs: Song[]): ArtistFolderResult {
  if (songs.length === 0) {
    return {artistFolder: '', parentFolders: []}
  }

  // Get all parent folders from the songs, including all levels up to root
  const allParentFolders = new Set<string>()
  for (const song of songs) {
    // Handle both forward and backward slashes for cross-platform compatibility
    const pathParts = song.filePath.split(/[/\\]/)
    const separator = song.filePath.includes('\\') ? '\\' : '/'
    // Get all possible parent folders by removing one part at a time
    for (let i = pathParts.length - 1; i > 0; i--) {
      const parentFolder = pathParts.slice(0, i).join(separator)
      allParentFolders.add(parentFolder)
    }
  }

  // Find the folder that contains the artist name (case insensitive)
  const artistName = artist.name.toLowerCase()

  let artistFolder = ''
  for (const folder of allParentFolders) {
    const folderName = folder.split(/[/\\]/).pop()?.toLowerCase()
    if (folderName === artistName) {
      artistFolder = folder
      break
    }
  }

  // Get the path parts for the deepest song path to use as reference
  const filteredFolders = new Set<string>()

  if (artistFolder) {
    // If we found the artist folder, add album folders (one level below artist)
    const artistFolderParts = artistFolder.split(/[/\\]/)
    const artistFolderIndex = artistFolderParts.length - 1

    for (const folder of allParentFolders) {
      const parts = folder.split(/[/\\]/)
      if (parts.length === artistFolderParts.length + 1) {
        filteredFolders.add(folder)
      }
    }

    // Add the artist folder
    filteredFolders.add(artistFolder)

    // Add folders up to two levels above the artist folder
    for (let i = 0; i < 2; i++) {
      const parentParts = artistFolderParts.slice(0, artistFolderIndex - i)
      if (parentParts.length > 0) {
        filteredFolders.add(parentParts.join('/'))
      }
    }
  } else {
    // If no artist folder found, check if we have multiple paths by looking at variations at same level
    const pathsByLevel = new Map<number, Set<string>>()
    const deepestPath = Array.from(allParentFolders).reduce((deepest, folder) => {
      const parts = folder.split(/[/\\]/)
      return parts.length > deepest.length ? parts : deepest
    }, [] as string[])

    // Find the deepest level that has multiple folders
    for (const folder of allParentFolders) {
      const parts = folder.split(/[/\\]/)
      for (const [index, part] of parts.entries()) {
        if (!pathsByLevel.has(index)) {
          pathsByLevel.set(index, new Set())
        }
        pathsByLevel.get(index)?.add(part)
      }
    }

    // Check if we have different paths at any level (except root)
    const hasMultiplePaths = Array.from(pathsByLevel.entries()).some(
      ([level, paths]) => level > 0 && paths.size > 1
    )

    if (hasMultiplePaths) {
      // If we have multiple paths, include all folders up to 3 levels from deepest
      const maxDepth = deepestPath.length
      for (const folder of allParentFolders) {
        const parts = folder.split(/[/\\]/)
        if (parts.length >= maxDepth - 3) {
          filteredFolders.add(folder)
        }
      }
    } else {
      // If single path, keep only the deepest 3 levels
      const maxDepth = deepestPath.length
      for (const folder of allParentFolders) {
        const parts = folder.split(/[/\\]/)
        if (parts.length >= maxDepth - 3) {
          filteredFolders.add(folder)
        }
      }
    }
  }

  // Convert to array and sort by path length (deepest first)
  const parentFolders = Array.from(filteredFolders).sort((a, b) => {
    const aParts = a.split(/[/\\]/).length
    const bParts = b.split(/[/\\]/).length
    return bParts - aParts
  })

  return {artistFolder, parentFolders}
}
