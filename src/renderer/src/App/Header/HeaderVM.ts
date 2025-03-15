import * as store from '@lib/mobx/store.helpers'
import type {RootStore} from '@renderer/stores/RootStore'
import {type IReactionDisposer, autorun, makeAutoObservable} from 'mobx'

export class HeaderVM {
  rootStore: RootStore
  set: store.SetMethod<HeaderVM>

  iSearch = ''
  stopFilterReaction: IReactionDisposer

  destroyVM() {
    this.stopFilterReaction()
  }

  constructor({rootStore}: {rootStore: RootStore}) {
    this.rootStore = rootStore
    this.set = store.setMethod<HeaderVM>(this)
    makeAutoObservable(this, {rootStore: false}, {autoBind: true, deep: false})

    this.stopFilterReaction = autorun(() => {
      this.rootStore.musicLibrary.setFilterDebounced(this.iSearch)
    })
  }
}
