import type {RootStore} from '@renderer/stores/RootStore'
import {observer} from 'mobx-react'
import {Albums} from './Albums'
import {Artists} from './Artists'
import Header from './Header'
import {Playlist} from './Playlist'
import {ScanProgress} from './ScanProgress'
import {Songs} from './Songs'

export const App = observer(({rootStore}: {rootStore: RootStore}) => {
  return (
    <div className="app">
      <Header />
      <div className="library">
        <Artists rootStore={rootStore} />
        <Albums rootStore={rootStore} />
        <Songs rootStore={rootStore} />
        <Playlist rootStore={rootStore} />
      </div>

      <ScanProgress rootStore={rootStore} />
    </div>
  )
})
