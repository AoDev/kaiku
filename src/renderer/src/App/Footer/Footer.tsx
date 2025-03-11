import {observer} from 'mobx-react'
import type {FooterVM} from './FooterVM'
import {ScanProgress} from './ScanProgress'

export const Footer = observer(({vm}: {vm: FooterVM}) => {
  const {scanProgress} = vm.rootStore.musicLibrary

  if (scanProgress.status === 'idle') {
    return null
  }

  return (
    <div className="footer zoom-in">
      <div className="bg-alternative flex-row-center gap-1 justify-between">
        <div className="flex-row-center gap-1" />
        <ScanProgress rootStore={vm.rootStore} />
      </div>
    </div>
  )
})
