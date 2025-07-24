import {Modal} from '@ui'
import {observer} from 'mobx-react'
import type {MusicLibraryVM} from '../MusicLibraryVM'

export const SongDetails = observer(({vm}: {vm: MusicLibraryVM}) => {
  const {musicLibrary} = vm.rootStore
  const {indexedArtists, indexedAlbums, songSelected} = musicLibrary
  const song = musicLibrary.songs.find((song) => song.filePath === songSelected)

  return (
    <Modal modalVM={vm.songDetailsDialog} withCloseButton right className="pad-default" width="2x">
      {song && (
        <div>
          <div className="flex-row-center justify-between gap-2">
            <span className="label">Title</span>
            {song.title}
          </div>
          <div className="flex-row-center justify-between gap-2">
            <span className="label">Album</span>
            {indexedAlbums[song.albumId]?.name || 'Not found album'}
          </div>
          <div className="flex-row-center justify-between gap-2">
            <span className="label">Artist</span>
            {indexedArtists[song.artistId]?.name || 'Not found artist'}
          </div>
          <div className="flex-row-center justify-between gap-2">
            <span className="label">Track number</span>
            {song.trackNumber}
          </div>
          <div className="flex-row-center justify-between gap-2">
            <span className="label">Year</span>
            {song.year}
          </div>
          <div className="flex-row-center justify-between gap-2">
            <span className="label">File path</span>
            <span className="txt-right">{song.filePath}</span>
          </div>
        </div>
      )}
    </Modal>
  )
})
