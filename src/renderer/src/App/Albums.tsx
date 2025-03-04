import {observer} from 'mobx-react'

import type {RootStore} from '@renderer/stores/RootStore'

export const Albums = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicLibrary, musicPlayer} = rootStore

  const handleAlbumSelect = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.tagName === 'DIV') {
      const albumId = target.dataset.albumId
      if (albumId) {
        const clickCount = event.detail
        if (clickCount === 1) {
          musicLibrary.selectAlbum(albumId)
        } else if (clickCount === 2) {
          musicPlayer.replacePlaylist(musicLibrary.songs.filter((song) => song.albumId === albumId))
          musicPlayer.play()
        }
      }
    }
  }

  return (
    <div className="albums library__col" onClick={handleAlbumSelect}>
      {musicLibrary.filteredAlbums.map((album) => (
        <div
          className={`album ${musicLibrary.albumSelected === album.id ? 'selected' : ''} ${musicPlayer.song?.albumId === album.id ? 'row--playing' : 'row'}`}
          key={album.id}
          data-album-id={album.id}
        >
          {album.name}
        </div>
      ))}

      {musicLibrary.filteredAlbums.length === 0 && <i className="txt-muted pad-h-1">No albums</i>}
    </div>
  )
})
