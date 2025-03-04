import {observer} from 'mobx-react'
import {Player} from './Player'

import type {RootStore} from '@renderer/stores/RootStore'
import {Artists} from './Artists'
import {Albums} from './Albums'
import {Songs} from './Songs'
import {Playlist} from './Playlist'
import {ScanProgress} from './ScanProgress'

export const App = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicLibrary, musicPlayer} = rootStore

  return (
    <div className="app">
      <div className="header">
        <div>
          <button className="btn--add" type="button" onClick={musicLibrary.loadFromFolder}>
            Add Songs
          </button>
          {/* {musicLibrary.folderPath && <p>Selected: {musicLibrary.folderPath}</p>} */}
        </div>
        <div>
          {musicPlayer.song && (
            <>
              <b>{musicPlayer.song.title}</b>
              <div>
                <span className="txt-unit">by</span> {musicPlayer.song.artist}{' '}
                <span className="txt-unit">on</span> {musicPlayer.song.album}
              </div>
            </>
          )}
        </div>
        <div className="self-end">
          <Player rootStore={rootStore} />
        </div>
      </div>

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
