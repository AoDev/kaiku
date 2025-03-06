import {themeIcons} from '@src/config'
import {Button, Icon} from '@ui'
import {observer} from 'mobx-react'
import type {AppSettingsVM} from './AppSettingsVM'

export const AppSettings = observer(({vm}: {vm: AppSettingsVM}) => {
  const {settings} = vm.rootStore

  return (
    <div className="grid-2-col-2x grid-3-col-4x line-height-15 margin-bottom-default">
      <section className="panel--simple pos-rel pad-default flex-center">
        <div className="txt-center">
          <h3 className="h3 margin-0">App Settings</h3>
          <p>All changes are saved on the device automatically.</p>
        </div>
      </section>

      <section className="panel--simple pad-default flex-col pos-rel">
        <div className="panel__header margin-bottom-2">
          <h3 className="h3 margin-0">UI Settings</h3>
        </div>
        <div className="flex-fill">
          <div className="flex-row-center">
            <Button
              round
              className="pad-0 margin-right-1"
              variant="discreet"
              onClick={settings.switchTheme}
            >
              <Icon size={20} name={themeIcons[settings.theme]} />
            </Button>

            <span className="label margin-right-1">
              Color theme: <i className="txt-muted">{settings.theme}</i>
            </span>
          </div>
        </div>
      </section>
    </div>
  )
})
