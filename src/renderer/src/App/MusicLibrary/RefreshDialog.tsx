import {Button, Modal} from '@ui'
import {observer} from 'mobx-react'
import type {CSSProperties} from 'react'
import type {MusicLibraryVM} from './MusicLibraryVM'

type FolderNode = {
  path: string
  name: string
  level: number
  children: FolderNode[]
}

const listContainerStyle: CSSProperties = {
  maxHeight: '400px',
}

export function buildFolderTree(folders: string[]): FolderNode[] {
  // Sort folders by path length to ensure parent folders come before children
  const sortedFolders = [...folders].sort((a, b) => a.length - b.length)

  // Find the minimum depth (root folder) and maximum depth
  const depths = sortedFolders.map((f) => f.split(/[/\\]/).length)
  const minDepth = Math.min(...depths)

  const tree: FolderNode[] = []
  const pathToNode = new Map<string, FolderNode>()

  for (const folder of sortedFolders) {
    // Handle both forward and backward slashes for cross-platform compatibility
    const parts = folder.split(/[/\\]/)

    // Create the current folder node
    const name = parts[parts.length - 1]
    // Calculate level relative to the root folder
    const level = parts.length - minDepth
    const node: FolderNode = {
      path: folder,
      name,
      level,
      children: [],
    }

    pathToNode.set(folder, node)

    // Find the closest parent from the provided folders
    const separator = folder.includes('\\') ? '\\' : '/'
    const parentPath = parts.slice(0, -1).join(separator)
    const parent = pathToNode.get(parentPath)

    // If we found a parent in our provided folders, add as child
    if (parent) {
      parent.children.push(node)
    } else {
      // If no parent found, this is a root level folder
      tree.push(node)
    }
  }
  return tree
}

function FolderTreeItem({
  node,
  selectedFolder,
  onSelect,
}: {
  node: FolderNode
  selectedFolder: string
  onSelect: (path: string) => void
}) {
  return (
    <div>
      <label
        className="flex items-center gap-2 clickable nowrap"
        style={{paddingLeft: node.level > 0 ? `${node.level}rem` : '0'}}
      >
        <input
          type="radio"
          name="refreshFolder"
          value={node.path}
          checked={selectedFolder === node.path}
          onChange={(e) => onSelect(e.target.value)}
        />
        <span>{node.name}</span>
      </label>
      {node.children.map((child) => (
        <FolderTreeItem
          key={child.path}
          node={child}
          selectedFolder={selectedFolder}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export const RefreshDialog = observer(function RefreshDialog({vm}: {vm: MusicLibraryVM}) {
  const folderTree = buildFolderTree(vm.refresh.folders)

  return (
    <Modal modalVM={vm.refreshDialog} width="2x" height="max-content">
      <div className="pad-default">
        <h3 className="h3 margin-top-0">Refresh Metadata</h3>

        <p className="txt-muted">Files in the selected folder will be scanned for metadata.</p>

        <div
          className="flex flex-col gap-2 margin-top-2 scrollbar-discreet-y"
          style={listContainerStyle}
        >
          {folderTree.map((node) => (
            <FolderTreeItem
              key={node.path}
              node={node}
              selectedFolder={vm.refresh.folderSelected}
              onSelect={vm.selectRefreshFolder}
            />
          ))}
        </div>
      </div>
      <div className="pad-default flex-row-center gap-1 justify-between">
        <Button variant="link" onClick={vm.refreshDialog.hide}>
          Cancel
        </Button>
        <Button
          variant="blackwhite"
          onClick={vm.refreshArtist}
          disabled={!vm.refresh.folderSelected}
        >
          Refresh
        </Button>
      </div>
    </Modal>
  )
})
