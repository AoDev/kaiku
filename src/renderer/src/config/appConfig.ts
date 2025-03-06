import type {Album} from '@rootsrc/types/Song'
import type {IconName} from '@ui'

export const DEFAULT_ALBUM_COVER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI4IiBmaWxsPSIjOTk5OTk5Ii8+PC9zdmc+'

export type Theme = 'light' | 'dark'

export const themeIcons: Record<Theme, IconName> = {light: 'sun', dark: 'moon'}

export const getAlbumCover = (album?: Album) => {
  if (album?.coverExtension) {
    return `cover://${album.id}.${album.coverExtension}`
  }
  return DEFAULT_ALBUM_COVER
}
