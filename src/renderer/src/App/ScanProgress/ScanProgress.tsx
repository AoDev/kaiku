import {observer} from 'mobx-react'
import type {RootStore} from '@renderer/stores/RootStore'
import {Button, Icon} from '@ui'

export const ScanProgress = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicLibrary} = rootStore
  const {scanProgress, metadataProgress} = musicLibrary

  if (scanProgress.status === 'idle' && metadataProgress.status === 'idle') {
    return null
  }

  // Determine which progress to show
  const showMetadataProgress = scanProgress.status === 'complete' && metadataProgress.total > 0

  return (
    <div className="scan-progress panel--simple pad-default txt-right">
      {scanProgress.status === 'starting' && <div className="">Starting scan...</div>}

      {scanProgress.status === 'scanning' && (
        <div className="scan-progress__message">
          <div className="flex-row-center gap-1">
            <h3 className="h3 margin-0">Scanning</h3>
            <div className="scan-progress__spinner" />
          </div>
          <span className="txt-good">{scanProgress.count}</span> audio files found
        </div>
      )}

      {showMetadataProgress && metadataProgress.status === 'processing' && (
        <div className="">
          <div className="flex-row-center gap-1">
            <h3 className="h3 margin-0">Processing metadata</h3>
            <div className="scan-progress__spinner" />
          </div>
          <div>
            <span className="txt-good">{metadataProgress.completed}</span> of{' '}
            <b>{metadataProgress.total}</b> files
          </div>
        </div>
      )}

      {scanProgress.status === 'complete' && metadataProgress.status === 'complete' && (
        <div className="">
          <div className="flex-row-center justify-between">
            <h3 className="h3 margin-0">Scan complete</h3>
            <Button variant="icon" onClick={musicLibrary.resetProgress}>
              <Icon name="check-circle" size={20} color="var(--color-green-aim)" />
            </Button>
          </div>
          <div>
            <span className="txt-good">{scanProgress.count}</span> audio files processed
          </div>
        </div>
      )}
    </div>
  )
})
