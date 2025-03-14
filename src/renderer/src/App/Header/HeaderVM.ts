import * as store from '@lib/mobx/store.helpers'
import type {RootStore} from '@renderer/stores/RootStore'
import {type IReactionDisposer, autorun, makeAutoObservable} from 'mobx'

export class HeaderVM {
  rootStore: RootStore
  set: store.SetMethod<HeaderVM>

  iSearch = ''
  stopFilterReaction: IReactionDisposer

  // Focus the search input when CMD+F is pressed
  triggerSearchHotkey(event: KeyboardEvent) {
    // Check for CMD+F (Mac) or CTRL+F (Windows/Linux)
    if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
      event.preventDefault()
      const searchInput = document.querySelector('[data-id="library-search"]')
      if (searchInput instanceof HTMLInputElement) {
        searchInput.focus()
        searchInput.select()
      }
    }
  }

  destroyVM() {
    this.stopFilterReaction()
    window.removeEventListener('keydown', this.triggerSearchHotkey)
  }

  constructor({rootStore}: {rootStore: RootStore}) {
    this.rootStore = rootStore
    this.set = store.setMethod<HeaderVM>(this)
    makeAutoObservable(this, {rootStore: false}, {autoBind: true, deep: false})

    this.stopFilterReaction = autorun(() => {
      this.rootStore.musicLibrary.setFilterDebounced(this.iSearch)
    })

    window.addEventListener('keydown', this.triggerSearchHotkey)
  }
}
