import {zoomTransition} from '@src/config/dialogConfig'
import type {RootStore} from '@src/stores'
import type {DialogVM} from '@ui'
import {autorun, makeAutoObservable} from 'mobx'
import DialogStore from './DialogStore'
import MediaQuery from './MediaQuery'

export class UIStore {
  rootStore: RootStore
  media = new MediaQuery()
  dialogs = new DialogStore()
  unexpectedErrorDialog: DialogVM
  settingsDialog: DialogVM

  get theme() {
    return this.rootStore.settings.theme
  }

  init() {
    autorun(
      () => {
        const {theme} = this.rootStore.settings
        const htmlElement = window.document.querySelector('html')
        if (htmlElement && theme) {
          htmlElement.setAttribute('theme', theme)
        }
      },
      {name: 'autoUpdateBodyClass'}
    )
  }

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    this.unexpectedErrorDialog = this.dialogs.create({
      id: 'appUnexpectedError',
      transition: zoomTransition,
    })
    this.settingsDialog = this.dialogs.create({
      id: 'appSettings',
      transition: zoomTransition,
    })
    makeAutoObservable(this, undefined, {deep: false, autoBind: true})
  }
}
