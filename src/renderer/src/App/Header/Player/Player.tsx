import type {RootStore} from '@renderer/stores/RootStore'
import {Button, Icon, Input} from '@ui'
import {observer} from 'mobx-react'

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
    <div className="flex-row-center height-100p gap-1">
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
          className="player__track"
          min="0"
          max={100}
          value={positionInPercent}
          onChange={handlePositionChange}
          title="Playback position"
        />
      </div>

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
        <div className="flex-row-center margin-left-05">
          <Icon name="volume-up" />
          <Input
            type="range"
            className="player__volume"
            min="0"
            max="1"
            step="0.01"
            value={musicPlayer.volume}
            onChange={handleVolumeChange}
            title="Volume control"
          />
          {/* <Icon name="volume-up" /> */}
        </div>
      </div>
    </div>
  )
})
