import * as mobx from 'mobx'
import {ObservableViewport} from './ObservableViewport'

// See variables.less
enum breakPoints {
  x2 = 768,
  x3 = 1144,
  x4 = 1520,
}

/**
 * Observable screen media queries.
 */
export class MediaQuery {
  public viewPort = new ObservableViewport()

  get screen1x() {
    return this.viewPort.size.width < breakPoints.x2
  }

  get screen2x() {
    const {width} = this.viewPort.size
    return width >= breakPoints.x2 && width < breakPoints.x3
  }

  get screen3x() {
    const {width} = this.viewPort.size
    return width >= breakPoints.x3 && width < breakPoints.x4
  }

  get screen4x() {
    return this.viewPort.size.width >= breakPoints.x4
  }

  get screenMin2x() {
    return this.viewPort.size.width >= breakPoints.x2
  }

  get screenMin3x() {
    return this.viewPort.size.width >= breakPoints.x3
  }

  get screenMin4x() {
    return this.viewPort.size.width >= breakPoints.x4
  }

  get screenMax1x() {
    return this.viewPort.size.width < breakPoints.x2
  }

  get screenMax2x() {
    return this.viewPort.size.width < breakPoints.x3
  }

  get screenMax3x() {
    return this.viewPort.size.width < breakPoints.x4
  }

  constructor() {
    mobx.makeAutoObservable(this, undefined, {autoBind: true, deep: false})
  }
}
