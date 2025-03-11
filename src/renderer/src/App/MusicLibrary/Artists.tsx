import {observer} from 'mobx-react'
import type {MusicLibraryVM} from './MusicLibraryVM'

export const Artists = observer(({vm}: {vm: MusicLibraryVM}) => {
  const {musicLibrary, musicPlayer} = vm.rootStore
  const {filteredArtists, artistSelected} = musicLibrary
  const {song} = musicPlayer

  return (
    <div className="library__col" onClick={vm.onArtistClick} data-artist-col>
      {filteredArtists.map((artist) => (
        <div
          className={`library-item ${artistSelected === artist.id ? 'selected' : ''} ${song?.artistId === artist.id ? 'playing' : ''}`}
          key={artist.id}
          data-artist-id={artist.id}
        >
          {artist.name}
        </div>
      ))}

      {filteredArtists.length === 0 && <i className="txt-muted pad-h-1">No artists</i>}
    </div>
  )
})
