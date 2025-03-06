import * as mobx from 'mobx'
import {DialogVM, type IDialogOptions} from './DialogVM'

interface IConfirmDialogOptions extends IDialogOptions {
  canCancel?: boolean
  canConfirm?: boolean
  onConfirm?: () => void
  onCancel?: () => void
}

const {action, observable} = mobx

export class ConfirmDialogVM extends DialogVM implements IConfirmDialogOptions {
  readonly isConfirmDialog: boolean = true
  canCancel = true
  canConfirm = true
  onConfirm?: () => void
  onCancel?: () => void

  set<K extends keyof IConfirmDialogOptions>(
    this: IConfirmDialogOptions,
    prop: K,
    value: IConfirmDialogOptions[K],
  ) {
    this[prop] = value
  }

  assign(props: Record<string, unknown>) {
    Object.assign(this, props)
  }

  cancel() {
    if (this.onCancel) {
      this.onCancel()
    }
    this.hide()
  }

  confirm() {
    if (this.onConfirm) {
      this.onConfirm()
    }
    this.hide()
  }

  constructor(props: IConfirmDialogOptions = {}) {
    super(props)

    Object.assign(this, props)
    mobx.makeObservable(this, {
      canCancel: observable,
      canConfirm: observable,
      assign: action.bound,
      cancel: action.bound,
      confirm: action.bound,
    })
  }
}
