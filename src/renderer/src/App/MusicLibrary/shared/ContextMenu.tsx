import {ButtonMenu} from '@ui'
import type {DialogVM, IconName} from '@ui'
import {observer} from 'mobx-react'
import {Portal} from 'react-portal'

export type ContextMenuState<T> = {
  x: number
  y: number
  data?: T
  items: {icon: IconName; label: string; onClick: () => void}[]
}

/**
 * Reusable context menu component
 */
export const ContextMenu = observer(function ContextMenu<T>({
  dialog,
  contextMenu,
}: {
  dialog: DialogVM
  contextMenu: ContextMenuState<T>
}) {
  if (!dialog.visible) {
    return null
  }

  return (
    <Portal>
      <div
        className={`context-menu ${dialog.dialogClassName}`}
        style={{
          position: 'fixed',
          top: `${contextMenu.y}px`,
          left: `${contextMenu.x}px`,
        }}
      >
        {contextMenu.items.map((item) => (
          <ButtonMenu key={item.label} {...item} />
        ))}
      </div>
    </Portal>
  )
})
