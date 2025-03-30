import {describe, expect, it} from 'vitest'
import {buildFolderTree} from './RefreshDialog'

const singleArtistTestFolders = [
  '/Volumes/Data 1/Music/No Metal/A/Aerosmith/Big Ones',
  '/Volumes/Data 1/Music/No Metal/A/Aerosmith/Get A Grip',
  '/Volumes/Data 1/Music/No Metal/A/Aerosmith/Just Push Play',
  '/Volumes/Data 1/Music/No Metal/A/Aerosmith',
  '/Volumes/Data 1/Music/No Metal/A',
  '/Volumes/Data 1/Music/No Metal',
  '/Volumes/Data 1/Music',
]

describe('buildFolderTree', () => {
  it('should return empty array when no folders provided', () => {
    const result = buildFolderTree([])
    expect(result).toEqual([])
  })

  it('builds a tree for folders that have the same root', () => {
    const result = buildFolderTree(singleArtistTestFolders)

    // Verify the entire tree structure at once
    expect(result).toEqual([
      {
        path: '/Volumes/Data 1/Music',
        name: 'Music',
        level: 0,
        children: [
          {
            path: '/Volumes/Data 1/Music/No Metal',
            name: 'No Metal',
            level: 1,
            children: [
              {
                path: '/Volumes/Data 1/Music/No Metal/A',
                name: 'A',
                level: 2,
                children: [
                  {
                    path: '/Volumes/Data 1/Music/No Metal/A/Aerosmith',
                    name: 'Aerosmith',
                    level: 3,
                    children: [
                      {
                        path: '/Volumes/Data 1/Music/No Metal/A/Aerosmith/Big Ones',
                        name: 'Big Ones',
                        level: 4,
                        children: [],
                      },
                      {
                        path: '/Volumes/Data 1/Music/No Metal/A/Aerosmith/Get A Grip',
                        name: 'Get A Grip',
                        level: 4,
                        children: [],
                      },
                      {
                        path: '/Volumes/Data 1/Music/No Metal/A/Aerosmith/Just Push Play',
                        name: 'Just Push Play',
                        level: 4,
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
  })
})
