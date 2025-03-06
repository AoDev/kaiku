import {storage} from '@src/services'
import * as mobx from 'mobx'
import type {ISettingsStore, SettingsStore} from './SettingsStore'

/**
 * Manage the retrieval and persistance of app settings.
 */
export class SettingsDataStore {
  settingsStore: SettingsStore
  stopAutoSaveSettings?: mobx.IReactionDisposer

  getSettings(): Promise<Partial<ISettingsStore>> {
    return storage.get('app.settings', {})
  }

  saveSettings(settings: ISettingsStore) {
    localStorage.setItem('theme', settings.theme)
    return storage.save('app.settings', settings)
  }

  /**
   * Setup automatic persistence
   */
  async init() {
    const storedSettings = await this.getSettings()
    this.settingsStore.assign(storedSettings)

    /**
     * Auto save app settings on every change.
     */
    this.stopAutoSaveSettings = mobx.reaction(
      () => {
        // "We enumerate which props/setting need to be sync so mobx observe them."
        return {
          theme: this.settingsStore.theme,
        }
      },
      (settings) => this.saveSettings(settings),
      {name: 'autoSaveSettings', delay: 200},
    )
  }

  destroy() {
    this.stopAutoSaveSettings?.()
  }

  constructor(settingsStore: SettingsStore) {
    this.settingsStore = settingsStore
    mobx.makeAutoObservable(this, {settingsStore: false}, {deep: false, autoBind: true})
  }
}
