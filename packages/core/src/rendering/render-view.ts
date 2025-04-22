import { assert } from '@canvas-ui/assert'
import { Point, Rect, Size } from '../math'
import { HitTestResult } from './hit-test'
import { PaintingContext } from './painting-context'
import { RenderBox } from './render-box'
import type { RenderContainer } from './render-container'
import { ParentData, RenderObject, Visitor } from './render-object'
import type { RenderPipeline } from './render-pipeline'

export class ViewParentData<ChildType extends RenderObject = RenderObject> extends ParentData {

  prevSibling?: ChildType
  nextSibling?: ChildType

  override detach() {
    assert(!this.prevSibling)
    assert(!this.nextSibling)
    super.detach()
  }
}

export class RenderView<ChildType extends RenderObject<ViewParentData<ChildType>> = RenderObject>
  extends RenderBox
  implements RenderContainer<ChildType> {

  protected override setupParentData(child: RenderObject) {
    if (!(child.parentData instanceof ViewParentData)) {
      child.parentData = new ViewParentData()
    }
  }

  get childCount() {
    return this._childCount
  }
  protected _childCount = 0

  get firstChild() {
    return this._firstChild
  }
  protected _firstChild?: ChildType

  get lastChild() {
    return this._lastChild
  }
  protected _lastChild?: ChildType

  childBefore(child: ChildType) {
    assert(child.parent === this)
    return child.parentData?.prevSibling
  }

  childAfter(child: ChildType) {
    assert(child.parent === this)
    return child.parentData?.nextSibling
  }

  redepthChildren() {
    let child = this._firstChild
    while (child) {
      this.redepthChild(child)
      const childParentData = child.parentData!
      child = childParentData.nextSibling
    }
  }

  visitChildren(visitor: Visitor<ChildType>) {
    let child = this._firstChild
    while (child) {
      visitor(child)
      child = child.parentData!.nextSibling
    }
  }

  override attach(owner: RenderPipeline) {
    super.attach(owner)
    let child = this._firstChild
    while (child) {
      child.attach(owner)
      child = child.parentData!.nextSibling
    }
  }

  override detach() {
    super.detach()
    let child = this._firstChild
    while (child) {
      child.detach()
      child = child.parentData!.nextSibling
    }
  }

  private debugUltimatePrevSiblingOf(child: ChildType, equals: ChildType | undefined) {
    let childParentData = child.parentData!
    while (childParentData.prevSibling) {
      assert(childParentData.prevSibling !== child)
      child = childParentData.prevSibling
      childParentData = child.parentData!
    }
    return child === equals
  }

  private debugUltimateNextSiblingOf(child: ChildType, equals: ChildType | undefined) {
    let childParentData = child.parentData!
    while (childParentData.nextSibling) {
      assert(childParentData.nextSibling !== child)
      child = childParentData.nextSibling!
      childParentData = child.parentData!
    }
    return child === equals
  }

  protected internalInsertAfter(child: ChildType, after?: ChildType) {
    const childParentData = child.parentData!
    assert(!childParentData.nextSibling)
    assert(!childParentData.prevSibling)
    this._childCount++
    assert(this._childCount > 0)
    if (!after) {
      // 从头部插入 (_firstChild)
      childParentData.nextSibling = this._firstChild
      if (this._firstChild) {
        const firstChildParentData = this._firstChild.parentData
        assert(firstChildParentData)
        firstChildParentData.prevSibling = child
      }
      this._firstChild = child
      this._lastChild ??= child
      if (this._yogaNode && child.yogaNode) {
        assert(!child.yogaNode.getParent(), '子节点的 yogaNode 不能已有 parent')
        this._yogaNode.insertChild(child.yogaNode, 0)
      }
    } else {
      assert(this._firstChild)
      assert(this._lastChild)
      assert(this.debugUltimatePrevSiblingOf(after, this._firstChild))
      assert(this.debugUltimateNextSiblingOf(after, this._lastChild))
      const afterParentData = after.parentData!
      if (!afterParentData.nextSibling) {
        // 从尾部插入 (_lastChild)
        assert(after === this._lastChild)
        childParentData.prevSibling = after
        afterParentData.nextSibling = child
        this._lastChild = child
        if (this._yogaNode && child.yogaNode) {
          assert(!child.yogaNode.getParent(), '子节点的 yogaNode 不能已有 parent')
          this._yogaNode.insertChild(child.yogaNode, this._childCount - 1)
        }
      } else {
        // 从中间插入
        childParentData.nextSibling = afterParentData.nextSibling
        childParentData.prevSibling = after
        const childPrevSiblingParentData = childParentData.prevSibling!.parentData!
        const childNextSiblingParentData = childParentData.nextSibling!.parentData!
        childPrevSiblingParentData.nextSibling = child
        childNextSiblingParentData.prevSibling = child
        assert(afterParentData.nextSibling === child)
        if (this._yogaNode && child.yogaNode) {
          assert(!child.yogaNode.getParent(), '子节点的 yogaNode 不能已有 parent')
          const childIndex = this.findChildIndex(after)
          assert(childIndex !== -1, `父节点中没有该子节点 ${child.id}`)
          this._yogaNode.insertChild(child.yogaNode, childIndex + 1)
        }
      }
    }
  }

  insertAfter(child: ChildType, after?: ChildType) {
    assert(child as unknown !== this)
    assert(after as unknown !== this)
    assert(child !== after, '节点不能把自己添加到自己后面')
    assert(child !== this._firstChild, '节点已经是 firstChild')
    assert(child !== this._lastChild, '节点已经是 lastChild')
    this.adoptChild(child)
    this.internalInsertAfter(child, after)
  }

  insertBefore(child: ChildType, before?: ChildType) {
    this.insertAfter(child, before?.parentData?.prevSibling)
  }

  appendChild(child: ChildType) {
    this.insertAfter(child, this._lastChild)
  }

  protected internalRemoveChild(child: ChildType) {
    const childParentData = child.parentData!
    assert(this.debugUltimatePrevSiblingOf(child, this._firstChild))
    assert(this.debugUltimateNextSiblingOf(child, this._lastChild))
    assert(this._childCount >= 0)
    if (!childParentData.prevSibling) {
      // 子节点是 firstChild
      assert(this._firstChild === child)
      this._firstChild = childParentData.nextSibling
    } else {
      const childPrevSiblingParentData = childParentData.prevSibling.parentData!
      childPrevSiblingParentData.nextSibling = childParentData.nextSibling
    }
    if (!childParentData.nextSibling) {
      // 子节点是 lastChild
      assert(this._lastChild === child)
      this._lastChild = childParentData.prevSibling
    } else {
      const childNextSiblingParentData = childParentData.nextSibling.parentData!
      childNextSiblingParentData.prevSibling = childParentData.prevSibling
    }
    childParentData.prevSibling = undefined
    childParentData.nextSibling = undefined
    this._childCount -= 1
    if (this._yogaNode && child.yogaNode) {
      assert(child.yogaNode.getParent(), '子节点的 yogaNode 必须有 parent') // todo 检查 parent 的引用是否是 this.yogaNode
      this._yogaNode.removeChild(child.yogaNode)
    }
  }

  removeChild(child: ChildType) {
    this.internalRemoveChild(child)
    this.dropChild(child)
  }

  removeAllChildren() {
    let child = this._firstChild
    while (child) {
      const childParentData = child.parentData!
      const next = childParentData.nextSibling
      childParentData.prevSibling = undefined
      childParentData.nextSibling = undefined
      this.dropChild(child)
      child = next
    }
    this._firstChild = undefined
    this._lastChild = undefined
    this._childCount = 0
  }

  get debugChildren() {
    const children: ChildType[] = []
    if (this._firstChild) {
      let child = this._firstChild
      while (true) {
        children.push(child)
        if (child === this._lastChild) {
          break
        }
        child = child.parentData!.nextSibling!
      }
    }
    return children
  }

  override performLayout() {
    this.updateOffsetAndSize()
    let child = this._firstChild
    while (child) {
      child.layoutAsChild(false, false)
      child = child.parentData!.nextSibling
    }
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

  paintChildren(
    context: PaintingContext,
    offset: Point,
    viewportOffset: Point,
    viewport: Rect,
  ) {
    let child = this._firstChild
    const viewportNotEmpty = !Rect.isEmpty(viewport)
    while (child) {
      child.offstage = viewportNotEmpty && !Rect.overlaps(viewport, child.bounds)
      if (!child.offstage) {
        context.paintChild(child, Point.add3(child._offset, offset, viewportOffset))
      }
      child = child.parentData!.nextSibling
    }
  }

  protected _paint(context: PaintingContext, offset: Point) {
    this.paintChildren(context, offset, this.viewportOffset, this._viewport)
  }

  override hitTestChildren(result: HitTestResult, position: Point): boolean {
    let child = this._lastChild
    const { viewportOffset } = this
    while (child) {
      const isHit = !child.offstage && result.addWithPaintOffset(
        Point.add(child._offset, viewportOffset),
        position,
        (result, transformed) => {
          assert(Point.eq(transformed, Point.add(position, Point.invert(Point.add(child!._offset, viewportOffset)))))
          return child!.hitTest(result, transformed)
        }
      )
      if (isHit) {
        return true
      }
      child = child.parentData?.prevSibling
    }
    return false
  }

  override hitTestSelf() {
    // 如果 RenderView 设置了 Size，则还能命中自己
    // 由于在 hitTest 中已经提前检查过 Size.contain 了，我们只需简单判断 Size 不为 zero 即可
    return !this.hitTestSelfDisabled && !Size.eq(this._size, Size.zero)
  }

  protected override allocChildrenYogaNode() {
    let child = this._firstChild
    let index = 0
    while (child) {
      this.allocChildYogaNode(child)
      if (this._yogaNode && child._yogaNode && !child._yogaNode.getParent()) {
        this._yogaNode.insertChild(child._yogaNode, index)
      }
      const childParentData = child.parentData!
      child = childParentData.nextSibling
      index++
    }
  }

  protected override deallocYogaNodeChildren() {
    let child = this._firstChild
    while (child) {
      this.deallocYogaNode(child)
      const childParentData = child.parentData!
      child = childParentData.nextSibling
    }
  }

  findChildIndex(child: ChildType) {
    let ptr = this._firstChild
    let i = 0
    while (ptr) {
      if (ptr === child) {
        return i
      }
      const childParentData = ptr.parentData!
      ptr = childParentData.nextSibling
      i++
    }
    return -1
  }
}
