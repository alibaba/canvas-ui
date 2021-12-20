import { Point } from '../math'
import type { PaintingContext } from './painting-context'
import { RenderShape } from './render-shape'

export class RenderRRect extends RenderShape {

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
