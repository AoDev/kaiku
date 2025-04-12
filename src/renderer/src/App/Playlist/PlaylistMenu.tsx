import {Button, ButtonMenu, Icon, PopoverX} from '@ui'
import {observer} from 'mobx-react'
import type {AppVM} from '../AppVM'

export const PlaylistMenu = observer(({vm}: {vm: AppVM}) => {
  const {playlistMenuDialog} = vm

  const trigger = (
    <Button variant="icon" onClick={playlistMenuDialog.toggle}>
      <Icon name="menu-dot-vertical" />
    </Button>
  )

  return (
    <PopoverX trigger={trigger} dialogVM={playlistMenuDialog} className="pad-05" fullscreen1x>
      <ButtonMenu icon="eraser" onClick={vm.clearPlaylist} label="Clear Playlist" />
    </PopoverX>
  )
})
