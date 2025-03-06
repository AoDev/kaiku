import * as store from '@lib/mobx/store.helpers'
import type {RootStore} from '@renderer/stores/RootStore'
import {makeAutoObservable} from 'mobx'

export class AppVM {
  rootStore: RootStore
  set: store.SetMethod<AppVM>

  constructor({rootStore}: {rootStore: RootStore}) {
    this.rootStore = rootStore
    this.set = store.setMethod<AppVM>(this)
    makeAutoObservable(this, {rootStore: false}, {autoBind: true, deep: false})
  }
}
