import {observer} from 'mobx-react'
import {Icon, Button, Input} from '@ui'

import type {RootStore} from '@renderer/stores/RootStore'

function padNumber(number: number) {
  if (number < 10) {
    return `0${number}`
  }
  return number.toString()
}

export const Player = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicPlayer} = rootStore
  const {positionInMinSec, durationInMinSec, positionInPercent} = musicPlayer

  const handleNextSong = () => {
    musicPlayer.next()
  }

  const handlePrevSong = () => {
    musicPlayer.prev()
  }

  const handlePositionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const position = Number(event.target.value)
    if (isFinite(position)) {
      musicPlayer.setPositionFromPercent(position)
    }
  }

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = Number(event.target.value)
    if (isFinite(volume)) {
      musicPlayer.setVolume(volume)
    }
  }
  return (
    <div>
      <div>
        <div className="flex-row-center">
          <Button
            variant="icon"
            className="player__btn"
            onClick={handlePrevSong}
            title="Previous song"
          >
            <Icon name="previous" />
          </Button>
          <Button
            variant="icon"
            className="player__btn"
            onClick={musicPlayer.togglePause}
            title={musicPlayer.isPlaying ? 'Pause' : 'Play'}
          >
            <Icon name={musicPlayer.isPlaying ? 'pause' : 'play'} />
          </Button>
          <Button variant="icon" className="player__btn" onClick={handleNextSong} title="Next song">
            <Icon name="next" />
          </Button>
          <Input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={musicPlayer.volume}
            onChange={handleVolumeChange}
            title="Volume control"
          />
        </div>

        <div className="player__times">
          <div className="player__time">
            {positionInMinSec.minutes}:{padNumber(positionInMinSec.seconds)}
          </div>
          /
          <div className="player__time">
            {durationInMinSec.minutes}:{padNumber(durationInMinSec.seconds)}
          </div>
          <Input
            type="range"
            min="0"
            max={100}
            value={positionInPercent}
            onChange={handlePositionChange}
            title="Playback position"
          />
        </div>
      </div>
    </div>
  )
})
