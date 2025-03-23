import * as store from '@lib/mobx/store.helpers'
import type {RootStore} from '@renderer/stores/RootStore'
import {zoomTransition} from '@src/config'
import type {DialogVM} from '@ui'
import {type IReactionDisposer, autorun, makeAutoObservable} from 'mobx'

export class HeaderVM {
  rootStore: RootStore
  set: store.SetMethod<HeaderVM>

  iSearch = ''
  stopFilterReaction: IReactionDisposer
  menuDialog: DialogVM

  addSongs() {
    this.rootStore.musicLibrary.loadFromFolder()
    this.menuDialog.hide()
  }

  askClearLibrary() {
    if (window.confirm('Are you sure you want to clear the library?')) {
      this.rootStore.musicLibrary.clearLibrary()
    }
    this.menuDialog.hide()
  }

  destroyVM() {
    this.stopFilterReaction()
    this.rootStore.uiStore.dialogs.remove([this.menuDialog])
  }

  constructor({rootStore}: {rootStore: RootStore}) {
    this.rootStore = rootStore
    this.set = store.setMethod<HeaderVM>(this)
    makeAutoObservable(this, {rootStore: false}, {autoBind: true, deep: false})
    this.menuDialog = rootStore.uiStore.dialogs.create({id: 'app-menu', transition: zoomTransition})

    this.stopFilterReaction = autorun(() => {
      this.rootStore.musicLibrary.setFilterDebounced(this.iSearch)
    })
  }
}
