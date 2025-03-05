export type AlbumCoverDetails = {
  fileExtension: string
  filePath: string
}

export function isAlbumCoverDetails(details: unknown): details is AlbumCoverDetails {
  return (
    typeof details === 'object' &&
    details !== null &&
    'fileExtension' in details &&
    'filePath' in details
  )
}
