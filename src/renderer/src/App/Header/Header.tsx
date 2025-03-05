import {InputX} from '@renderer/ui-framework'
import {Button, Icon, InputClearButton} from '@ui'
import {observer} from 'mobx-react'
import type {HeaderVM} from './HeaderVM'
import {Player} from './Player'

export const Header = observer(({vm}: {vm: HeaderVM}) => {
  const {musicLibrary} = vm.rootStore

  return (
    <div className="header">
      <div className="flex-row-center gap-1">
        <Button className="nowrap" variant="neutral" onClick={musicLibrary.loadFromFolder}>
          Add Songs
        </Button>
        <Icon name="magnifier" size={18} color="var(--color-txt-muted)" />
        <div className="flex-row-center pos-rel">
          <InputX vm={vm} name="iSearch" />
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
