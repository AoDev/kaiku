import {Modal} from '@ui'
import {observer} from 'mobx-react'
import type {MusicLibraryVM} from './MusicLibraryVM'

export const SongDetails = observer(({vm}: {vm: MusicLibraryVM}) => {
  const {musicLibrary} = vm.rootStore
  const {indexedArtists, indexedAlbums} = musicLibrary

  return (
    <Modal modalVM={vm.songDetailsDialog} withCloseButton right className="pad-default" width="2x">
      {vm.songContextMenu.song && (
        <div>
          <div className="flex-row-center justify-between gap-2">
            <span className="label">Title</span>
            {vm.songContextMenu.song.title}
          </div>
          <div className="flex-row-center justify-between gap-2">
            <span className="label">Album</span>
            {indexedAlbums[vm.songContextMenu.song.albumId].name}
          </div>
          <div className="flex-row-center justify-between gap-2">
            <span className="label">Artist</span>
            {indexedArtists[vm.songContextMenu.song.artistId].name}
          </div>
          <div className="flex-row-center justify-between gap-2">
            <span className="label">Track number</span>
            {vm.songContextMenu.song.trackNumber}
          </div>
          <div className="flex-row-center justify-between gap-2">
            <span className="label">Year</span>
            {vm.songContextMenu.song.year}
          </div>
          <div className="flex-row-center justify-between gap-2">
            <span className="label">File path</span>
            <span className="txt-right">{vm.songContextMenu.song.filePath}</span>
          </div>
        </div>
      )}
    </Modal>
  )
})
