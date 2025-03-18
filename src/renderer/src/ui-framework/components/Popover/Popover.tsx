import type {UIStore} from '@src/stores'
import {inject, observer} from 'mobx-react'
import type {FC, ReactNode} from 'react'
import ReactPopover, {type PopoverPlace} from 'react-popover'
import {Portal} from 'react-portal'
import {Button} from '../Button'

const variantClasses = {
  primary: 'Popover-primary',
  white: 'Popover-white',
}

export interface IPopoverProps {
  body: ReactNode // Content of the popover
  children?: ReactNode // Button or other element that triggers the popover
  className?: string
  close?: (arg?: any) => void
  enterExitTransitionDurationMs?: number
  isOpen: boolean
  onOuterAction?: () => any
  place?: PopoverPlace
  preferPlace?: PopoverPlace
  tipSize?: number
  variant?: 'primary' | 'white'
  uiStore: UIStore
  fullscreen1x?: boolean
}

/**
 * A generic popover component useful to display tooltips and context menus.
 *
 * Example:
 * ```tsx
 * <Popover
 *   body={"Hello, world!"}
 *   isOpen={true|false}
 * >
 *   <Button onClick={uiStore.togglePopover}>
 *     "Click me!"
 *   </Button>
 * </Popover>
 * ```
 */
export function Popover({
  variant = 'white',
  className = '',
  enterExitTransitionDurationMs = 200,
  tipSize = 10,
  fullscreen1x = false,
  uiStore,
  close,
  ...otherProps
}: IPopoverProps) {
  const cssClasses = `${variantClasses[variant]} ${className}`

  if (fullscreen1x && uiStore.media.screen1x && otherProps.isOpen) {
    return (
      <Portal>
        <div className={`Popover--fullscreen pad-default zoom-in ${className}`}>
          <div className="flex-col height-100p">
            <div className="flex-fill">{otherProps.body}</div>
            <Button className="flex-col-end" variant="link" onClick={close}>
              Close
            </Button>
          </div>
        </div>
      </Portal>
    )
  }

  return (
    <ReactPopover
      enterExitTransitionDurationMs={enterExitTransitionDurationMs}
      tipSize={tipSize}
      {...otherProps}
      className={cssClasses}
    />
  )
}

export const PopoverX = inject(({uiStore}: {uiStore: UIStore}) => ({uiStore}))(
  observer(Popover)
) as unknown as FC<Omit<IPopoverProps, 'uiStore'>>
