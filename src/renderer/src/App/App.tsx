import type {RootStore} from '@renderer/stores/RootStore'
import {Button, Modal} from '@ui'
import {observer} from 'mobx-react'
import AppSettings from './AppSettings'
import Header from './Header'
import {MusicLibrary} from './MusicLibrary'
import {Playlist} from './Playlist'
import {ScanProgress} from './ScanProgress'

export const App = observer(({rootStore}: {rootStore: RootStore}) => {
  return (
    <div className="app-top">
      <div className="app">
        <Header />
        <MusicLibrary rootStore={rootStore} />
        <ScanProgress rootStore={rootStore} />
      </div>
      <Playlist rootStore={rootStore} />
      <Button onClick={() => rootStore.uiStore.settingsDialog.show()}>Open settings</Button>
      <Modal modalVM={rootStore.uiStore.settingsDialog} fullscreen className="pad-page">
        <AppSettings />
      </Modal>
    </div>
  )
})
