import {describe, expect, it} from 'vitest'
import {SettingsStore} from './SettingsStore'

describe('SettingsStore', () => {
  describe('initial state', () => {
    it('should have sane defaults', () => {
      const settingsStore = new SettingsStore()
      expect(settingsStore.theme).toBe('dark')
    })
  })
})
