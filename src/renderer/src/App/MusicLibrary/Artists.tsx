import type {RootStore} from '@renderer/stores/RootStore'
import {observer} from 'mobx-react'
import {useEffect} from 'react'

export const Artists = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicLibrary, musicPlayer} = rootStore

  const handleArtistSelect = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.tagName === 'DIV') {
      const artistId = target.dataset.artistId
      if (artistId) {
        const clickCount = event.detail
        if (clickCount === 1) {
          musicLibrary.selectArtist(artistId)
        } else if (clickCount === 2) {
          musicLibrary.selectArtist(artistId)
          musicPlayer.replacePlaylist(
            musicLibrary.songs.filter((song) => song.artistId === artistId),
          )
          musicPlayer.play()
        }
      }
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this when the filter changes
  useEffect(() => {
    if (!musicLibrary.filter) {
      rootStore.revealArtist()
    }
  }, [musicLibrary.filter])

  return (
    <div className="artists library__col" onClick={handleArtistSelect}>
      {musicLibrary.filteredArtists.map((artist) => (
        <div
          className={`artist ${musicLibrary.artistSelected === artist.id ? 'selected' : ''} ${musicPlayer.song?.artistId === artist.id ? 'row--playing' : 'row'}`}
          key={artist.id}
          data-artist-id={artist.id}
        >
          {artist.name}
        </div>
      ))}

      {musicLibrary.filteredArtists.length === 0 && <i className="txt-muted pad-h-1">No artists</i>}
    </div>
  )
})
