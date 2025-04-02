import {ErrorBoundary} from '@src/lib/react'
import {Modal} from '@ui'
import {observer} from 'mobx-react'
import {AppHandledError} from './AppHandledError'
import AppSettings from './AppSettings'
import {AppUnexpectedError} from './AppUnexpectedError'
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
      fallback={() => <AppUnexpectedError rootStore={vm.rootStore} />}
    >
      <div className="app">
        <Header />
        <MusicLibrary />
        <Playlist rootStore={vm.rootStore} />
      </div>
      <Footer />
      <Modal
        modalVM={vm.rootStore.uiStore.settingsDialog}
        fullscreen
        className="pad-page"
        withCloseButton
      >
        <AppSettings />
      </Modal>
      <AppHandledError rootStore={vm.rootStore} />
      <AppWelcome vm={vm} />
      <AppUnexpectedError rootStore={vm.rootStore} />
    </ErrorBoundary>
  )
})
