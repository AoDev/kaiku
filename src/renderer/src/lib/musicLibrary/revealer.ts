/**
 * Function helpers to reveal items in the music library
 */
import type {RootStore} from '@src/stores'

function revealInCol(parentSelector: string, itemSelector: string) {
  const colDomNode = document.querySelector(parentSelector)
  if (!colDomNode) {
    return
  }
  const itemNode = colDomNode.querySelector(itemSelector)
  if (!itemNode) {
    return
  }
  itemNode.scrollIntoView({behavior: 'smooth', block: 'center'})
}

/**
 * Updating the state of the music library here is not that clean. Need to refactor this.
 */
export function revealLibraryItem(
  item: {artistId: string; albumId: string; filePath: string},
  rootStore: RootStore
) {
  const {musicLibrary} = rootStore
  const {artistId, albumId, filePath} = item

  musicLibrary.assign({artistSelected: artistId, albumSelected: albumId, songSelected: filePath})

  if (artistId) {
    setTimeout(() => revealInCol('[data-artist-col="true"]', `[data-artist-id="${artistId}"]`), 400)
  }
  if (albumId) {
    setTimeout(() => revealInCol('[data-album-col="true"]', `[data-album-id="${albumId}"]`), 250)
  }
  if (filePath) {
    setTimeout(() => revealInCol('[data-song-col="true"]', `[data-file-path="${filePath}"]`), 10)
  }
}

/**
 * Prioritizes selected items, then song playing, fallback to first song
 * Mostly useful for revealing items after the search is cleared
 */
export function revealByPriority(rootStore: RootStore) {
  const {musicLibrary, musicPlayer} = rootStore
  const {songSelected, albumSelected, artistSelected} = musicLibrary

  if (songSelected) {
    const filePath = songSelected
    const song = musicLibrary.songs.find((song) => song.filePath === filePath)
    if (song) {
      const albumId = song.albumId
      const artistId = song.artistId
      revealLibraryItem({artistId, albumId, filePath}, rootStore)
    }
  } else if (albumSelected) {
    const {artistId} = musicLibrary.indexedAlbums[albumSelected]
    revealLibraryItem({artistId, albumId: albumSelected, filePath: ''}, rootStore)
  } else if (artistSelected) {
    revealLibraryItem({artistId: artistSelected, albumId: '', filePath: ''}, rootStore)
  } else if (musicPlayer.song) {
    revealLibraryItem(musicPlayer.song, rootStore)
  } else {
    const firstSong = musicLibrary.songs[0]
    if (firstSong) {
      revealLibraryItem(firstSong, rootStore)
    }
  }
}
