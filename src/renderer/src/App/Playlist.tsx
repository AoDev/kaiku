import {observer} from 'mobx-react'
import type {RootStore} from '@renderer/stores/RootStore'
import {DEFAULT_ALBUM_COVER} from '@renderer/config'

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
  const coverPath = album?.coverExtension
    ? `cover://${album.id}.${album.coverExtension}`
    : DEFAULT_ALBUM_COVER

  return (
    <div className="playlist" onClick={handlePlaySongFromPlaylist}>
      <div className="margin-bottom-1">
        {musicPlayer.song && (
          <>
            {/* biome-ignore lint/a11y/useAltText: We do not have text description of each cover */}
            <img className="playlist__cover" src={coverPath} />
            <b>{musicPlayer.song.title}</b>
            <div>
              <span className="txt-unit">by</span> {musicPlayer.song.artist}{' '}
              <span className="txt-unit">on</span> {musicPlayer.song.album}
            </div>
          </>
        )}
      </div>
      {musicPlayer.playlist.map((song, index) => (
        <div
          className={`pad-left-0 ${musicPlayer.playlistIndex === index ? 'row--playing' : 'row'}`}
          key={index}
          data-file-path={song.filePath}
          data-song-index={index}
        >
          <span className="playlist__index">{index + 1}</span> {song.trackNumber}. {song.title}
        </div>
      ))}
    </div>
  )
})
