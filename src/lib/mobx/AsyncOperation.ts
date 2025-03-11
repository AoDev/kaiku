import {makeAutoObservable} from 'mobx'

export class AsyncOperation<R, T extends () => Promise<R>> {
  pending = false
  error: Error | null = null
  private readonly fetchHandler: T

  private assign(props: Partial<Pick<AsyncOperation<R, T>, 'pending' | 'error'>>) {
    Object.assign(this, props)
  }

  async run() {
    this.assign({pending: true, error: null})
    try {
      await this.fetchHandler()
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      this.assign({error})
    } finally {
      this.assign({pending: false})
    }
  }

  constructor(fetchHandler: T) {
    this.fetchHandler = fetchHandler
    makeAutoObservable(this, undefined, {deep: false, autoBind: true})
  }
}
