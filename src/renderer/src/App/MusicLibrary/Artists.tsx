import type {RootStore} from '@renderer/stores/RootStore'
import {observer} from 'mobx-react'
import {useCallback, useEffect} from 'react'

function getArtistId(event: React.MouseEvent<HTMLDivElement>) {
  let target = event.target as HTMLElement
  let artistId: string | undefined
  while (!artistId && target !== event.currentTarget && target.parentNode !== null) {
    artistId = target.dataset.artistId
    target = target.parentNode as HTMLElement
  }
  return artistId
}

export const Artists = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicLibrary, musicPlayer} = rootStore

  // biome-ignore lint/correctness/useExhaustiveDependencies: musicLibrary is immutable
  const onArtistClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const artistId = getArtistId(event)
    if (!artistId) {
      return
    }
    musicLibrary.selectArtist(artistId)
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: musicLibrary is immutable
  const onArtistDoubleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const artistId = getArtistId(event)
    if (!artistId) {
      return
    }
    if (musicLibrary.artistSelected !== artistId) {
      musicLibrary.selectArtist(artistId)
    }
    musicPlayer.replacePlaylist(musicLibrary.songs.filter((song) => song.artistId === artistId))
    musicPlayer.play()
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this when the filter changes
  useEffect(() => {
    if (!musicLibrary.filter) {
      rootStore.revealArtist()
    }
  }, [musicLibrary.filter])

  return (
    <div
      className="artists library__col"
      onClick={onArtistClick}
      onDoubleClick={onArtistDoubleClick}
    >
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
