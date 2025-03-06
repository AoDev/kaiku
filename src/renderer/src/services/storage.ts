import * as localforage from 'localforage'

const store = localforage.createInstance({name: 'localforage'})

/**
 * Uses indexedDB as store
 */
export const storage = {
  /**
   * Get value from store
   */
  async get<T>(key: string, defaultValue: T): Promise<T> {
    const value = await store.getItem<T>(key)
    return value === null ? defaultValue : value
  },

  /**
   * Save item to store, unencrypted
   */
  save<T>(key: string, value: T) {
    return store.setItem<T>(key, value)
  },

  /**
   * Delete item from store
   */
  delete(key: string) {
    return store.removeItem(key)
  },

  keys() {
    return store.keys()
  },
}

/**
 * Create a CRUD helper for a particular entity type in local storage
 * Pass it a type, default value and a key generator function
 * It returns a function that creates the actual CRUD helper by providing the storage key
 * ```ts
 * const getPortfolioStorage = getLocalStorageCrud<IPortfolio>(null, (key) => `portfolio.${key}`)
 * const storage = getPortfolioStorage('THIS_PORTFOLIO_KEY')
 * ```
 */
export function getLocalStorageCrud<T>(defaultValue: T, keyGen: (key: string) => string) {
  return function create(key: string) {
    return {
      get() {
        return storage.get<T>(keyGen(key), defaultValue)
      },

      save(data: T) {
        return storage.save(keyGen(key), data)
      },

      deleteAll() {
        return storage.delete(keyGen(key))
      },
    }
  }
}
