import * as store from '@lib/mobx/store.helpers'
import type {RootStore} from '@renderer/stores/RootStore'
import {makeAutoObservable} from 'mobx'

export class FooterVM {
  rootStore: RootStore
  set: store.SetMethod<FooterVM>

  destroyVM() {}

  constructor({rootStore}: {rootStore: RootStore}) {
    this.rootStore = rootStore
    this.set = store.setMethod<FooterVM>(this)
    makeAutoObservable(this, {rootStore: false}, {autoBind: true, deep: false})
  }
}
