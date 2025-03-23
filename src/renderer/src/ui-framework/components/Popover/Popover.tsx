import type {UIStore} from '@src/stores/UIStore'
import {observer} from 'mobx-react'
import {inject} from 'mobx-react'
import type {FC} from 'react'
import {createPortal} from 'react-dom'
import {Button} from '../Button'
import {PopoverBasic, type PopoverBasicProps} from './PopoverBasic'

export type IPopoverProps = PopoverBasicProps & {
  fullscreen1x?: boolean
  uiStore: UIStore
  className?: string
}

/**
 * Popover with some styles by default and support for responsivefullscreen mode
 * @example
 * const trigger = <Button>Open Popover</Button>
 * const hideDialog = () => setIsOpen(false)
 * <Popover fullscreen1x trigger={trigger} isOpen={isOpen} hide={hideDialog}>
 *   <div>Popover content</div>
 * </Popover>
 */
const PopoverComponent: FC<IPopoverProps> = ({
  fullscreen1x = false,
  uiStore,
  className = '',
  isOpen,
  hide,
  ...otherProps
}) => {
  // Type narrowing based on dialogVM presence
  const isFullscreen = fullscreen1x && uiStore.media.screen1x && isOpen
  const cssClasses = `${isFullscreen ? 'popover--fullscreen' : 'popover--floating'} ${className}`

  if (isFullscreen) {
    return (
      <>
        {otherProps.trigger}
        {createPortal(
          <div className={`popover--fullscreen pad-default ${cssClasses}`}>
            <div className="flex-col height-100p">
              <div className="flex-fill">{otherProps.children}</div>
              <Button className="flex-col-end" variant="link" onClick={hide}>
                Close
              </Button>
            </div>
          </div>,
          document.body
        )}
      </>
    )
  }

  return <PopoverBasic {...otherProps} isOpen={isOpen} hide={hide} className={cssClasses} />
}

export const Popover = inject(({uiStore}: {uiStore: UIStore}) => ({uiStore}))(
  observer(PopoverComponent)
) as unknown as FC<Omit<IPopoverProps, 'uiStore'>>
