import { Paint, PaintStyle, Shader } from '../canvas'
import { Point, RRect, Size } from '../math'
import { hasOwn } from '../utils'
import { BoxShadow } from './box-shadow'
import type { PaintingContext, PaintingContextCallback } from './painting-context'
import type { RenderObject } from './render-object'
export class BoxDecorator {

  backgroundColor?: string
  backgroundImage?: Shader

  borderColor?: string
  borderImage?: Shader
  borderWidth?: number
  borderRadius?: number

  boxShadow?: BoxShadow

  paintBackground(context: PaintingContext, offset: Point, size: Size) {
    if ('backgroundColor' in this
      || 'boxShadow' in this) {
      const paint: Paint = {
        style: PaintStyle.fill,
        color: this.backgroundColor,
        shader: this.backgroundImage,
      }
      if (this.boxShadow) {
        BoxShadow.applyToPaint(this.boxShadow, paint)
      }

      if (hasOwn(this, 'borderRadius') && this.borderRadius > 0) {
        context.canvas.drawRRect(offset.x, offset.y, size.width, size.height, this.borderRadius!, this.borderRadius!, paint)
      } else {
        context.canvas.drawRect(offset.x, offset.y, size.width, size.height, paint)
      }
    }
  }

  paintBorder(context: PaintingContext, offset: Point, size: Size) {
    if (hasOwn(this, 'borderWidth')
      && this.borderWidth > 0
      && (hasOwn(this, 'borderColor') || hasOwn(this, 'borderImage'))) {

      const paint: Paint = {
        style: PaintStyle.stroke,
        color: this.borderColor,
        shader: this.borderImage,
        strokeWidth: this.borderWidth,
      }

      if (hasOwn(this, 'borderRadius') && this.borderRadius > 0) {
        context.canvas.drawRRect(offset.x, offset.y, size.width, size.height, this.borderRadius!, this.borderRadius!, paint)
      } else {
        context.canvas.drawRect(offset.x, offset.y, size.width, size.height, paint)
      }
    }
  }

  get hasBorderRadius() {
    return this.borderRadius !== undefined && this.borderRadius > 0
  }

  clipBorderRadiusAndPaint(
    context: PaintingContext,
    needsCompositing: boolean,
    offset: Point,
    size: Size,
    paint: PaintingContextCallback,
    thisArg: RenderObject,
  ) {
    if (this.borderRadius !== undefined && this.borderRadius > 0) {
      context.pushClipRRect(
        needsCompositing,
        offset,
        RRect.fromLTWHXY(0, 0, size.width, size.height, this.borderRadius, this.borderRadius),
        paint.bind(thisArg),
      )
    } else {
      paint.call(thisArg, context, offset)
    }
  }

}
