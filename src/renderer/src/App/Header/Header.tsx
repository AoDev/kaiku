import {themeIcons} from '@src/config/appConfig'
import {Button, Icon, type IconName, InputClearButton, InputX} from '@ui'
import {observer} from 'mobx-react'
import {AppMenu} from './AppMenu'
import type {HeaderVM} from './HeaderVM'
import {Player} from './Player'

export const Header = observer(({vm}: {vm: HeaderVM}) => {
  const {settings} = vm.rootStore
  const {playlistDialog, media} = vm.rootStore.uiStore
  const iconProps: {name: IconName; size: number} = playlistDialog.visible
    ? {name: 'vinyl', size: 24}
    : {name: 'play', size: 18}
  const playerVisible = playlistDialog.visible || media.screenMin2x

  return (
    <div className="header">
      {((!playlistDialog.visible && media.screen1x) || media.screenMin2x) && (
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
      )}
      {playerVisible && <Player rootStore={vm.rootStore} />}
      {media.screenMax1x && (
        <Button className="flex-row-end" variant="icon" onClick={playlistDialog.toggle}>
          <Icon {...iconProps} />
        </Button>
      )}
    </div>
  )
})
