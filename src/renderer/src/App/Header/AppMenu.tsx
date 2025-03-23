import {Button, ButtonMenu, PopoverX} from '@ui'
import {observer} from 'mobx-react'
import type {HeaderVM} from './HeaderVM'

export const AppMenu = observer(({vm}: {vm: HeaderVM}) => {
  const {menuDialog, rootStore} = vm
  const {musicLibrary} = rootStore

  const trigger = (
    <Button variant="blackwhite" onClick={menuDialog.toggle}>
      Menu
    </Button>
  )

  return (
    <PopoverX trigger={trigger} dialogVM={menuDialog} className="pad-05" fullscreen1x>
      <ButtonMenu
        isLoading={musicLibrary.scanProgress.status === 'scanning'}
        icon="vinyl"
        onClick={vm.addSongs}
        label="Add Songs"
      />
      <ButtonMenu
        disabled={musicLibrary.scanProgress.status === 'scanning'}
        icon="eraser"
        onClick={vm.askClearLibrary}
        label="Clear Library"
      />
    </PopoverX>
  )
})
