import type {RootStore} from '@renderer/stores/RootStore'
import {memo} from 'react'
import {Albums} from './Albums'
import {Artists} from './Artists'
import {Songs} from './Songs'

export const MusicLibrary = memo(({rootStore}: {rootStore: RootStore}) => {
  return (
    <div className="library">
      <Artists rootStore={rootStore} />
      <Albums rootStore={rootStore} />
      <Songs rootStore={rootStore} />
    </div>
  )
})
