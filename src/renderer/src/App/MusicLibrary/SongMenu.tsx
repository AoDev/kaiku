import {ButtonMenu} from '@ui'
import {observer} from 'mobx-react'
import {Portal} from 'react-portal'
import type {MusicLibraryVM} from './MusicLibraryVM'

/**
 * Context menu for songs
 */
export const SongMenu = observer(({vm}: {vm: MusicLibraryVM}) => {
  if (!vm.songMenuDialog.visible) {
    return null
  }

  return (
    <Portal>
      <div
        className={`context-menu ${vm.songMenuDialog.dialogClassName}`}
        style={{
          position: 'fixed',
          top: `${vm.songContextMenu.y}px`,
          left: `${vm.songContextMenu.x}px`,
        }}
      >
        {vm.songMenuItems.map((item) => (
          <ButtonMenu key={item.label} {...item} />
        ))}
      </div>
    </Portal>
  )
})
