import { assert } from '@canvas-ui/assert'
import { Point, Rect, Size } from '../math'
import { HitTestResult } from './hit-test'
import { PaintingContext } from './painting-context'
import { RenderBox } from './render-box'
import { RenderContainer } from './render-container'
import { RenderObject, Visitor } from './render-object'
import type { RenderPipeline } from './render-pipeline'

/**
 * 有且仅有一个子节点的 RenderObject
 */
export class RenderSingleChild<ChildType extends RenderObject> extends RenderBox implements RenderContainer<ChildType> {

  get child() {
    return this._child
  }
  set child(value) {
    if (this._child === value) {
      return
    }
    if (this._child) {
      if (this._yogaNode && this._child.yogaNode) {
        assert(this._child.yogaNode.getParent() === this._yogaNode)
        this._yogaNode.removeChild(this._child.yogaNode)
      }
      this.dropChild(this._child)
      this._childCount--
    }
    this._child = value
    if (this._child) {
      this.adoptChild(this._child)
      if (this._yogaNode && this._child.yogaNode) {
        assert(!this._child.yogaNode.getParent(), '子节点的 yogaNode 不能已有 parent')
        this._yogaNode.insertChild(this._child.yogaNode, 0)
      }
      this._childCount++
    }
  }
  protected _child?: ChildType

  visitChildren(visitor: Visitor<ChildType>) {
    if (this._child) {
      visitor(this._child)
    }
  }

  protected redepthChildren(): void {
    if (this._child) {
      this.redepthChild(this._child)
    }
  }

  override performLayout() {
    this.updateOffsetAndSize()
    this._child?.layoutAsChild(false, false)
  }

  override attach(owner: RenderPipeline) {
    super.attach(owner)
    this._child?.attach(owner)
  }

  override detach() {
    super.detach()
    this._child?.detach()
  }

  paint(context: PaintingContext, offset: Point) {
    const hasSize = !Size.isZero(this._size)
    const { _boxDecorator } = this
    if (hasSize) {
      _boxDecorator?.paintBackground(context, offset, this._size)
    }

    const shouldClip = this._viewport.width > 0 && this._viewport.height > 0
    if (shouldClip) {
      context.pushClipRect(
        this.needsCompositing,
        offset,
        Rect.fromLTWH(0, 0, this._viewport.width, this._viewport.height),
        this._paint.bind(this),
      )
    } else {
      this._paint(context, offset)
    }

    if (hasSize) {
      _boxDecorator?.paintBorder(context, offset, this._size)
    }
  }

  _paint(context: PaintingContext, offset: Point) {
    if (this._child) {
      const viewportOffset = this.viewportOffset
      this._child.offstage = false
      context.paintChild(this._child, Point.add3(this._child.offset, offset, viewportOffset))
    }
  }

  override hitTestChildren(result: HitTestResult, position: Point): boolean {
    if (!this._child) {
      return false
    }
    const { _child } = this
    return result.addWithPaintOffset(
      Point.add(_child.offset, this.viewportOffset),
      position,
      (result, transformed) => {
        assert(Point.eq(transformed, Point.add(position, Point.invert(Point.add(_child.offset, this.viewportOffset)))))
        return _child.hitTest(result, transformed)
      }
    )
  }

  override hitTestSelf() {
    // 如果 RenderView 设置了 Size，则还能命中自己
    // 由于在 hitTest 中已经提前检查过 Size.contain 了，我们只需简单判断 Size 不为 zero 即可
    return !this.hitTestSelfDisabled && !Size.eq(this._size, Size.zero)
  }

  get childCount() {
    return this._childCount
  }
  protected _childCount = 0

  get firstChild() {
    return this._child
  }

  get lastChild() {
    return this._child
  }

  childBefore(child: ChildType): undefined {
    assert(child === this._child)
    return undefined
  }
  childAfter(child: ChildType): undefined {
    assert(child === this._child)
    return undefined
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  insertAfter(child: ChildType, _after?: ChildType): void {
    this.child = child
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  insertBefore(child: ChildType, _before?: ChildType): void {
    this.child = child
  }
  appendChild(child: ChildType): void {
    this.child = child
  }
  removeChild(child: ChildType): void {
    assert(child === this._child)
    this.child = undefined
  }
  removeAllChildren(): void {
    this.child = undefined
  }
  get debugChildren() {
    if (this._child) {
      return [this._child]
    }
    return []
  }

  protected override allocChildrenYogaNode() {
    if (this._child) {
      this.allocChildYogaNode(this._child)
    }
  }

  protected override deallocYogaNodeChildren() {
    if (this._child) {
      this.deallocYogaNode(this._child)
    }
  }
}
