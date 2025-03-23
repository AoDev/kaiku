import {type AllHTMLAttributes, type MouseEvent, memo, useCallback, useEffect, useRef} from 'react'

export interface IButtonBasicProps<V> extends Omit<AllHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** Disables the button. */
  disabled?: boolean
  /** Disable the button without actual disabled attribute (iOS safari) */
  disabledMock?: boolean
  focusOnMount?: boolean
  name?: string
  type?: 'button' | 'submit' | 'reset'
  onClickNameValue?: (name: any, value: any, event?: MouseEvent<HTMLButtonElement>) => void
  onClickValue?: (value: any, event?: MouseEvent<HTMLButtonElement>) => void
  preventDefault?: boolean
  scrollToOnMount?: boolean
  value?: V
  ref?: React.Ref<HTMLButtonElement>
}

/**
 * Extended Button component
 *
 * __Extras compared to normal html button:__
 *
 * * By default it is of type "button" where html has no default value.
 * * disabledMock to disable the button without actual disabled attribute (iOS safari)
 * * focusOnMount: will focus button when mounted
 * * scrollToOnMount: will scroll to button on mount
 * * easier way to emit values with button
 */
export const ButtonBasic = memo(function ButtonBasic<V>(props: IButtonBasicProps<V>) {
  const {
    children,
    disabledMock = false,
    focusOnMount,
    name,
    onClick,
    onClickNameValue,
    onClickValue,
    preventDefault,
    scrollToOnMount,
    type = 'button',
    value,
    ref,
    ...otherProps
  } = props

  const innerRef = useRef<HTMLButtonElement | null>(null)

  // Combine the internal ref functionality with the external ref
  const btnRef = useCallback(
    (node: HTMLButtonElement | null) => {
      innerRef.current = node
      // Handle external ref if provided
      if (typeof ref === 'function') {
        ref(node)
      }
    },
    [ref]
  )

  useEffect(() => {
    if (innerRef.current) {
      focusOnMount && innerRef.current.focus()
      scrollToOnMount && innerRef.current.scrollIntoView({behavior: 'smooth', block: 'center'})
    }
  }, [focusOnMount, scrollToOnMount])

  /**
   * Call the onChange handler with different arguments, depending on the
   * emit option.
   * It will also take care of converting strings to number when necessary
   * because assigning a number to a select option value is always a string.
   * @param {Event} event
   */
  const onClickHandler = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (preventDefault || disabledMock) {
        // disabled mock is to prevent Safari Mobile from doing zoomish gesture
        // for type="submit" button, it is a form event and preventDefault must be called.
        event.preventDefault()
      }
      event.stopPropagation()
      if (disabledMock) {
        return
      }
      onClick?.(event)
      onClickValue?.(value, event)
      onClickNameValue?.(name, value, event)
    },
    [onClick, onClickNameValue, onClickValue, value, preventDefault, disabledMock, name]
  )

  return (
    <button type={type} {...otherProps} ref={btnRef} onClick={onClickHandler}>
      {children}
    </button>
  )
})
