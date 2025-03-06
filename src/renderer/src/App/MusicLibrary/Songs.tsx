import type {RootStore} from '@renderer/stores/RootStore'
import {observer} from 'mobx-react'

export const Songs = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicLibrary, musicPlayer} = rootStore

  const handleSongSelect = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.tagName === 'DIV') {
      const filePath = target.dataset.filePath
      if (filePath) {
        const clickCount = event.detail
        if (clickCount === 1) {
          musicLibrary.selectSong(filePath)
        } else if (clickCount === 2) {
          musicPlayer.replacePlaylist(
            musicLibrary.songs.filter((song) => song.filePath === filePath),
          )
          musicPlayer.play()
        }
      }
    }
  }

  return (
    <div className="songs library__col" onClick={handleSongSelect}>
      {musicLibrary.filteredSongs.map((song) => (
        <div
          className={`song ${musicLibrary.songSelected === song.filePath ? 'selected' : ''} ${musicPlayer.song === song ? 'row--playing' : 'row'}`}
          key={song.filePath}
          data-file-path={song.filePath}
        >
          {song.trackNumber}. {song.title}
        </div>
      ))}

      {musicLibrary.filteredSongs.length === 0 && <i className="txt-muted pad-h-1">No songs</i>}
    </div>
  )
})
