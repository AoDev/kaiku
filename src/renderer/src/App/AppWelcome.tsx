import kaikuImage from '@src/assets/images/kaiku-album.jpg'
import {Button} from '@ui'
import {observer} from 'mobx-react'
import type {AppVM} from './AppVM'

export const AppWelcome = observer(({vm}: {vm: AppVM}) => {
  const {songs, scanProgress} = vm.rootStore.musicLibrary

  if (songs.length > 0) {
    return null
  }

  return (
    <div className="welcome scroll-y">
      <div className="flex-col-center gap-1">
        <img className="welcome-bg" src={kaikuImage} alt="Kaiku" />
        <h2 className="h2">Kaiku Music Player</h2>
        <div>
          <Button
            isLoading={scanProgress.status === 'scanning'}
            className="nowrap"
            variant="blackwhite"
            onClick={vm.rootStore.musicLibrary.loadFromFolder}
          >
            Add Songs
          </Button>
        </div>
      </div>
    </div>
  )
})
