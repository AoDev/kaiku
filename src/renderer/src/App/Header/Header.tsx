import {InputX} from '@renderer/ui-framework'
import {themeIcons} from '@src/config/appConfig'
import {Button, Icon, InputClearButton} from '@ui'
import {observer} from 'mobx-react'
import type {HeaderVM} from './HeaderVM'
import {Player} from './Player'

export const Header = observer(({vm}: {vm: HeaderVM}) => {
  const {musicLibrary, settings} = vm.rootStore

  return (
    <div className="header">
      <div className="flex-row-center gap-1">
        <Button className="nowrap" variant="blackwhite" onClick={musicLibrary.loadFromFolder}>
          Add Songs
        </Button>
        {/* <Button variant="icon" onClick={uiStore.settingsDialog.show}>
          <Icon name="settings" size={18} color="var(--color-txt-muted)" />
        </Button> */}
        <Button variant="icon" onClick={settings.switchTheme}>
          <Icon name={themeIcons[settings.theme]} size={18} />
        </Button>
        <Icon name="magnifier" size={18} />
        <div className="flex-row-center pos-rel">
          <InputX vm={vm} name="iSearch" placeholder="artist, album, song …" />
          <InputClearButton vm={vm} prop="iSearch" />
        </div>
        {/* {musicLibrary.folderPath && <p>Selected: {musicLibrary.folderPath}</p>} */}
      </div>
      <div className="justify-self-end">
        <Player rootStore={vm.rootStore} />
      </div>
    </div>
  )
})
