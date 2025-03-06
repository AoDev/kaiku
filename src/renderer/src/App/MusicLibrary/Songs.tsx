import type {RootStore} from '@renderer/stores/RootStore'
import {observer} from 'mobx-react'

export const Songs = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicLibrary, musicPlayer} = rootStore
  const {indexedArtists, indexedAlbums, filter} = musicLibrary
  const needsDetails = filter !== null

  const handleSongSelect = (event: React.MouseEvent<HTMLDivElement>) => {
    let target = event.target as HTMLElement
    let filePath: string | undefined
    while (!filePath && target !== event.currentTarget && target.parentNode !== null) {
      filePath = target.dataset.filePath
      target = target.parentNode as HTMLElement
    }

    if (filePath) {
      const clickCount = event.detail
      if (clickCount === 1) {
        musicLibrary.selectSong(filePath)
      } else if (clickCount === 2) {
        musicPlayer.replacePlaylist(musicLibrary.songs.filter((song) => song.filePath === filePath))
        musicPlayer.play()
        const {song} = musicPlayer
        if (song) {
          const album = indexedAlbums[song.albumId]
          if (album && !album.coverExtension) {
            musicLibrary.updateAlbumCovers([album])
          }
        }
      }
    }
  }

  return (
    <div className="songs library__col" onClick={handleSongSelect}>
      {musicLibrary.filteredSongs.map((song) => (
        <div
          className={`song ${musicLibrary.songSelected === song.filePath ? 'selected' : ''} ${musicPlayer.song === song ? 'row--playing' : 'row'}`}
          key={song.filePath}
          data-file-path={song.filePath}
        >
          <span className="txt-muted">{song.trackNumber}.</span> {song.title}{' '}
          {needsDetails && (
            <div className="margin-bottom-05 txt-muted">
              <span className="txt-unit">by</span> {indexedArtists[song.artistId].name}{' '}
              <span className="txt-unit">on</span> {indexedAlbums[song.albumId].name}
            </div>
          )}
        </div>
      ))}

      {musicLibrary.filteredSongs.length === 0 && <i className="txt-muted pad-h-1">No songs</i>}
    </div>
  )
})
