import * as mobx from 'mobx'
import type {MouseEvent} from 'react'

export type DialogState = 'visible' | 'hidden' | 'showing' | 'hiding'

/** Duration in milliseconds */
export type DialogTransition = {
  duration: number
  showingClassName: string
  hidingClassName: string
}

/**
 * - __id__: optional id passed for debugging purposes
 * - __visible__: initial state of the dialog. Default: `false`
 * - __transitionDelay__: amount of time between the state hiding and visible false. Default: `0`
 */
export interface IDialogOptions {
  hideOnOverlayClick?: boolean
  id?: string | number
  onHide?: () => void
  onOpen?: () => void
  state?: 'showing' | 'hiding' | 'visible' | 'hidden'
  transition?: DialogTransition
}

export class DialogVM implements IDialogOptions {
  static visibleStates: DialogState[] = ['showing', 'visible']
  readonly isConfirmDialog: boolean = false
  hideOnOverlayClick = true
  hideWithBackButton = true
  hideWithEscapeKey = true
  id = Math.random()
  onHide?: () => void
  onOpen?: () => void
  state: DialogState = 'hidden'
  transition: DialogTransition = {
    duration: 0,
    showingClassName: '',
    hidingClassName: '',
  }

  /**
   * A dialog UI is visible when shown and during its hiding/showing transitions
   */
  get visible() {
    return this.state === 'visible' || this.state === 'showing' || this.state === 'hiding'
  }

  get dialogClassName(): string {
    return DialogVM.visibleStates.includes(this.state)
      ? this.transition.showingClassName
      : this.state === 'hiding'
        ? this.transition.hidingClassName
        : 'hidden'
  }

  set<K extends keyof IDialogOptions>(this: IDialogOptions, prop: K, value: IDialogOptions[K]) {
    this[prop] = value
  }

  show(cb?: (() => unknown) | MouseEvent) {
    this.state = 'showing'
    setTimeout(() => {
      this.set('state', 'visible')
      typeof cb === 'function' && cb()
      this.onOpen?.()
    }, this.transition.duration)
  }

  hide(cb?: (() => unknown) | MouseEvent) {
    this.state = 'hiding'
    setTimeout(() => {
      this.set('state', 'hidden')
      this.onHide?.()
      typeof cb === 'function' && cb()
    }, this.transition.duration)
  }

  toggle(cb?: (() => unknown) | MouseEvent) {
    DialogVM.visibleStates.includes(this.state) ? this.hide(cb) : this.show()
  }

  onOverlayClick(event: MouseEvent) {
    if (this.hideOnOverlayClick && event.currentTarget === event.target) {
      this.hide()
    }
  }

  constructor(opts: IDialogOptions = {}) {
    Object.assign(this, opts)
    mobx.makeObservable(this, {
      dialogClassName: mobx.computed,
      hide: mobx.action.bound,
      onOverlayClick: mobx.action.bound,
      set: mobx.action.bound,
      show: mobx.action.bound,
      state: mobx.observable,
      toggle: mobx.action.bound,
      transition: mobx.observable.ref,
      visible: mobx.computed,
    })
  }
}
