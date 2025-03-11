import {observer} from 'mobx-react'
import {Albums} from './Albums'
import {Artists} from './Artists'
import type {MusicLibraryVM} from './MusicLibraryVM'
import {Songs} from './Songs'

export const MusicLibrary = observer(({vm}: {vm: MusicLibraryVM}) => {
  return (
    <div className="library">
      <Artists vm={vm} />
      <Albums vm={vm} />
      <Songs vm={vm} />
    </div>
  )
})
