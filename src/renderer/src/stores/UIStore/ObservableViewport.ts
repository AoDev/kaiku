import {throttle} from 'lodash'
import * as mobx from 'mobx'

/**
 * Expose viewport properties like size width / heigh as observable
 */
export class ObservableViewport {
  private throttledUpdateViewportSize: () => void

  // Return the viewport size; takes the scrollbars into account
  static getViewPortSize() {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    }
  }

  size = ObservableViewport.getViewPortSize()

  updateViewportSize() {
    this.size = ObservableViewport.getViewPortSize()
  }

  destroy() {
    window.removeEventListener('resize', this.throttledUpdateViewportSize)
  }

  constructor() {
    // Track viewport dimensions
    this.throttledUpdateViewportSize = throttle(() => this.updateViewportSize(), 100, {
      leading: false,
    })
    window.addEventListener('resize', this.throttledUpdateViewportSize, {
      passive: true,
    })
    mobx.makeAutoObservable(this, undefined, {autoBind: true, deep: false})

    // The app might display a scrollbar once the content is loaded that affects the width and height
    // We schedule an update to get the right size after one second.
    setTimeout(this.updateViewportSize, 1000)
  }
}
