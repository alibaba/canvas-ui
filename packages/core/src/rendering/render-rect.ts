import type { Point } from '../math'
import type { PaintingContext } from './painting-context'
import { RenderShape } from './render-shape'

export class RenderRect extends RenderShape {
  paint(context: PaintingContext, offset: Point) {
    const { fillPaint, strokePaint } = this
    if (fillPaint) {
      context.canvas.drawRect(offset.x, offset.y, this.size.width, this.size.height, fillPaint)
    }
    if (strokePaint) {
      context.canvas.drawRect(offset.x, offset.y, this.size.width, this.size.height, strokePaint)
    }
  }
}
