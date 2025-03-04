import {observer} from 'mobx-react'
import {InputClearButton, Button, Icon} from '@ui'
import type {HeaderVM} from './HeaderVM'
import {InputX} from '@renderer/ui-framework'
import {Player} from './Player'

export const Header = observer(({vm}: {vm: HeaderVM}) => {
  const {musicLibrary, musicPlayer} = vm.rootStore

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
      <div>
        {musicPlayer.song && (
          <>
            <b>{musicPlayer.song.title}</b>
            <div>
              <span className="txt-unit">by</span> {musicPlayer.song.artist}{' '}
              <span className="txt-unit">on</span> {musicPlayer.song.album}
            </div>
          </>
        )}
      </div>
      <div className="self-end">
        <Player rootStore={vm.rootStore} />
      </div>
    </div>
  )
})
