import {observer} from 'mobx-react'

import type {RootStore} from '@renderer/stores/RootStore'

export const Songs = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicLibrary, musicPlayer} = rootStore

  const handlePlaySong = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement

    if (event.detail !== 2) {
      return
    }

    if (target.tagName === 'DIV') {
      const filePath = target.dataset.filePath
      if (filePath) {
        console.log({filePath})
        const songs = musicLibrary.songs.filter((song) => song.filePath === filePath)
        musicPlayer.replacePlaylist(songs)
        musicPlayer.play()
      }
    }
  }

  return (
    <div className="songs library__col" onClick={handlePlaySong}>
      {musicLibrary.filteredSongs.map((song) => (
        <div
          className={`song ${musicPlayer.song === song ? 'row--playing' : 'row'}`}
          key={song.filePath}
          data-file-path={song.filePath}
        >
          {song.trackNumber}. {song.title}
        </div>
      ))}
    </div>
  )
})
