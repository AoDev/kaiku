import {observer} from 'mobx-react'

import type {RootStore} from '@renderer/stores/RootStore'

export const Artists = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicLibrary, musicPlayer} = rootStore

  const handleArtistSelect = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.tagName === 'DIV') {
      const artistId = target.dataset.artistId
      if (artistId) {
        const clickCount = event.detail
        console.log('Selected Artist:', artistId)
        if (clickCount === 1) {
          musicLibrary.selectArtist(artistId)
        } else if (clickCount === 2) {
          musicLibrary.selectArtist(artistId)
          musicPlayer.replacePlaylist(
            musicLibrary.songs.filter((song) => song.artistId === artistId)
          )
          musicPlayer.play()
        }
      }
    }
  }

  return (
    <div className="artists library__col" onClick={handleArtistSelect}>
      {musicLibrary.artists.map((artist) => (
        <div
          className={`artist ${musicLibrary.artistSelected === artist.id ? 'selected' : ''} ${musicPlayer.song?.artistId === artist.id ? 'row--playing' : 'row'}`}
          key={artist.id}
          data-artist-id={artist.id}
        >
          {artist.name}
        </div>
      ))}
    </div>
  )
})
