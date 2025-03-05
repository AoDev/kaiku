import type {RootStore} from '@renderer/stores/RootStore'
import {observer} from 'mobx-react'
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
    </div>
  )
})
