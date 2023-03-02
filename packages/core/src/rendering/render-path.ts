import { assert } from '@canvas-ui/assert'
import { Log } from '../foundation'
import { Paint, PaintStyle } from '../canvas'
import { DebugFlags } from '../debug'
import { Matrix, Point, Rect, Size } from '../math'
import { Path } from '../utils'
import type { PaintingContext } from './painting-context'
import { RenderShape } from './render-shape'
import { YogaMeasure } from './yoga'

export class RenderPath extends RenderShape {

  private _hitTestStrokeWidth?: number
  get hitTestStrokeWidth() {
    if (typeof this._hitTestStrokeWidth === 'number') {
      return this._hitTestStrokeWidth
    }
    return this._strokeWidth
  }
  set hitTestStrokeWidth(value) {
    this._hitTestStrokeWidth = value
    this._pathBounds = undefined
  }

  get path() {
    return this._path
  }
  set path(value) {
    if (value === this.path) {
      return
    }
    if (this._path) {
      this.path2D = undefined
      this._pathBounds = undefined
    }
    this._path = value
    if (this._path) {
      this.path2D = new Path2D(this._path)
    }
    this.markLocalTransformDirty()
  }

  private _path?: string
  private path2D?: Path2D
  get pathBounds() {
    if (!this._pathBounds) {
      if (this._path) {
        return this._pathBounds = RenderPath.calculateBounds(this._path, this.hitTestStrokeWidth)
      }
    }
    return this._pathBounds
  }
  set pathBounds(value) {
    this._pathBounds = value
    this.markLocalTransformDirty()
    this.markPaintDirty()
  }
  private _pathBounds?: Rect

  paint(context: PaintingContext, offset: Point) {
    if (this.path2D) {
      const localTransform = this.getLocalTransform(offset)
      if (localTransform) {
        context.canvas.save()
        context.canvas.transform(localTransform)

        // todo(haocong): 应通过计算 pathBounds 得到准确的 paintBounds
        const paintBounds = Rect.fromOffsetAndSize(Point.zero, this._size)
        this._paint(
          context,
          offset,
          this.path2D,
          paintBounds,
        )
        context.canvas.restore()
        this.debugPaintPathBounds(
          context,
          offset,
          paintBounds,
        )
      } else {
        this._paint(context, offset, this.path2D, this.pathBounds!)
        this.debugPaintPathBounds(context, offset, this.pathBounds!)
      }
    }
  }

  private _paint(
    context: PaintingContext,
    offset: Point,
    path2D: Path2D,
    bounds: Rect,
  ): void {
    const {
      fillPaint,
      strokePaint,
    } = this
    if (fillPaint) {
      context.canvas.drawPath(
        path2D,
        offset.x,
        offset.y,
        fillPaint,
        bounds.left + offset.x,
        bounds.top + offset.y,
        bounds.width,
        bounds.height,
      )
    }
    if (strokePaint) {
      context.canvas.drawPath(
        path2D,
        offset.x,
        offset.y,
        strokePaint,
        bounds.left + offset.x,
        bounds.top + offset.y,
        bounds.width,
        bounds.height,
      )
    }
  }

  override yogaMeasure: YogaMeasure = () => {
    const { pathBounds = Rect.zero } = this
    return {
      width: pathBounds.right,
      height: pathBounds.bottom,
    }
  }

  private _localTransformOffset?: Point

  override getLocalTransform(offset: Point): Matrix | null {
    if (
      !this._localTransformOffset
      || Point.eq(this._localTransformOffset, offset)
      || this._localTransform === undefined
    ) {
      this._localTransform = this.computeLocalTransform(offset)
    }
    return this._localTransform
  }

  private computeLocalTransform(offset: Point) {
    const {
      pathBounds = Rect.zero,
      _angle,
      _size,
      _transformOrigin
    } = this

    // 需要旋转 / 缩放
    const shouldRotate = _angle !== 0
    const shouldResize = !Size.isZero(_size) && (_size.width !== pathBounds.right || _size.height !== pathBounds.bottom)
    if (shouldRotate || shouldResize) {

      const resizeCenter = Point.fromXY(
        offset.x,
        offset.y,
      )

      const rotateCenter = Point.fromXY(
        offset.x + pathBounds.right * _transformOrigin.x,
        offset.y + pathBounds.bottom * _transformOrigin.y,
      )

      const rotateMatrix = _angle !== 0
        ? Matrix.fromRotation(_angle, rotateCenter.x, rotateCenter.y)
        : null

      const scale = Point.fromXY(
        _size.width / pathBounds.right,
        _size.height / pathBounds.bottom,
      )
      const resizeMatrix = (scale.x !== 1 || scale.y !== 1)
        ? Matrix.fromScaleTranslate(scale.x, scale.y, resizeCenter.x, resizeCenter.y)
        : null

      const paintMatrix = rotateMatrix && resizeMatrix
        ? Matrix.mul(resizeMatrix, rotateMatrix)
        : (rotateMatrix ?? resizeMatrix)

      return paintMatrix
    }
    return null
  }

  debugPaintPathBounds(context: PaintingContext, offset: Point, bounds: Rect) {
    if (!DebugFlags.paintPathBounds) {
      return
    }

    const paint: Paint = {
      style: PaintStyle.stroke,
      strokeWidth: 1,
      color: '#00ff00',
    }
    context.canvas.drawRect(
      bounds.left + offset.x,
      bounds.top + offset.y,
      bounds.width,
      bounds.height,
      paint,
    )
  }

  override hitTestSelf(position: Point) {
    assert(this.path2D)
    // 检测是否命中了笔触
    if (this.strokePaint && !this.fillPaint) {
      return Path.isPointInStroke(this.path2D, position, this.hitTestStrokeWidth)
    }
    // 如果没有设置 size 则通过 paintBounds 来检测
    if (Size.isZero(this._size)) {

      // 如果 pathBounds 计算不出来，则总是不命中
      if (!this.pathBounds) {
        return false
      }
      return Rect.contains(this.pathBounds, position)
    }
    // 否则总是命中，因为之前已经检查过 size
    return true
  }

  override get bounds() {
    const { pathBounds } = this
    if (Size.isZero(this._size) && pathBounds) {
      if (!Point.isZero(this._offset)) {
        return Rect.shift(pathBounds, this._offset)
      }
      return pathBounds
    }
    return Rect.fromLTWH(this._offset.x, this._offset.y, this._size.width, this._size.height)
  }

  @Log()
  static calculateBounds(path: string, strokeWidth = 1) {
    const simplified = Path.simplify(Path.parse(path))
    const bounds = Path.calculateBounds(simplified)
    const inflate = (strokeWidth - 0.5) / 2
    return Rect.inflate(bounds, Size.fromWH(inflate, inflate))
  }

}
