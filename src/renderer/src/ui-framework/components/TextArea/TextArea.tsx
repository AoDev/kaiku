import {isNumber} from '@rootsrc/lib/validators/number'
import {
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
} from 'react'

export interface ITextAreaProp extends Omit<InputHTMLAttributes<HTMLTextAreaElement>, 'value'> {
  /** Automatically grows the textarea to fit the content. */
  autoHeight?: boolean
  /** Automatically focuses on the input when mounted. */
  focusOnMount?: boolean
  maxHeight?: number
  onChangeNameValue?: (name: any, value: any, event?: ChangeEvent<HTMLTextAreaElement>) => void
  onChangeValue?: (value: any, event?: ChangeEvent<HTMLTextAreaElement>) => void
  /** Scrolls the viewport to the textarea when mounted */
  scrollToOnMount?: boolean
  /** Automatically selects the content when the field is focused */
  selectOnFocus?: boolean
  value?: string
}

/**
 * Textarea with additional features.
 *
 * It includes options such as:
 * * focusOnMount to automatically focus on the input when mounted.
 * * scrollToOnMount to scroll the viewport to the element when mounted.
 * * selectOnFocus to automatically select the content when the field is focused.
 * * autoHeight to automatically grow the textarea to fit the content.
 *
 * The component also accepts optional onChangeValue and onChangeNameValue callback functions
 * to handle changes to the textarea's value more easily.
 */
export function TextArea(props: ITextAreaProp) {
  const {
    autoHeight,
    className,
    focusOnMount,
    maxHeight,
    name,
    onChange,
    onChangeNameValue,
    onChangeValue,
    scrollToOnMount,
    selectOnFocus,
    onFocus,
    value,
    ...otherProps
  } = props

  const ref = useRef<HTMLTextAreaElement | null>(null)

  // handling focusOnMount, scrollToOnMount
  useEffect(() => {
    if (ref.current) {
      const isTouchDevice = 'ontouchstart' in window
      // focusOnMount can be problematic on touch devices because it brings the virtual keyboard that leads to bad UX
      focusOnMount && !isTouchDevice && ref.current.focus()
      scrollToOnMount && ref.current.scrollIntoView({behavior: 'smooth', block: 'center'})
    }
  }, [focusOnMount, scrollToOnMount])

  // handling autoHeight
  // biome-ignore lint/correctness/useExhaustiveDependencies: We depend on value to trigger the auto height feature
  useEffect(() => {
    if (ref.current && autoHeight) {
      ref.current.style.height = 'auto' // reset height, needed or the textarea will grow on each keypress
      const newHeight = ref.current.scrollHeight + 4 // adding 4px because of scrollbars
      const shouldStopGrowing = isNumber(maxHeight) && newHeight > maxHeight
      ref.current.style.height = shouldStopGrowing ? `${maxHeight}px` : `${newHeight}px`
      if (shouldStopGrowing) {
        ref.current.style.overflowY = 'auto'
      }
    }
  }, [autoHeight, maxHeight, value])

  // handling selectOnFocus
  const onFocusHandler = useCallback(
    (event: FocusEvent<HTMLTextAreaElement>) => {
      if (ref.current) {
        onFocus?.(event)
        selectOnFocus && event.target.select()
      }
    },
    [selectOnFocus, onFocus]
  )

  const onChangeHandler = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value
      onChange?.(event)
      onChangeValue?.(value, event)
      onChangeNameValue?.(name, value, event)
    },
    [onChange, onChangeNameValue, onChangeValue, name]
  )

  const cssClass = `textarea ${className || ''}${autoHeight ? ' textarea--auto-height' : ''}`

  return (
    <textarea
      {...otherProps}
      className={cssClass}
      value={value}
      ref={ref}
      onChange={onChangeHandler}
      onFocus={onFocusHandler}
    />
  )
}
