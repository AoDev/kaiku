import type {RootStore} from '@renderer/stores/RootStore'
import {padWithZero} from '@rootsrc/lib/number'
import {Button, Icon, Input} from '@ui'
import {observer} from 'mobx-react'
import {useCallback} from 'react'

/**
 * Formats a song time object into a string of minutes and seconds
 */
function formatTime(time: {minutes: number; seconds: number}) {
  return `${time.minutes}:${padWithZero(time.seconds)}`
}

export const Player = observer(({rootStore}: {rootStore: RootStore}) => {
  const {musicPlayer} = rootStore
  const {positionInMinSec, durationInMinSec, positionInPercent} = musicPlayer

  // biome-ignore lint/correctness/useExhaustiveDependencies: musicPlayer is immutable
  const handlePositionChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const position = Number(event.target.value)
    if (isFinite(position)) {
      musicPlayer.setPositionFromPercent(position)
    }
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: musicPlayer is immutable
  const handleVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = Number(event.target.value)
    if (isFinite(volume)) {
      musicPlayer.setVolume(volume)
    }
  }, [])

  return (
    <div className="player">
      <div className="player__times">
        <div className="player__time">{formatTime(positionInMinSec)}</div>/
        <div className="player__time">{formatTime(durationInMinSec)}</div>
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

      <div className="player__controls flex-row-center">
        <Button
          variant="icon"
          className="player__btn"
          onClick={musicPlayer.prev}
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

        <Button variant="icon" className="player__btn" onClick={musicPlayer.next} title="Next song">
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
        </div>
      </div>
    </div>
  )
})
