import { Canvas, Paint, PaintStyle } from '../canvas'
import { Point, Size } from '../math'
import type { Paragraph } from './paragraph'
import type { LineMetrics } from './text-wrapper'

export class TextLine {

  readonly size: Size

  readonly offset: Point

  constructor(
    readonly owner: Paragraph,
    readonly seq: number,
    readonly text: string,
    readonly width: number,
    readonly hasEllipsis: boolean,
    readonly lineMetrics: LineMetrics,
  ) {
    this.size = Size.fromWH(width, lineMetrics.fontSize)
    const yShift = (this.owner.computedStyle.lineHeight - this.lineMetrics.fontSize) / 2
    this.offset = Point.fromXY(0, seq * owner.computedStyle.lineHeight + yShift)
  }

  paint(canvas: Canvas, offset: Point) {
    const paintOffset = Point.add(this.offset, offset)
    const paint: Paint = {
      style: PaintStyle.fill,
      color: this.owner.computedStyle.color,
      font: this.owner.computedStyle.font,
    }
    canvas.drawText(
      this.text,
      paintOffset.x,
      paintOffset.y + this.lineMetrics.ascent,
      paint,
      paintOffset.x,
      paintOffset.y,
      this.size.width,
      this.size.height,
    )
  }

  debugPaintBounds(canvas: Canvas, offset: Point) {
    const paint: Paint = {
      style: PaintStyle.stroke,
      strokeWidth: 1,
      color: '#FF00FF',
    }
    canvas.drawRect(
      offset.x + this.offset.x,
      offset.y + this.offset.y,
      this.size.width,
      this.size.height,
      paint,
    )
  }
}
