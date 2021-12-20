
type DprObserverCallback = (dpr: number) => void;

export class DprObserver {

  constructor(
    private readonly callback: DprObserverCallback
  ) {
    this.addListener()
  }

  private addListener() {
    // 浏览器缩放时会触发 resize
    self.onresize = () => {
      this.dpr = self.devicePixelRatio
    }
    this.handleMqlChange()
  }

  private removeListener() {
    self.onresize = null
    this.mql?.removeListener(this.handleMqlChange)
  }

  private mql?: MediaQueryList

  private handleMqlChange = () => {
    this.mql?.removeListener(this.handleMqlChange)
    const dpr = self.devicePixelRatio
    this.mql = self.matchMedia(
      `screen and (min-resolution: ${dpr - 0.001}dppx) and (max-resolution: ${dpr + 0.001}dppx)`)
    this.mql.addListener(this.handleMqlChange)
    this.dpr = dpr
  }

  get dpr() {
    return this._dpr
  }
  set dpr(value) {
    if (this._dpr === value) {
      return
    }
    this._dpr = value
    this.callback(this._dpr)
  }
  private _dpr = self.devicePixelRatio

  disconnect() {
    this.removeListener()
  }
}
