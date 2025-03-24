import {withVM} from '@lib/mobx/withVM'
import {MusicLibrary} from './MusicLibrary'
import {MusicLibraryVM} from './MusicLibraryVM'
export default withVM(MusicLibrary, MusicLibraryVM)
