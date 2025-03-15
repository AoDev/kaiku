import type {RootStore} from '@renderer/stores/RootStore'
import type {Song} from '@rootsrc/types/MusicLibrary.types'
import kaikuCover from '@src/assets/images/kaiku-album.jpg'
import {getAlbumCover} from '@src/config'
import {observer} from 'mobx-react'

const dummySong: Song = {
  album: 'Unknown Album',
  artist: 'Unknown Artist',
  title: '',
  filePath: '',
  trackNumber: 0,
  year: 0,
  artistId: '',
  albumId: '',
  disk: {no: 1, of: 1},
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
  const coverPath = album ? getAlbumCover(album) : kaikuCover
  const song: Song = musicPlayer.song ?? dummySong

  return (
    <div className="playlist" onClick={handlePlaySongFromPlaylist}>
      <div className="margin-bottom-1">
        {/* biome-ignore lint/a11y/useAltText: We do not have text description of each cover */}
        <img className="playlist__cover" src={coverPath} onClick={rootStore.revealSongPlaying} />
        <b>{song.title}</b>
        <div>
          <span className="txt-unit">by</span> {song.artist} <span className="txt-unit">on</span>{' '}
          {song.album}
        </div>
      </div>
      {musicPlayer.playlist.map((song, index) => (
        <div
          className={`pad-left-0 library-item  ${musicPlayer.playlistIndex === index ? 'playing' : ''}`}
          key={`${song.filePath}-${index}`}
          data-file-path={song.filePath}
          data-song-index={index}
        >
          <span className="playlist__index">{index + 1}</span> {song.title}
        </div>
      ))}
      {musicPlayer.playlist.length === 0 && (
        <div className="pad-left-0 row">
          <span className="playlist__index">{1}</span>{' '}
          <i className="txt-muted">No songs in playlist</i>
        </div>
      )}
    </div>
  )
})
