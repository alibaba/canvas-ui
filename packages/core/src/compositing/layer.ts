import assert from 'assert'
import type {
  Canvas,
  Picture
} from '../canvas'
import type { RasterCache } from '../compositing'
import { AbstractNode } from '../foundation'
import {
  Circle,
  Matrix,
  Point,
  Rect,
  RRect
} from '../math'

export class PrerollContext {
  constructor(
    readonly rasterCache: RasterCache
  ) {

  }
}

export class PaintContext {
  constructor(
    readonly canvas: Canvas,
    readonly rasterCache: RasterCache,
  ) {
  }
}

export abstract class Layer extends AbstractNode<unknown> {

  override get parent(): ContainerLayer | undefined {
    return this._parent as (ContainerLayer | undefined)
  }

  redepthChildren() {
    //
  }

  /**
   * 后一个兄弟图层
   */
  nextSibling?: Layer

  /**
   * 前一个兄弟图层
   */
  prevSibling?: Layer

  removeFromParent() {
    return this.parent?.removeChild(this)
  }

  abstract preroll(context: PrerollContext, matrix: Matrix): void
  abstract paint(context: PaintContext): void

  paintBounds = Rect.zero

  get needsPainting() {
    return !Rect.isEmpty(this.paintBounds)
  }
}

export class ContainerLayer extends Layer {

  firstChild?: Layer

  lastChild?: Layer

  get hasChildren() {
    return this.firstChild !== undefined
  }

  override attach(owner: unknown) {
    super.attach(owner)
    let child = this.firstChild
    while (child) {
      child.attach(owner)
      child = child.nextSibling
    }
  }

  override detach() {
    super.detach()
    let child = this.firstChild
    while (child) {
      child.detach()
      child = child.nextSibling
    }
  }

  appendChild(child: Layer) {
    assert(child !== this)
    assert(child !== this.firstChild)
    assert(child !== this.lastChild)
    assert(!child.parent)
    assert(!child.attached)
    assert(!child.nextSibling)
    assert(!child.prevSibling)
    assert((() => {
      let node: Layer = this
      while (node.parent) {
        node = node.parent
      }
      assert(node !== child) // 不允许循环父子
      return true
    })())
    this.adoptChild(child)
    child.prevSibling = this.lastChild
    if (this.lastChild) {
      this.lastChild.nextSibling = child
    }
    this.lastChild = child
    this.firstChild ??= child
    assert(child.attached === this.attached)
  }

  removeChild(child: Layer) {
    assert(child.parent === this)
    assert(child.attached === this.attached)
    assert(this.debugUltimatePrevSiblingOf(child, this.firstChild))
    assert(this.debugUltimateNextSiblingOf(child, this.lastChild))

    if (!child.prevSibling) {
      // child 是第一个子节点
      assert(this.firstChild === child)
      this.firstChild = child.nextSibling
    } else {
      child.prevSibling.nextSibling = child.nextSibling
    }

    if (!child.nextSibling) {
      // child 是最后一个子节点
      assert(this.lastChild === child)
      this.lastChild = child.prevSibling
    } else {
      child.nextSibling.prevSibling = child.prevSibling
    }

    assert((!this.firstChild) === (!this.lastChild), '如果移除了最后一个子节点，则 firstChild 和 lastChild 都为 undefined，否则 firstChild 和 lastChild 都不能为 undefined')
    assert(!this.firstChild || this.firstChild.attached === this.attached)
    assert(!this.lastChild || this.lastChild.attached === this.attached)
    assert(!this.firstChild || this.debugUltimateNextSiblingOf(this.firstChild, this.lastChild), 'firstChild 和 lastChild 不能是循环兄弟节点')
    assert(!this.lastChild || this.debugUltimatePrevSiblingOf(this.lastChild, this.firstChild), 'lastChild 和 firstChild 不能是循环兄弟节点')
    child.prevSibling = undefined
    child.nextSibling = undefined
    this.dropChild(child)
    assert(!child.attached)
  }

  removeAllChildren() {
    let child = this.firstChild
    while (child) {
      const next = child.nextSibling
      child.prevSibling = undefined
      child.nextSibling = undefined
      assert(child.attached === this.attached)
      this.dropChild(child)
      child = next
    }
    this.firstChild = undefined
    this.lastChild = undefined
  }

  debugDFSChildren(): Layer[] {
    if (!this.firstChild) {
      return []
    }
    const children: Layer[] = []
    let child: Layer | undefined = this.firstChild
    while (child) {
      children.push(child)
      if (child instanceof ContainerLayer) {
        children.push(...child.debugDFSChildren())
      }
      child = child.nextSibling
    }
    return children
  }

  private debugUltimatePrevSiblingOf(child: Layer, equals: Layer | undefined) {
    assert(child.attached === this.attached)
    while (child.prevSibling) {
      assert(child.prevSibling !== child)
      child = child.prevSibling
      assert(child.attached === this.attached)
    }
    return child === equals
  }

  private debugUltimateNextSiblingOf(child: Layer, equals: Layer | undefined) {
    assert(child.attached === this.attached)
    while (child.nextSibling) {
      assert(child.nextSibling !== child)
      child = child.nextSibling!
      assert(child.attached === this.attached)
    }
    return child === equals
  }

  preroll(context: PrerollContext, matrix: Matrix): void {
    this.paintBounds = this.prerollChildren(context, matrix)
  }

