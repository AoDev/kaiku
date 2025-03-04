import {observer} from 'mobx-react'

import type {RootStore} from '@renderer/stores/RootStore'

export const Playlist = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicPlayer} = rootStore

  const handlePlaySongFromPlaylist = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement

    if (event.detail !== 2) {
      return
    }

    if (target.tagName === 'DIV') {
      const songIndex = Number(target.dataset.songIndex)
      if (!isNaN(songIndex)) {
        musicPlayer.play(songIndex)
      }
    }
  }

  return (
    <div className="playlist library__col" onClick={handlePlaySongFromPlaylist}>
      {musicPlayer.playlist.map((song, index) => (
        <div
          className={`${musicPlayer.playlistIndex === index ? 'row--playing' : 'row'}`}
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
