import {makeAutoObservable} from 'mobx'
import {MusicLibrary} from './MusicLibrary'
import {MusicPlayer} from './MusicPlayer'

export class RootStore {
  musicLibrary = new MusicLibrary()
  musicPlayer = new MusicPlayer()

  constructor() {
    makeAutoObservable(this, {musicLibrary: false}, {deep: false, autoBind: true})
  }
}
