import {getAlbumCover} from '@src/config'
import {observer} from 'mobx-react'
import type {MusicLibraryVM} from '../MusicLibraryVM'
import {ContextMenu} from '../shared/ContextMenu'

export const Albums = observer(({vm}: {vm: MusicLibraryVM}) => {
  const {musicLibrary, musicPlayer} = vm.rootStore
  const {indexedArtists, filter, albumSelected} = musicLibrary
  const {song} = musicPlayer
  const needArtistDetails = filter !== null && musicLibrary.artistSelected === ''

  return (
    <>
      <div
        className="library__col"
        onClick={vm.onAlbumClick}
        onContextMenu={vm.onAlbumContextMenu}
        data-album-col
      >
        {musicLibrary.filteredAlbums.map((album) => {
          return (
            <div
              className={`album library-item ${song?.albumId === album.id ? 'playing' : ''} ${albumSelected === album.id ? 'selected' : ''}`}
              key={album.id}
              data-album-id={album.id}
            >
              <div className="flex-row-center gap-1 noselect">
                {/* biome-ignore lint/a11y/useAltText: We do not have text description of each cover */}
                <img className="album__cover" src={getAlbumCover(album)} />
                <span className="txt-muted nowrap">{album.year || '----'}</span>
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

      <ContextMenu dialog={vm.albumMenuDialog} contextMenu={vm.albumContextMenu} />
    </>
  )
})
