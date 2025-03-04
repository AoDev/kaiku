import type {CSSProperties} from 'react'

interface ILoaderProps {
  label?: string
  className?: string
  small?: boolean
  white?: boolean
  inline?: boolean
  bar?: boolean
  dot?: boolean
  visible?: boolean
  top?: string | number
  left?: string | number
  style?: CSSProperties
}

export default function Loader(props: ILoaderProps) {
  const {top, left, label, className, small, inline, bar, dot, style = {}, visible = true} = props

  if (!visible) {
    return null
  }

  if (bar) {
    return <div className={`bld ${className || ''}`} />
  }

  if (dot) {
    if (top || left) {
      style.position = 'relative'
    }
    if (top) {
      style.top = typeof top === 'number' ? `${top}px` : top
    }
    if (left) {
      style.left = typeof left === 'number' ? `${left}px` : left
    }
    return <div className={`loader--dot ${className || ''}`} style={style} />
  }

  const cssClasses = `loader${small ? ' loader-sm' : ''}${inline ? ' loader-inline' : ''} ${
    className || ''
  }`

  return (
    <div className={cssClasses} style={style}>
      <div className="loader-bar-wrapper">
        <div className="loader-bar loader-bar-1" />
        <div className="loader-bar loader-bar-2" />
        <div className="loader-bar loader-bar-3" />
        <div className="loader-bar loader-bar-4" />
        <div className="loader-bar loader-bar-5" />
      </div>
      {label && <p className="loader-label">{label}</p>}
    </div>
  )
}
