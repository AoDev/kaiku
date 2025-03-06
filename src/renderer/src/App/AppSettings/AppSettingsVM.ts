import type {RootStore} from '@src/stores'
import * as mobx from 'mobx'

export class AppSettingsVM {
  rootStore: RootStore

  constructor({rootStore}: {rootStore: RootStore}) {
    this.rootStore = rootStore
    mobx.makeAutoObservable(this, undefined, {deep: false, autoBind: true})
  }
}