  prerollChildren(context: PrerollContext, childMatrix: Matrix): Rect {
    let childPaintBounds = Rect.zero
    let layer = this.firstChild
    while (layer) {
      layer.preroll(context, childMatrix)
      if (Rect.isEmpty(childPaintBounds)) {
        childPaintBounds = layer.paintBounds
      } else {
        childPaintBounds = Rect.expandToInclude(childPaintBounds, layer.paintBounds)
      }
      layer = layer.nextSibling
    }
    return childPaintBounds
  }

  paintChildren(context: PaintContext): void {
    assert(this.needsPainting)
    let layer = this.firstChild
    while (layer) {
      if (layer.needsPainting) {
        layer.paint(context)
      }
      layer = layer.nextSibling
    }
  }

  paint(context: PaintContext): void {
    this.paintChildren(context)
  }
}

export class PictureLayer extends Layer {

  constructor(
    private readonly offset = Point.zero,
    // private readonly complex = false,
    public willChange = false,
  ) {
    super()
  }

  picture?: Picture

  private matrix?: Matrix

  preroll(context: PrerollContext, matrix: Matrix): void {
    assert(this.picture)
    assert(Point.isZero(this.offset), '暂不支持 PictureLayer.offset')
    if (Point.isZero(this.offset)) {
      this.paintBounds = this.picture.cullRect
    } else {
      this.paintBounds = Rect.shift(this.picture.cullRect, this.offset)
    }
    context.rasterCache.prepare(
      this.picture,
      matrix,
      this.willChange,
    )
    this.matrix = matrix
  }

  paint(context: PaintContext): void {
    assert(this.picture)
    assert(this.needsPainting)
    assert(this.matrix)
    context.canvas.save()
    assert(Point.isZero(this.offset), '暂不支持 PictureLayer.offset')
    // 优先绘制缓存了的图像
    if (!context.rasterCache.drawPicture(this.picture, context.canvas, this.matrix)) {
      context.canvas.drawPicture(this.picture)
    }
    context.canvas.restore()
  }
}

export class TransformLayer extends ContainerLayer {
  constructor(
    public transform = Matrix.identity,
  ) {
    super()
  }

  override preroll(context: PrerollContext, matrix: Matrix) {
    const childMatrix = Matrix.mul(matrix, this.transform)
    const childPaintBounds = this.prerollChildren(context, childMatrix)

    // todo(haocong): !!! 还不支持缩放和斜切 !!!
    this.paintBounds = Rect.shift(childPaintBounds, Matrix.getTranslate(this.transform))
  }

  override paint(context: PaintContext) {
    context.canvas.save()
    context.canvas.transform(this.transform)
    this.paintChildren(context)
    context.canvas.restore()
  }
}

export class OffsetLayer extends TransformLayer {
  constructor(
    offset = Point.zero,
  ) {
    super(Matrix.fromTranslate(offset.x, offset.y))
  }

  set offset(value: Point) {
    this.transform = Matrix.fromTranslate(value.x, value.y)
  }

  get offset() {
    return Matrix.getTranslate(this.transform)
  }
}

export class ClipRectLayer extends ContainerLayer {
  constructor(
    public clipRect: Rect
  ) {
    super()
  }

  override preroll(context: PrerollContext, matrix: Matrix) {
    const childPaintBounds = this.prerollChildren(context, matrix)
    if (Rect.overlaps(this.clipRect, childPaintBounds)) {
      this.paintBounds = Rect.intersect(this.clipRect, childPaintBounds)
    }
  }

  override paint(context: PaintContext) {
    context.canvas.save()
    context.canvas.clipRect(
      this.clipRect.left,
      this.clipRect.top,
      this.clipRect.width,
      this.clipRect.height,
    )
    this.paintChildren(context)
    context.canvas.restore()
  }
}

export class ClipRRectLayer extends ContainerLayer {
  constructor(
    public clipRRect: RRect
  ) {
    super()
  }

  override preroll(context: PrerollContext, matrix: Matrix) {
    const childPaintBounds = this.prerollChildren(context, matrix)
    if (Rect.overlaps(this.clipRRect, childPaintBounds)) {
      this.paintBounds = Rect.intersect(this.clipRRect, childPaintBounds)
    }
  }

  override paint(context: PaintContext) {
    context.canvas.save()
    context.canvas.clipRRect(
      this.clipRRect.left,
      this.clipRRect.top,
      this.clipRRect.width,
      this.clipRRect.height,
      this.clipRRect.radiusX,
      this.clipRRect.radiusY,
    )
    this.paintChildren(context)
    context.canvas.restore()
  }
}

export class ClipCircleLayer extends ContainerLayer {
  constructor(
    clipCircle: Circle
  ) {
    super()
    this.clipCircle = clipCircle
  }

  get clipCircle(): Circle {
    return this._clipCircle
  }
  set clipCircle(value: Circle) {
    this._clipCircle = value
    this.clipBounds = Circle.getBounds(this._clipCircle)
  }
  private _clipCircle!: Circle
  private clipBounds!: Rect

  override preroll(context: PrerollContext, matrix: Matrix) {
    const childPaintBounds = this.prerollChildren(context, matrix)
    if (Rect.overlaps(this.clipBounds, childPaintBounds)) {
      this.paintBounds = Rect.intersect(this.clipBounds, childPaintBounds)
    }
  }

  override paint(context: PaintContext) {
    context.canvas.save()
    context.canvas.clipCircle(
      this.clipCircle.x,
      this.clipCircle.y,
      this.clipCircle.radius,
    )
    this.paintChildren(context)
    context.canvas.restore()
  }
}
