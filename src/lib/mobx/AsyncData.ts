import * as mobx from 'mobx'

interface IAsyncData<T> {
  debounce: number
  error: Error | null
  lastAttempt: number
  loaded: boolean
  pending: boolean
  updatedAt: number
  value: T
}

/**
 * Observable model of typical asynchronous data state
 *
 * Observable properties: `pending`, `loaded`, `value`, `updatedAt`, `lastAttempt` `error`
 *
 * ### Usage example
 * Provide your model to a view, like a React component and manage the model in a store.
 *
 ```
 // NewsStore.js (pseudo code)
 import myNewsApi from 'myNewsApi'

 class NewsStore {
   news = new AsyncData(
     [],
     () => myNewsApi.fetchNews()
   )
 }

 // React component (pseudo code)
 function NewsComponent (props) {
   const {news} = props
   return (
     <div>
       <button onclick={news.fetch}>Update news</button>
       {news.pending && <p>Loading...</p>}
       {news.error && <p>Error</p>}
       {news.value.map((item) => <h3>{item.title}</h3>)}
     </div>
   )
 }
 ```
 */

export default class AsyncData<T> implements IAsyncData<T> {
  pending = false
  loaded = false
  value: T
  updatedAt = 0
  lastAttempt = 0
  debounce = 0
  error: Error | null = null
  private readonly initialValue: T
  private readonly fetchHandler: (...args: any) => Promise<T>
  private readonly onError: (err: Error) => void
  static defaultErrorHandler(error: Error) {
    console.error(error)
  }

  set<K extends keyof IAsyncData<T>>(this: IAsyncData<T>, prop: K, value: IAsyncData<T>[K]) {
    this[prop] = value
  }

  setValue(value: T) {
    this.value = value
  }

  /**
   * Helper to assign multiple props values through a mobx action.
   */
  public assign(props: Partial<IAsyncData<T>>) {
    Object.assign(this, props)
  }

  /**
   * Update async data
   */
  async fetch(...args: any) {
    const now = Date.now()
    if (this.debounce && now - this.updatedAt < this.debounce) {
      return this.value
    }
    this.assign({pending: true, error: null})
    try {
      const value = await this.fetchHandler(...args)
      this.assign({value, updatedAt: now})
      return value
    } catch (error) {
      this.onError?.(error)
      this.set('error', error)
      return error as Error
    } finally {
      this.assign({pending: false, lastAttempt: now})
      this.set('loaded', true)
    }
  }

  /**
   * Reset observable state to initial state
   */
  reset() {
    this.assign({
      error: null,
      loaded: false,
      value: this.initialValue,
      pending: false,
      lastAttempt: 0,
      updatedAt: 0,
    })
  }

  constructor(
    initialValue: T,
    fetchHandler: (...args: any) => Promise<T>,
    opts?: {onError?: (error: Error) => void; debounce?: number}
  ) {
    this.fetchHandler = fetchHandler
    this.value = initialValue
    this.initialValue = initialValue
    this.onError = opts?.onError ?? AsyncData.defaultErrorHandler
    this.debounce = opts?.debounce ?? 0
    mobx.makeAutoObservable(this, undefined, {deep: false, autoBind: true})
  }
}
