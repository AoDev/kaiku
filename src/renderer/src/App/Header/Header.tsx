import {InputX} from '@renderer/ui-framework'
import {themeIcons} from '@src/config/appConfig'
import {Button, Icon, InputClearButton} from '@ui'
import {observer} from 'mobx-react'
import {AppMenu} from './AppMenu'
import type {HeaderVM} from './HeaderVM'
import {Player} from './Player'

export const Header = observer(({vm}: {vm: HeaderVM}) => {
  const {settings} = vm.rootStore

  return (
    <div className="header">
      <div className="flex-row-center gap-1">
        <AppMenu vm={vm} />
        <Button variant="icon" onClick={settings.switchTheme}>
          <Icon name={themeIcons[settings.theme]} size={18} />
        </Button>
        <Icon name="magnifier" size={18} />
        <div className="flex-row-center pos-rel">
          <InputX
            vm={vm}
            name="iSearch"
            data-id="library-search"
            placeholder="artist, album, song …"
          />
          <InputClearButton vm={vm} prop="iSearch" />
        </div>
      </div>
      <div className="justify-self-end">
        <Player rootStore={vm.rootStore} />
      </div>
    </div>
  )
})
