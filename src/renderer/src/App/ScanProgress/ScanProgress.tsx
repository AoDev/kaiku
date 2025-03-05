import {observer} from 'mobx-react'
import type {RootStore} from '@renderer/stores/RootStore'
import {Button, Icon} from '@ui'

export const ScanProgress = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicLibrary} = rootStore
  const {scanProgress} = musicLibrary

  if (scanProgress.status === 'idle') {
    return null
  }

  if (scanProgress.status === 'starting') {
    return (
      <div className="scan-progress panel--simple pad-default txt-right">
        <div>Starting scan...</div>
      </div>
    )
  }

  if (scanProgress.status === 'scanning') {
    return (
      <div className="scan-progress panel--simple pad-default txt-right">
        <div className="flex-row-center justify-end gap-1">
          <h3 className="h3 margin-0">Scanning</h3>
          <div className="scan-progress__spinner" />
        </div>
        <div>
          <span className="txt-good">{scanProgress.completed}</span> of <b>{scanProgress.total}</b>{' '}
          files
        </div>
      </div>
    )
  }

  return (
    <div className="scan-progress panel--simple pad-default txt-right">
      <div className="flex-row-center justify-end gap-1">
        <h3 className="h3 margin-0">Scan complete</h3>
        <Button narrow variant="icon" onClick={musicLibrary.resetProgress}>
          <Icon name="check-circle" size={20} color="var(--color-green-aim)" />
        </Button>
      </div>
      <div>
        <span className="txt-good">{scanProgress.completed}</span> audio files processed
      </div>
    </div>
  )
})
