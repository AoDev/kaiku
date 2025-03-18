import {join} from 'node:path'
import {app} from 'electron'

export const USER_DATA_FOLDER = app.getPath('userData')

/** Folder for the cover images storage */
export const COVER_FOLDER = join(USER_DATA_FOLDER, 'covers')

/** File for the music library storage*/
export const MUSIC_LIBRARY_FILE = join(USER_DATA_FOLDER, 'musicLibrary01.json')
