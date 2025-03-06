import {getAlbumCover} from '@src/config'
import type {RootStore} from '@src/stores'
import {observer} from 'mobx-react'

export const Albums = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicLibrary, musicPlayer} = rootStore
  const {indexedArtists, filter} = musicLibrary
  const needArtistDetails = filter !== null && musicLibrary.artistSelected === null

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
        const coverPath = getAlbumCover(album)
        const cssClass =
          musicPlayer.song?.albumId === album.id
            ? 'album--playing'
            : musicLibrary.albumSelected === album.id
              ? 'album--selected'
              : ''
        return (
          <div className={`album ${cssClass}`} key={album.id} data-album-id={album.id}>
            <div className="flex-row-center gap-1">
              {/* biome-ignore lint/a11y/useAltText: We do not have text description of each cover */}
              <img className="album__cover" src={coverPath} />
              <span className="txt-muted">{album.year || '----'}</span>
              <div>
                {album.name}
                {needArtistDetails ? (
                  <div className="txt-muted">
                    <span className="txt-unit">by</span> {indexedArtists[album.artistId].name}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )
      })}

      {musicLibrary.filteredAlbums.length === 0 && <i className="txt-muted pad-h-1">No albums</i>}
    </div>
  )
})
