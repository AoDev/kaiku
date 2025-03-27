import {FloatingPortal, useDismiss, useFloating, useInteractions} from '@floating-ui/react'
import {type Placement, autoUpdate, flip, offset, shift} from '@floating-ui/react-dom'
import {type ReactElement, type ReactNode, cloneElement} from 'react'

export interface PopoverBasicProps {
  // Specify that trigger must be able to accept a ref
  trigger: ReactElement<{ref?: React.Ref<any>}>
  children: ReactNode
  isOpen: boolean
  hide: () => void
  placement?: Placement
  offsetPx?: number
  paddingPx?: number
  className?: string
}

/**
 * Basic Popover with no styles, based on floating-ui
 * @example
 * <PopoverBasic trigger={<Button>Open Popover</Button>} isOpen={isOpen} hide={() => setIsOpen(false)}>
 *   <div>Popover content</div>
 * </PopoverBasic>
 */
export function PopoverBasic({
  trigger,
  children,
  isOpen,
  hide,
  placement = 'bottom-start',
  offsetPx = 8,
  paddingPx = 8,
  className = '',
}: PopoverBasicProps) {
  // Setup floating UI with appropriate middleware
  const {refs, floatingStyles, context} = useFloating({
    open: isOpen,
    onOpenChange: (open) => !open && hide(),
    placement,
    middleware: [offset(offsetPx), flip(), shift({padding: paddingPx})],
    whileElementsMounted: autoUpdate,
  })

  const dismiss = useDismiss(context)
  const {getReferenceProps, getFloatingProps} = useInteractions([dismiss])
  const triggerWithProps = cloneElement(trigger, {ref: refs.setReference, ...getReferenceProps()})
  // modals have z-index 5, so we need to be above that, if the popover is inside a modal
  const styles = {...floatingStyles, zIndex: 6}

  return (
    <>
      {triggerWithProps}
      {isOpen && (
        <FloatingPortal>
          <div ref={refs.setFloating} style={styles} {...getFloatingProps()}>
            <div className={className}>{children}</div>
          </div>
        </FloatingPortal>
      )}
    </>
  )
}
