import {observer} from 'mobx-react'
import {useRef} from 'react'

import type {RootStore} from '@renderer/stores/RootStore'

const playIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
    <path
      className="icon-path"
      d="M29.3 14.7L4.3.2C3.3-.4 2 .4 2 1.5v28.9c0 1.2 1.3 1.9 2.3 1.3l25-14.4c1-.6 1-2.1 0-2.6z"
    />
  </svg>
)
const pauseIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
    <path
      className="icon-path"
      d="M11.1 0H4.9C3.6 0 2.5 1.1 2.5 2.5v27.1c0 1.4 1.1 2.5 2.5 2.5h6.2c1.4 0 2.5-1.1 2.5-2.5V2.5C13.5 1.1 12.4 0 11.1 0zm16 0h-6.2c-1.4 0-2.5 1.1-2.5 2.5v27.1c0 1.4 1.1 2.5 2.5 2.5h6.2c1.4 0 2.5-1.1 2.5-2.5V2.5C29.5 1.1 28.4 0 27.1 0z"
    />
  </svg>
)

const nextIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
    <path
      className="icon-path"
      d="M4.1 32c.5 0 1.2.1 1.7-.3l14.3-12.1v9.6c0 1.5 1.2 2.8 2.8 2.8h4.2c1.5 0 2.8-1.2 2.8-2.8V2.8c0-1.5-1.2-2.8-2.8-2.8H23c-1.5 0-2.8 1.2-2.8 2.8v9.7L5.8.4C5.3 0 4.6.1 4.1.1c-2 0-2 1.8-2 2.3v27.4c0 .3 0 2.2 2 2.2z"
    />
  </svg>
)

const previousIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
    <path
      className="icon-path"
      d="M27.9 0c-.5 0-1.2-.1-1.7.3L11.8 12.4V2.8C11.8 1.2 10.6 0 9 0H4.9C3.3 0 2.1 1.2 2.1 2.8v26.4c0 1.5 1.2 2.8 2.8 2.8H9c1.5 0 2.8-1.2 2.8-2.8v-9.7l14.3 12.1c.5.4 1.2.3 1.7.3 2 0 2-1.8 2-2.3V2.3c.1-.4.1-2.3-1.9-2.3z"
    />
  </svg>
)

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
      {/* <audio className="audio-player" ref={audioRef} controls /> */}
      <div>
        <button className="player__btn" type="button" onClick={musicPlayer.togglePause}>
          {musicPlayer.isPlaying ? pauseIcon : playIcon}
        </button>
        {/* <button className='player__btn' type="button" onClick={handleStopSong}>
              Stop
            </button> */}
        <button className="player__btn" type="button" onClick={handlePrevSong}>
          {previousIcon}
        </button>
        <button className="player__btn" type="button" onClick={handleNextSong}>
          {nextIcon}
        </button>
        <input
          className="input-range"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={musicPlayer.volume}
          onChange={handleVolumeChange}
        />

        <div className="player__times">
          <div className="player__time">
            {positionInMinSec.minutes}:{padNumber(positionInMinSec.seconds)}
          </div>
          /
          <div className="player__time">
            {durationInMinSec.minutes}:{padNumber(durationInMinSec.seconds)}
          </div>
          <input
            className="input-range"
            type="range"
            min="0"
            max={100}
            value={positionInPercent}
            onChange={handlePositionChange}
          />
        </div>
      </div>
    </div>
  )
})
