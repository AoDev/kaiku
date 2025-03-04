import {observer} from 'mobx-react'
import type {RootStore} from '@renderer/stores/RootStore'

export const ScanProgress = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicLibrary} = rootStore
  const {scanProgress, metadataProgress} = musicLibrary

  if (scanProgress.status === 'idle' && metadataProgress.status === 'idle') {
    return null
  }

  // Determine which progress to show
  const showMetadataProgress = scanProgress.status === 'complete' && metadataProgress.total > 0

  return (
    <div className="scan-progress">
      {scanProgress.status === 'starting' && (
        <div className="scan-progress__message">Starting scan...</div>
      )}

      {scanProgress.status === 'scanning' && (
        <div className="scan-progress__message">
          <div className="scan-progress__spinner" />
          <span>Scanning: {scanProgress.count} audio files found</span>
        </div>
      )}

      {showMetadataProgress && metadataProgress.status === 'processing' && (
        <div className="scan-progress__message">
          <div className="scan-progress__spinner" />
          <span>
            Processing metadata: {metadataProgress.completed} of {metadataProgress.total} files
          </span>
        </div>
      )}

      {scanProgress.status === 'complete' && metadataProgress.status === 'complete' && (
        <div className="scan-progress__message scan-progress__message--complete">
          Scan complete: {scanProgress.count} audio files processed
        </div>
      )}
    </div>
  )
})
