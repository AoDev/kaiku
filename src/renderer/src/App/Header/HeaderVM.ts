import {makeAutoObservable} from 'mobx'
import type {RootStore} from '@renderer/stores/RootStore'
import * as store from '../../../../lib/mobx/store.helpers'

export class HeaderVM {
  rootStore: RootStore
  set: store.SetMethod<HeaderVM>

  constructor({rootStore}: {rootStore: RootStore}) {
    this.rootStore = rootStore
    this.set = store.setMethod<HeaderVM>(this)
    makeAutoObservable(this, {rootStore: false}, {autoBind: true, deep: false})
  }
}
