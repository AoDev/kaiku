import type {RootStore} from '@renderer/stores/RootStore'
import type {Song} from '@rootsrc/types/Song'
import {getAlbumCover} from '@src/config'
import {observer} from 'mobx-react'

const dummySong: Song = {
  album: '',
  artist: '',
  title: '',
  filePath: '',
  trackNumber: 0,
  year: 0,
  artistId: '',
  albumId: '',
}

export const Playlist = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicPlayer, musicLibrary} = rootStore

  const handlePlaySongFromPlaylist = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement

    if (event.detail !== 2) {
      return
    }

    if (target.tagName === 'DIV') {
      const songIndex = Number(target.dataset.songIndex)
      if (isFinite(songIndex)) {
        musicPlayer.play(songIndex)
      }
    }
  }

  const album = musicLibrary.albums.find((album) => album.id === musicPlayer.song?.albumId)
  const coverPath = getAlbumCover(album)
  const song: Song = musicPlayer.song ?? dummySong

  return (
    <div className="playlist" onClick={handlePlaySongFromPlaylist}>
      <div className="margin-bottom-1">
        <>
          {/* biome-ignore lint/a11y/useAltText: We do not have text description of each cover */}
          <img
            className="playlist__cover"
            src={coverPath}
            onClick={rootStore.revealArtistPlaying}
          />
          <b>{song.title}</b>
          <div>
            <span className="txt-unit">by</span> {song.artist} <span className="txt-unit">on</span>{' '}
            {song.album}
          </div>
        </>
      </div>
      {musicPlayer.playlist.map((song, index) => (
        <div
          className={`pad-left-0 ${musicPlayer.playlistIndex === index ? 'row--playing' : 'row'}`}
          key={song.filePath}
          data-file-path={song.filePath}
          data-song-index={index}
        >
          <span className="playlist__index">{index + 1}</span>{' '}
          <span className="txt-muted">{song.trackNumber}.</span> {song.title}
        </div>
      ))}
      {musicPlayer.playlist.length === 0 && (
        <div className="row">
          <span className="playlist__index">{1}</span>{' '}
          <i className="txt-muted">No songs in playlist</i>
        </div>
      )}
    </div>
  )
})
