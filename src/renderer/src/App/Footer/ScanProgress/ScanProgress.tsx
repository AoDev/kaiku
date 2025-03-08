import type {RootStore} from '@renderer/stores/RootStore'
import {Button, Icon} from '@ui'
import {observer} from 'mobx-react'

export const ScanProgress = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicLibrary} = rootStore
  const {scanProgress} = musicLibrary

  if (scanProgress.status === 'idle') {
    return null
  }

  if (scanProgress.status === 'starting') {
    return (
      <div className="scan-progress flex-row-center gap-1 pad-h-1 txt-right nowrap">
        <div>Starting scan…</div>
      </div>
    )
  }

  if (scanProgress.status === 'scanning') {
    return (
      <div className="scan-progress flex-row-center gap-1 pad-h-1 txt-right nowrap">
        <div>
          <span className="txt-good">{scanProgress.completed}</span> of <b>{scanProgress.total}</b>{' '}
          files
        </div>
        -
        <div className="flex-row-center gap-05">
          Scanning
          <div className="scan-progress__spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="scan-progress flex-row-center gap-1 pad-h-1 txt-right nowrap">
      <div>
        <span className="txt-good">{scanProgress.completed}</span> songs
      </div>
      -
      <div className="flex-row-center gap-05">
        Scan complete
        <Button narrow variant="icon" onClick={musicLibrary.resetProgress}>
          <Icon name="check-circle" size={20} color="var(--color-green-aim)" />
        </Button>
      </div>
    </div>
  )
})
