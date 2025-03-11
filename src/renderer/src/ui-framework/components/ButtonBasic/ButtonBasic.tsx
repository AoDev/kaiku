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
  // ref?: any // TODO: wrong but dont know how to solve
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
    ...otherProps
  } = props

  const btnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (btnRef.current) {
      focusOnMount && btnRef.current.focus()
      scrollToOnMount && btnRef.current.scrollIntoView({behavior: 'smooth', block: 'center'})
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
