import {observer} from 'mobx-react'
import type {FC} from 'react'
import type {DialogVM} from '../../viewModels/DialogVM'
import {type IPopoverProps, Popover} from './Popover'

type IPopoverXProps = Omit<IPopoverProps, 'isOpen' | 'hide' | 'uiStore'> & {
  className?: string
  dialogVM: DialogVM
}

/**
 * Popover that uses DialogVM to control the popover state.
 *
 * @example
 * const trigger = <Button onClick={dialogVM.toggle}>Open Popover</Button>
 * <PopoverX dialogVM={dialogVM} trigger={trigger}>
 *   <div>Popover content</div>
 * </PopoverX>
 */
export const PopoverX: FC<IPopoverXProps> = observer(
  ({dialogVM, className = '', ...otherProps}) => {
    const cssClasses = `${className} ${dialogVM.dialogClassName}`
    return (
      <Popover
        {...otherProps}
        isOpen={dialogVM.visible}
        hide={dialogVM.hide}
        className={cssClasses}
      />
    )
  }
)
