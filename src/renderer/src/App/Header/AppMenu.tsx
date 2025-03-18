import {Button, ButtonMenu, PopoverX} from '@ui'
import {observer} from 'mobx-react'
import type {HeaderVM} from './HeaderVM'

export const AppMenu = observer(({vm}: {vm: HeaderVM}) => {
  const {menuDialog, rootStore} = vm
  const {musicLibrary} = rootStore

  const menuContent = (
    <div>
      <ButtonMenu
        isLoading={musicLibrary.scanProgress.status === 'scanning'}
        icon="vinyl"
        onClick={vm.addSongs}
        label="Add Songs"
      />
      <ButtonMenu
        isLoading={musicLibrary.scanProgress.status === 'scanning'}
        icon="eraser"
        onClick={vm.askClearLibrary}
        label="Clear Library"
      />
    </div>
  )
  return (
    <PopoverX
      className="app-menu"
      body={menuContent}
      isOpen={menuDialog.visible}
      onOuterAction={menuDialog.hide}
      fullscreen1x
      close={menuDialog.hide}
    >
      {/* <Button variant="blackwhite" round className="pad-0" onClick={menuDialog.toggle}>
        <Icon name="menubars" size={18} />
      </Button> */}

      <Button variant="blackwhite" onClick={menuDialog.toggle}>
        Menu
      </Button>
    </PopoverX>
  )
})
