import {Modal} from '@ui'
import {observer} from 'mobx-react'
import AppSettings from './AppSettings'
import type {AppVM} from './AppVM'
import Footer from './Footer'
import Header from './Header'
import MusicLibrary from './MusicLibrary'
import {Playlist} from './Playlist'

export const App = observer(({vm}: {vm: AppVM}) => {
  return (
    <div className="app-top">
      <div className="app">
        <Header />
        <MusicLibrary />
        <Footer />
      </div>
      <Playlist rootStore={vm.rootStore} />
      <Modal
        modalVM={vm.rootStore.uiStore.settingsDialog}
        fullscreen
        className="pad-page"
        withCloseButton
      >
        <AppSettings />
      </Modal>
    </div>
  )
})
