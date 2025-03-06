import {type IInputBasicProp, InputBasic, type InputType} from '../InputBasic'

/**
 * We have specific css class for appearance of input types,
 * but not all are handled, default is text
 */
const inputClasses: Map<undefined | InputType, string> = new Map([
  [undefined, 'input-text'],
  ['text', 'input-text'],
  ['range', 'input-range'],
  ['checkbox', 'input-checkbox'],
])

interface IInputProp extends IInputBasicProp {
  valid?: boolean
}

export const Input = (props: IInputProp) => {
  const {className = '', valid, ...otherProps} = props
  const extraClass = `${inputClasses.get(props.type) || 'input-text'} ${
    valid ? '' : 'input--invalid '
  }${className}`

  return <InputBasic className={extraClass} {...otherProps} />
}
