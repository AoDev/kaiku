import {observer} from 'mobx-react'
import type {HeaderVM} from './HeaderVM'
import {Player} from './Player'

export const Header = observer(({vm}: {vm: HeaderVM}) => {
  const {musicLibrary, musicPlayer} = vm.rootStore

  return (
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
        <Player rootStore={vm.rootStore} />
      </div>
    </div>
  )
})
