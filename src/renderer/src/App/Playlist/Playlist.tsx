import {getDatasetValue} from '@rootsrc/lib/dom/getDatasetValue'
import type {Song} from '@rootsrc/types/MusicLibrary.types'
import kaikuCover from '@src/assets/images/kaiku-album.jpg'
import {getAlbumCover} from '@src/config'
import {observer} from 'mobx-react'
import type {AppVM} from '../AppVM'
import {PlaylistMenu} from './PlaylistMenu'

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

export const Playlist = observer(({vm}: {vm: AppVM}) => {
  const {musicPlayer, musicLibrary} = vm.rootStore
  const {playlistDialog} = vm.rootStore.uiStore

  const handlePlaySongFromPlaylist = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.detail !== 2) {
      return
    }
    const songIndex = Number(getDatasetValue(event, 'songIndex'))
    if (isFinite(songIndex)) {
      musicPlayer.play(songIndex)
    }
  }

  const song: Song = musicPlayer.song ?? dummySong
  const album = song.albumId
    ? musicLibrary.albums.find((album) => album.id === song.albumId)
    : undefined
  const coverPath = album ? getAlbumCover(album) : kaikuCover

  return (
    <div
      className={`playlist ${playlistDialog.visible ? 'visible' : ''}`}
      onClick={handlePlaySongFromPlaylist}
    >
      <div className="margin-bottom-1">
        {/* biome-ignore lint/a11y/useAltText: We do not have text description of each cover */}
        <img className="playlist__cover" src={coverPath} onClick={vm.rootStore.revealSongPlaying} />

        <div className="flex-row-center justify-between">
          <div className="playlist__song-playing">
            <b>{song.title}</b>
            <div>
              <span className="txt-unit">by</span> {song.artist}{' '}
              <span className="txt-unit">on</span> {song.album}
            </div>
          </div>
          <div>
            <PlaylistMenu vm={vm} />
          </div>
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
