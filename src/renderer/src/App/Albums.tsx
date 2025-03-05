import {DEFAULT_ALBUM_COVER} from '@renderer/config'
import type {RootStore} from '@renderer/stores/RootStore'
import {observer} from 'mobx-react'

export const Albums = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicLibrary, musicPlayer} = rootStore

  const handleAlbumSelect = (event: React.MouseEvent<HTMLDivElement>) => {
    let target = event.target as HTMLElement
    let albumId: string | undefined
    while (!albumId && target !== event.currentTarget && target.parentNode !== null) {
      albumId = target.dataset.albumId
      target = target.parentNode as HTMLElement
    }
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

  return (
    <div className="albums library__col" onClick={handleAlbumSelect}>
      {musicLibrary.filteredAlbums.map((album) => {
        const coverPath = album.coverExtension
          ? `cover://${album.id}.${album.coverExtension}`
          : DEFAULT_ALBUM_COVER
        return (
          <div
            className={`album ${musicLibrary.albumSelected === album.id ? 'selected' : ''} ${musicPlayer.song?.albumId === album.id ? 'album--playing' : ''}`}
            key={album.id}
            data-album-id={album.id}
          >
            <div className="flex-row-center gap-1">
              {/* biome-ignore lint/a11y/useAltText: We do not have text description of each cover */}
              <img className="album__cover" src={coverPath} />
              <span className="txt-muted">{album.year || '----'}</span>
              {album.name}
            </div>
          </div>
        )
      })}

      {musicLibrary.filteredAlbums.length === 0 && <i className="txt-muted pad-h-1">No albums</i>}
    </div>
  )
})
