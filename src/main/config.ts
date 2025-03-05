import {join} from 'node:path'
import {app} from 'electron'

export const COVER_FOLDER = join(app.getPath('userData'), 'covers')
