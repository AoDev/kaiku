import * as store from '@lib/mobx/store.helpers'
import type {RootStore} from '@renderer/stores/RootStore'
import {makeAutoObservable} from 'mobx'

export class AppVM {
  rootStore: RootStore
  set: store.SetMethod<AppVM>

  // Focus the search input when CMD+F is pressed
  focusSearch() {
    const searchInput = document.querySelector('[data-id="library-search"]')
    if (searchInput instanceof HTMLInputElement) {
      searchInput.focus()
      searchInput.select()
    }
  }

  togglePause() {
    this.rootStore.musicPlayer.togglePause()
  }

  onKeyDown(event: KeyboardEvent) {
    const {metaKey, ctrlKey, key} = event
    if ((metaKey || ctrlKey) && key === 'f') {
      event.preventDefault()
      this.focusSearch()
    }
    if ((metaKey || ctrlKey) && key === 'p') {
      event.preventDefault()
      this.togglePause()
    }
  }

  destroyVM() {
    window.removeEventListener('keydown', this.onKeyDown)
  }

  constructor({rootStore}: {rootStore: RootStore}) {
    this.rootStore = rootStore
    this.set = store.setMethod<AppVM>(this)
    makeAutoObservable(this, {rootStore: false}, {autoBind: true, deep: false})
    window.addEventListener('keydown', this.onKeyDown)
  }
}
