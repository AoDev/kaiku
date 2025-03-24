import {observer} from 'mobx-react'
import {type CSSProperties, useCallback} from 'react'
import {Button, Icon} from '../../'

interface IProps<T> {
  prop: Extract<keyof T, string>
  vm: T & {
    set: (prop: any, value: any) => void
  }
}

const style: CSSProperties = {position: 'absolute', right: '-14px', bottom: '-5px'}

/**
 * Must be placed in a pos-rel container
 */
export const InputClearButton = observer(function InputClearButton<vm>({vm, prop}: IProps<vm>) {
  const clear = useCallback(() => vm.set(prop, ''), [prop, vm])
  const visible = vm[prop] !== ''
  if (!visible) {
    return null
  }
  return (
    <Button
      className={visible ? 'zoom-in hover--grow10p' : 'zoom-out'}
      variant="invisible"
      square
      style={style}
      onClick={clear}
    >
      <Icon
        name="cross"
        color="var(--color-txt-default)"
        bgColor="var(--color-bg-alternative)"
        size={20}
        bgPadding={5}
      />
    </Button>
  )
})
