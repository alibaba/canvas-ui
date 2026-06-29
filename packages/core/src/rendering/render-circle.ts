import { hasOwn } from '../utils'
import type { Point } from '../math'
import type { PaintingContext } from './painting-context'
import { RenderShape } from './render-shape'
import { StyleMap } from './style-map'

export class RenderCircle extends RenderShape {

  protected override trackStyle() {
    super.trackStyle()
    this.style.on('radius', this.handleRadiusChange, this)
    if (hasOwn(this.style, 'radius')) {
      this.handleRadiusChange(this.style.radius)
    }

  }

  protected handleRadiusChange(value: StyleMap['radius']) {
    if (value) {
      this.radius = value
      // Set size to diameter so bounding box is correct and consistent with Rect/RRect
      this.size = { width: value * 2, height: value * 2 }
    } else {
      this.radius = 0
      this.size = { width: 0, height: 0 }
    }
  }

  private _radius = 0
  get radius() {
    return this._radius
  }
  set radius(value) {
    if (value === this._radius) {
      return
    }
    this._radius = value
    this.markPaintDirty()
  }

  paint(context: PaintingContext, offset: Point) {
    const { _size: { width, height }, _radius, fillPaint, strokePaint } = this
    const radius = _radius === 0
      ? Math.min(width, height) / 2 // 如果没有设置半径，则从 size 推测
      : _radius

    const x = width / 2 + offset.x
    const y = height / 2 + offset.y

    if (fillPaint) {
      context.canvas.drawCircle(x, y, radius, fillPaint)
    }
    if (strokePaint) {
      context.canvas.drawCircle(x, y, radius, strokePaint)
    }
  }
}
