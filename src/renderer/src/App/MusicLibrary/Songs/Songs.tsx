import {getAlbumCover} from '@rootsrc/renderer/src/config'
import {observer} from 'mobx-react'
import type {MusicLibraryVM} from '../MusicLibraryVM'
import {ContextMenu} from '../shared/ContextMenu'
import {SongDetails} from './SongDetails'

export const Songs = observer(({vm}: {vm: MusicLibraryVM}) => {
  const {musicLibrary, musicPlayer} = vm.rootStore
  const {filter} = musicLibrary
  const needsDetails =
    (filter !== null && musicLibrary.albumSelected === '') ||
    musicLibrary.filteredAlbums.length === 0

  return (
    <>
      <div
        className="library__col"
        onClick={vm.onSongClick}
        onContextMenu={vm.onSongContextMenu}
        data-song-col
      >
        {vm.shouldGroupByAlbum
          ? vm.groupedSongsByAlbum.map(([album, songs]) => (
              <div key={album.id} className="margin-bottom-05">
                <div className="nowrap">
                  {!!musicLibrary.albumSelected && (
                    // biome-ignore lint/a11y/useAltText: No description for covers
                    <img
                      width="100%"
                      src={getAlbumCover(musicLibrary.indexedAlbums[musicLibrary.albumSelected])}
                    />
                  )}
                  <h3 className="album__header">{album.name}</h3>
                </div>
                {songs.map((song) => (
                  <div
                    className={`library-item ${musicLibrary.songSelected === song.filePath ? 'selected' : ''} ${musicPlayer.song === song ? 'playing' : ''}`}
                    key={song.filePath}
                    data-file-path={song.filePath}
                  >
                    {song.disk.of > 1 && <span className="txt-unit">CD{song.disk.no} - </span>}
                    <span className="txt-muted">{song.trackNumber}.</span> {song.title}
                  </div>
                ))}
              </div>
            ))
          : musicLibrary.filteredSongs.map((song) => (
              <div
                className={`library-item ${musicLibrary.songSelected === song.filePath ? 'selected' : ''} ${musicPlayer.song === song ? 'playing' : ''}`}
                key={song.filePath}
                data-file-path={song.filePath}
              >
                {song.disk.of > 1 && <span className="txt-unit">CD{song.disk.no} - </span>}
                <span className="txt-muted">{song.trackNumber}.</span> {song.title}
                {needsDetails && (
                  <div className="margin-bottom-05 txt-muted">
                    <span className="txt-unit">by</span> {song.artist}{' '}
                    <span className="txt-unit">on</span> {song.album}
                  </div>
                )}
              </div>
            ))}

        {musicLibrary.filteredSongs.length === 0 && <i className="txt-muted pad-h-1">No songs</i>}
      </div>

      <ContextMenu dialog={vm.songMenuDialog} contextMenu={vm.songContextMenu} />
      <SongDetails vm={vm} />
    </>
  )
})
