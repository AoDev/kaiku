import {observer} from 'mobx-react'
import type {FooterVM} from './FooterVM'
import {ScanProgress} from './ScanProgress'

export const Footer = observer(({vm}: {vm: FooterVM}) => {
  const {musicLibrary} = vm.rootStore
  const {scanProgress} = musicLibrary

  if (scanProgress.status === 'idle') {
    return null
  }

  return (
    <div className="footer flex-row-center gap-1 justify-between zoom-in">
      <div className="flex-row-center gap-1" />
      <ScanProgress rootStore={vm.rootStore} />
    </div>
  )
})
