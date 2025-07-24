import {getDatasetValue} from '@rootsrc/lib/dom/getDatasetValue'
import type {Song} from '@rootsrc/types/MusicLibrary.types'
import kaikuCover from '@src/assets/images/kaiku-album.jpg'
import {getAlbumCover} from '@src/config'
import {observer} from 'mobx-react'
import type {CSSProperties} from 'react'
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

const albumRowStyle: CSSProperties = {
  maxWidth: '180px',
}

function getArtists(songs: Song[]) {
  return songs.reduce((acc: Set<string>, song) => acc.add(song.artist), new Set<string>())
}

export const Playlist = observer(({vm}: {vm: AppVM}) => {
  const {musicPlayer, musicLibrary} = vm.rootStore
  const {playlistDialog} = vm.rootStore.uiStore

  const handlePlaySongFromPlaylist = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.detail !== 2) {
      return
    }
    const songIndex = Number(getDatasetValue(event, 'songIndex'))
    if (Number.isFinite(songIndex)) {
      musicPlayer.play(songIndex)
    }
  }

  const song: Song = musicPlayer.song ?? dummySong
  const album = song.albumId
    ? musicLibrary.albums.find((album) => album.id === song.albumId)
    : undefined
  const coverPath = album ? getAlbumCover(album) : kaikuCover
  const needsAlbum =
    musicPlayer.playlist
      .map((song) => song.albumId)
      .reduce((acc: Set<string>, albumId) => {
        return acc.add(albumId)
      }, new Set<string>()).size > 1

  const needsAlbumNumber =
    !needsAlbum && musicPlayer.playlist.some((song) => !!song.disk.no && song.disk.no > 1)

  const needsArtist = !needsAlbum && !needsAlbumNumber && getArtists(musicPlayer.playlist).size > 2

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
          <div className="flex-row-center justify-between gap-2">
            <div>
              <span className="playlist__index">{index + 1}</span> {song.title}
            </div>
            {needsAlbum && (
              <span className="txt-muted nowrap-truncate" style={albumRowStyle}>
                {song.album}
              </span>
            )}
            {needsArtist && (
              <span className="txt-muted nowrap-truncate" style={albumRowStyle}>
                {song.artist}
              </span>
            )}
            {needsAlbumNumber && (
              <span className="txt-unit nowrap-truncate" style={albumRowStyle}>
                CD{song.disk.no}
              </span>
            )}
          </div>
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
