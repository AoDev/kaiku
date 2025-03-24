import {
  type ChangeEvent,
  type FC,
  type FocusEvent,
  type InputHTMLAttributes,
  memo,
  useCallback,
} from 'react'
import type {InputType} from './input.types'

export interface IInputBasicProp extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value'> {
  fitContent?: boolean
  focusOnMount?: boolean
  onChangeNameValue?: (name: any, value: any, event?: ChangeEvent<HTMLInputElement>) => void
  onChangeValue?: (value: any, event?: ChangeEvent<HTMLInputElement>) => void
  scrollToOnMount?: boolean
  selectOnFocus?: boolean
  value?: string | number | boolean
  type?: InputType
}

const inputTypesWithChars = ['text', 'search', 'tel', 'url', 'email', 'password', 'number']

/**
 * Change the input width based on the length of the value for the fitContent prop
 */
const adjustWidth = (node: HTMLInputElement) => {
  if (!inputTypesWithChars.includes(node.type)) {
    return
  }
  const count = node.value.length
  // TODO: Should take into account non num chars and other punctuations that has different width
  node.style.width = `${count === 0 ? 4 : count}ch`
}

export const InputBasic: FC<IInputBasicProp> = memo(
  ({
    fitContent,
    focusOnMount,
    onChange,
    onChangeNameValue,
    onChangeValue,
    scrollToOnMount,
    selectOnFocus,
    style = {},
    value,
    type = 'text',
    ...otherProps
  }) => {
    const shouldConvertToNumber = type === 'number' || type === 'range' || typeof value === 'number'

    // https://tkdodo.eu/blog/avoiding-use-effect-with-callback-refs
    const inputRef = useCallback(
      (node: HTMLInputElement) => {
        if (node) {
          const isTouchDevice = 'ontouchstart' in window

          if (focusOnMount && !isTouchDevice) {
            node.focus()
          }
          if (scrollToOnMount) {
            node.scrollIntoView({behavior: 'smooth', block: 'center'})
          }
          if (fitContent) {
            adjustWidth(node)
          }
        }
      },
      [fitContent, focusOnMount, scrollToOnMount]
    )

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        let inputValue: string | number | boolean = event.target.value

        if (shouldConvertToNumber) {
          if (inputValue.length > 0) {
            const convertedValue = Number(inputValue)
            // biome-ignore lint/suspicious/noGlobalIsNan: convertedValue is a number
            if (!isNaN(convertedValue)) {
              inputValue = convertedValue
            }
          }
        } else if (type === 'checkbox') {
          inputValue = event.target.checked
        }

        fitContent && adjustWidth(event.target)

        onChange?.(event)
        onChangeValue?.(inputValue, event)
        onChangeNameValue?.(event.target.name, inputValue, event)
      },
      [onChange, onChangeValue, onChangeNameValue, fitContent, type, shouldConvertToNumber]
    )

    const selectContent = useCallback((event: FocusEvent<HTMLInputElement>) => {
      event.target.select()
    }, [])

    if (selectOnFocus) {
      otherProps.onFocus = selectContent
    }

    if (type === 'checkbox' && typeof value === 'boolean') {
      otherProps.checked = value
    }

    return (
      <input
        {...otherProps}
        type={type}
        style={style}
        value={typeof value === 'boolean' ? String(value) : value}
        ref={inputRef}
        onChange={handleChange}
      />
    )
  }
)
