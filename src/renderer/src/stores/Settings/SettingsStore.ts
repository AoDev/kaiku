import * as store from '@lib/mobx/store.helpers'
import type {Theme} from '@src/config/appConfig'
import * as mobx from 'mobx'

export interface ISettingsStore {
  theme: Theme
}

export class SettingsStore implements ISettingsStore {
  set: store.SetMethod<SettingsStore>
  assign: store.AssignMethod<SettingsStore>
  toggle: store.ToggleMethod<SettingsStore>

  theme: Theme = 'dark'

  switchTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light'
  }

  constructor() {
    this.set = store.setMethod<SettingsStore>(this)
    this.assign = store.assignMethod<SettingsStore>(this)
    this.toggle = store.toggleMethod<SettingsStore>(this)
    mobx.makeAutoObservable(this, undefined, {deep: false, autoBind: true})
  }
}
