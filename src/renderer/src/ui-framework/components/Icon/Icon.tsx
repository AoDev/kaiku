import type {CSSProperties} from 'react'
import type {IconName} from './iconNames.d'

export interface IProps extends React.AllHTMLAttributes<HTMLSpanElement> {
  /** The icon background color; valid html/hex color */
  bgColor?: string
  /** A padding is created between the icon and its wrapper. (Icon size is affected) */
  bgPadding?: number
  /** Any CSS class */
  className?: string
  /** Icon height. */
  height?: number
  /** Left offset; helper to align with text by offseting the relative position */
  left?: number
  /** id of the icon sprite (= name of the svg file) */
  name: IconName
  /** use fill or stroke mode - TODO check if it works still */
  rendering?: 'fill' | 'stroke'
  /** Set width and height to same size. CSS value or number. */
  size?: number
  /** Top offset; helper to align with text by offseting the relative position */
  top?: number
  /** Icon width. */
  width?: number
}

/**
 * Display an icon from our sprites.
 *
 * __How to use?__
 *
 * Provide the name of the icon prefixed by a '#'.
 *
 * The default size is 32x32.
 * Avoid random sizes. You can use the "small" prop to have a 16x16 icon.
 *
 * There are multiple options to customize the icon and its background.
 */
export function Icon(props: IProps) {
  const {
    height,
    width,
    color = 'currentcolor',
    name,
    size = 16,
    top = 0,
    left = 0,
    bgColor,
    bgPadding,
    rendering = 'fill',
    className = '',
    ...otherProps
  } = props

  const wrapperStyle: CSSProperties = {
    width: width || size,
    height: height || size,
    top: `${top}px`,
    left: `${left}px`,
    backgroundColor: bgColor,
    padding: bgPadding ? `${bgPadding}px` : undefined,
    fontSize: 0, // needed because of character white space
  }

  const renderMode = {[rendering]: color}
  const svgStyle = {[rendering]: color}

  if (rendering === 'stroke') {
    svgStyle.fill = 'transparent'
  }

  return (
    <span style={wrapperStyle} className={`icon pos-rel ${className}`} {...otherProps}>
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: alt text should be provided in the parent component */}
      <svg width="100%" height="100%" {...renderMode} style={svgStyle} className="icon-svg">
        <use xlinkHref={`#${name}`} />
      </svg>
    </span>
  )
}
