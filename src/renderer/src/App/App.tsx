import {ErrorBoundary} from '@src/lib/react'
import {Modal} from '@ui'
import {observer} from 'mobx-react'
import {AppError} from './AppError'
import AppSettings from './AppSettings'
import type {AppVM} from './AppVM'
import {AppWelcome} from './AppWelcome'
import Footer from './Footer'
import Header from './Header'
import MusicLibrary from './MusicLibrary'
import {Playlist} from './Playlist'

export const App = observer(({vm}: {vm: AppVM}) => {
  return (
    <ErrorBoundary
      onError={vm.rootStore.setErrorFromReactBoundary}
      fallback={() => <AppError rootStore={vm.rootStore} />}
    >
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
      <AppWelcome vm={vm} />
      <AppError rootStore={vm.rootStore} />
    </ErrorBoundary>
  )
})
