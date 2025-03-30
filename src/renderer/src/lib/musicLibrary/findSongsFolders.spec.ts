import {describe, expect, it} from 'vitest'
import type {Artist, Song} from '../../../../types/MusicLibrary.types'
import {findSongsFolders} from './findSongsFolders'

const artistName = 'Test Artist'

const createArtist = (name: string): Artist => ({
  id: '1',
  name,
  albums: [],
})

const createSong = (filePath: string): Song => ({
  year: 2024,
  trackNumber: 1,
  title: 'Test Song',
  artist: artistName,
  artistId: '1',
  album: 'Test Album',
  albumId: '1',
  filePath,
  disk: {no: 1, of: 1},
})

const songsWithArtistFolder = [
  createSong(`/Volumes/Data/Music/Rock/${artistName}/Album1/song1.mp3`),
  createSong(`/Volumes/Data/Music/Rock/${artistName}/Album2/song2.mp3`),
]

const songsWithoutArtistFolder = [
  createSong('/Volumes/Data/Music/Anime/DBZ/OST2/01 - Song 1.mp3'),
  createSong('/Volumes/Data/Music/Anime/DBZ/OST2/02 - Song 2.mp3'),
  createSong('/Volumes/Data/Music/Anime/DBZ/OST3/01 - Song 1.mp3'),
  createSong('/Volumes/Data/Music/Anime/DBZ/OST3/02 - Song 2.mp3'),
]

describe('findSongsFolders', () => {
  it('should return empty result when no songs are provided', () => {
    const artist = createArtist(artistName)
    const result = findSongsFolders(artist, [])
    expect(result).toEqual({artistFolder: '', parentFolders: []})
  })

  it('should find artist folder when it exists', () => {
    const artist = createArtist('Test Artist')
    const result = findSongsFolders(artist, songsWithArtistFolder)
    expect(result.artistFolder).toBe('/Volumes/Data/Music/Rock/Test Artist')
    expect(result.parentFolders).toContain('/Volumes/Data/Music/Rock/Test Artist')
    expect(result.parentFolders).toContain('/Volumes/Data/Music/Rock/Test Artist/Album1')
    expect(result.parentFolders).toContain('/Volumes/Data/Music/Rock/Test Artist/Album2')
    expect(result.parentFolders).toContain('/Volumes/Data/Music/Rock')
  })

  it('should handle case-insensitive artist folder names', () => {
    const artist = createArtist('Test Artist')
    const songs = [createSong('/Volumes/Data/Music/TEST ARTIST/Album1/song1.mp3')]

    const result = findSongsFolders(artist, songs)
    expect(result.artistFolder).toBe('/Volumes/Data/Music/TEST ARTIST')
  })

  it('should handle backslashes in paths', () => {
    const artist = createArtist('Test Artist')
    const songs = [createSong('Volumes\\Data\\Music\\Test Artist\\Album1\\song1.mp3')]

    const result = findSongsFolders(artist, songs)
    expect(result.artistFolder).toBe('Volumes\\Data\\Music\\Test Artist')
  })

  it('should return parent folders even when artist folder is not found, limited to 3 levels', () => {
    const artist = createArtist('Test Artist')
    const songs = songsWithoutArtistFolder

    const result = findSongsFolders(artist, songs)
    expect(result.artistFolder).toBe('')
    expect(result.parentFolders).toEqual([
      '/Volumes/Data/Music/Anime/DBZ/OST2',
      '/Volumes/Data/Music/Anime/DBZ/OST3',
      '/Volumes/Data/Music/Anime/DBZ',
      '/Volumes/Data/Music/Anime',
      '/Volumes/Data/Music',
    ])
  })

  it('should sort parent folders by depth (deepest first)', () => {
    const artist = createArtist('Test Artist')
    const songs = [createSong('/Volumes/Data/Music/Test Artist/Album1/song1.mp3')]

    const result = findSongsFolders(artist, songs)
    const depths = result.parentFolders.map((folder) => folder.split('/').length)
    expect(depths).toEqual([...depths].sort((a, b) => b - a))
  })

  it('should include folders from all paths when no artist folder is found', () => {
    const artist = createArtist('Unknown Artist')
    const songs = [
      createSong('/Volumes/Data/Music/A/Test Artist/Album1/song1.mp3'),
      createSong('/Volumes/Data/Music/B/Other Artist/Album2/song2.mp3'),
    ]

    const result = findSongsFolders(artist, songs)
    expect(result.artistFolder).toBe('')
    expect(result.parentFolders).toContain('/Volumes/Data/Music/A/Test Artist/Album1')
    expect(result.parentFolders).toContain('/Volumes/Data/Music/A/Test Artist')
    expect(result.parentFolders).toContain('/Volumes/Data/Music/A')
    expect(result.parentFolders).toContain('/Volumes/Data/Music/B/Other Artist/Album2')
    expect(result.parentFolders).toContain('/Volumes/Data/Music/B/Other Artist')
    expect(result.parentFolders).toContain('/Volumes/Data/Music/B')
    expect(result.parentFolders).toContain('/Volumes/Data/Music')
  })
})
