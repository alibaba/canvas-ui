import { Matrix, Point, Size } from '../math'
import { Paint, PaintStyle } from '../canvas'
import { hasOwn } from '../utils'
import { BoxShadow } from './box-shadow'
import { RenderObject } from './render-object'
import type { StyleMap } from './style-map'

export abstract class RenderShape extends RenderObject {

  protected override trackStyle() {
    super.trackStyle()
    this.style.on('boxShadow', this.handleBoxShadowChange, this)
    if (hasOwn(this.style, 'boxShadow')) {
      this.handleBoxShadowChange(this.style.boxShadow)
    }
    this.style.on('fill', this.handleFillChange, this)
    if (hasOwn(this.style, 'fill')) {
      this.handleFillChange(this.style.fill)
    }
    this.style.on('stroke', this.handleStrokeChange, this)
    if (hasOwn(this.style, 'stroke')) {
      this.handleStrokeChange(this.style.stroke)
    }
    this.style.on('strokeWidth', this.handleStrokeWidthChange, this)
    if (hasOwn(this.style, 'strokeWidth')) {
      this.handleStrokeWidthChange(this.style.strokeWidth)
    }
  }

  protected handleBoxShadowChange(value: StyleMap['boxShadow']) {
    if (value) {
      this.boxShadow = BoxShadow.fromCss(value)
    } else {
      this.boxShadow = undefined
    }
  }

  protected handleFillChange(value: StyleMap['fill']) {
    if (value) {
      this.fill = value
    } else {
      this.fill = undefined
    }
  }

  protected handleStrokeChange(value: StyleMap['stroke']) {
    if (value) {
      this.stroke = value
    } else {
      this.stroke = undefined
    }
  }

  protected handleStrokeWidthChange(value: StyleMap['strokeWidth']) {
    if (value) {
      this.strokeWidth = value
    } else {
      this.strokeWidth = undefined
    }
  }

  get boxShadow() {
    return this._boxShadow
  }
  set boxShadow(value) {
    if (value === this._boxShadow) {
      return
    }
    this._boxShadow = value
    this._fillPaint = undefined
    this._strokePaint = undefined
    this.markPaintDirty()
  }
  private _boxShadow?: BoxShadow

  get fill() {
    return this._fill
  }
  set fill(value) {
    if (value === this._fill) {
      return
    }
    this._fill = value
    this._fillPaint = undefined
    this.markPaintDirty()
  }
  protected _fill?: string

  get stroke() {
    return this._stroke
  }
  set stroke(value) {
    if (value === this._stroke) {
      return
    }
    this._stroke = value
    this._strokePaint = undefined
    this.markPaintDirty()
  }
  protected _stroke?: string

  get strokeWidth() {
    return this._strokeWidth
  }
  set strokeWidth(value) {
    if (value === this._strokeWidth) {
      return
    }
    this._strokeWidth = value
    this._strokePaint = undefined
    this.markPaintDirty()
  }
  protected _strokeWidth?: number

  private _strokePaint?: Paint
  protected get strokePaint() {
    if (this._strokeWidth && !this._strokePaint) {
      this._strokePaint = {
        style: PaintStyle.stroke,
        color: this._stroke ?? '#000', // 默认黑色
        strokeWidth: this._strokeWidth ?? 1,
      }

      // 阴影只作用一次，如果设置了填充，则描边无效
      if (this._boxShadow && !this._fill) {
        BoxShadow.applyToPaint(this._boxShadow, this._strokePaint)
      }
    }
    return this._strokePaint
  }

  private _fillPaint?: Paint
  protected get fillPaint() {
    if (this._fill !== undefined && !this._fillPaint) {
      this._fillPaint = {
        style: PaintStyle.fill,
        color: this._fill,
      }
      if (this._boxShadow) {
        BoxShadow.applyToPaint(this._boxShadow, this._fillPaint)
      }
    }
    return this._fillPaint
  }

  get rotation() {
    return this._rotation
  }
  set rotation(value) {
    if (value === this._rotation) {
      return
    }
    this._rotation = value
    this._angle = DEG_TO_RAD * value
    this.markLocalTransformDirty()
    this.markPaintDirty()
  }
  protected _rotation = 0
  protected _angle = 0


  get transformOrigin() {
    return this._transformOrigin
  }
  set transformOrigin(value) {
    if (Point.eq(value, this._transformOrigin)) {
      return
    }
    this._transformOrigin = value
    this.markLocalTransformDirty()
    this.markPaintDirty()
  }
  protected _transformOrigin = Point.fromXY(0.5, 0.5)

  protected override setSize(value: Size) {
    if (super.setSize(value)) {
      this.markLocalTransformDirty()
      return true
    }
    return false
  }

  getLocalTransform(_offset: Point): Matrix | null {
    return null
  }

  protected _localTransform?: Matrix | null

  protected markLocalTransformDirty() {
    this._localTransform = undefined
  }

  visitChildren() { }

  protected redepthChildren() { }

  override hitTestSelf(_position: Point) {
    // RenderShape 没有子节点，所以他们总是命中自己
    // todo(haocong): 根据形状进一步 hitTest
    return true
  }
}

const DEG_TO_RAD = Math.PI / 180
