import { hasOwn } from '../utils'
import { Point } from '../math'
import type { PaintingContext } from './painting-context'
import { RenderShape } from './render-shape'
import type { StyleMap } from './style-map'

export class RenderRRect extends RenderShape {

  protected override trackStyle() {
    super.trackStyle()
    this.style.on('rx', this.handleRxChange, this)
    if (hasOwn(this.style, 'rx')) {
      this.handleRxChange(this.style.rx)
    }
    this.style.on('ry', this.handleRyChange, this)
    if (hasOwn(this.style, 'strokeWidth')) {
      this.handleRyChange(this.style.ry)
    }
  }

  protected handleRxChange(value: StyleMap['rx']) {
    if (value) {
      this.rx = value
    } else {
      this.rx = 0
    }
  }

  protected handleRyChange(value: StyleMap['ry']) {
    if (value) {
      this.ry = value
    } else {
      this.ry = 0
    }
  }

  private _rx = 0
  get rx() {
    return this._rx
  }
  set rx(value) {
    this._rx = value
    this.markPaintDirty()
  }
  private _ry = 0
  get ry() {
    return this._ry
  }
  set ry(value) {
    this._ry = value
    this.markPaintDirty()
  }

  paint(context: PaintingContext, offset: Point) {
    const { fillPaint, strokePaint } = this

    if (fillPaint) {
      context.canvas.drawRRect(
        offset.x,
        offset.y,
        this.size.width,
        this.size.height,
        this._rx,
        this._ry,
        fillPaint,
      )
    }
    if (strokePaint) {
      context.canvas.drawRRect(
        offset.x,
        offset.y,
        this.size.width,
        this.size.height,
        this._rx,
        this._ry,
        strokePaint,
      )
    }
  }
}
