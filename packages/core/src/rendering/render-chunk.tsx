import { assert } from '@canvas-ui/assert'
import { IllegalStateError } from '../error'
import { Log } from '../foundation'
import { Point, Rect, Size } from '../math'
import { HitTestResult } from './hit-test'
import { PaintingContext } from './painting-context'
import { RenderContainer } from './render-container'
import { RenderObject, Visitor } from './render-object'
import { RenderPipeline } from './render-pipeline'
import { RenderView, ViewParentData } from './render-view'

export class ChunkParentData<ChildType extends RenderObject = RenderObject> extends ViewParentData<ChildType> {

  /**
   * 子节点渲染时关联的虚拟父节点
   */
  chunk?: Chunk<ChildType>

  /**
   * 指向位于 Chunk 内的 nextSibling
   */
  nextSiblingInChunk?: ChildType

  /**
   * 指向位于 Chunk 内的 prevSibling
   */
  prevSiblingInChunk?: ChildType

  override detach() {
    super.detach()
    assert(!this.chunk)
    assert(!this.nextSiblingInChunk)
    assert(!this.prevSiblingInChunk)
  }
}

export class RenderChunk<ChildType extends RenderObject<ChunkParentData<ChildType>> = RenderObject> extends RenderView<ChildType> {

  /**
   * 默认分块渲染容量
   */
  static readonly DEFAULT_CAPACITY = 6

  /**
   * 设置或获取节点间分块渲染容量，修改 [capacity] 只会影响之后的分块策略，而不会影响之前的
   */
  get capacity() {
    return this._capacity
  }
  set capacity(value) {
    this._capacity = value
  }
  private _capacity = RenderChunk.DEFAULT_CAPACITY

  /**
   * 设置或获取 Chunk 的离屏检查函数
   * 
   * 返回 true 表示节点已离屏
   */
  get isOffstage() {
    return this.chunks.isOffstage
  }
  set isOffstage(value) {
    this.chunks.isOffstage = value
  }
  /**
   * 默认的离屏检查函数
   */
  static get defaultIsOffstage() {
    return ChunkContainer.defaultIsOffstage
  }

  /**
   * [RenderChunk] 恒为重绘边界
   */
  override get repaintBoundary() {
    return true
  }

  /**
   * 通过 [ChunkContainer] 代持 [Chunk]s，并且他不是 [RenderChunk] 的逻辑子节点
   */
  private chunks = new ChunkContainer()

  protected override setupParentData(child: RenderObject) {
    if (!(child.parentData instanceof ChunkParentData)) {
      child.parentData = new ChunkParentData()
    }
  }

  protected override internalInsertAfter(child: ChildType, after?: ChildType) {
    super.internalInsertAfter(child, after)

    // 也要将 child 插入到 chunk
    this.insertIntoChunk(child)
  }

  protected override internalRemoveChild(child: ChildType) {
    super.internalRemoveChild(child)

    // 也要将 child 移出 chunk
    this.removeFromChunk(child)
  }

  private insertIntoChunk(child: ChildType) {
    this.mergeIntoChunk(child, this._capacity)
  }

  /**
   * 合并 child 到某个 [Chunk]，如果不能合并则会尝试拆分 chunk
   */
  private mergeIntoChunk(child: ChildType, chunkCapacity: number) {
    assert(child.parentData, 'child 不能没有 parentData')
    assert(!child.parentData.chunk, 'child 不能已分配 chunk')

    const prevChunk = child.parentData.prevSibling?.parentData?.chunk
    const nextChunk = child.parentData.nextSibling?.parentData?.chunk

    // child 介于两个 chunk 之间
    if (prevChunk !== nextChunk) {
      if (prevChunk && prevChunk.childCount < chunkCapacity) {
        // prevChunk 如果容量够就放进去
        assert(prevChunk.lastChild === child.parentData.prevSibling)
        prevChunk.insertAfter(child, prevChunk.lastChild)
      } else if (nextChunk && nextChunk.childCount < chunkCapacity) {
        // nextChunk 如果容量够就放进去
        assert(nextChunk.firstChild === child.parentData.nextSibling)
        nextChunk.insertBefore(child, nextChunk.firstChild)
      } else {
        const chunk = this.createChunkAfter(prevChunk)
        chunk.appendChild(child)
      }

    } else if (prevChunk) {
      // 此时 prevChunk 就是要插入的 Chunk
      prevChunk.insertAfter(child, child.parentData.prevSibling)

      // 空间不足时，将最后一个节点移出，尝试重新合并
      if (prevChunk.childCount >= chunkCapacity) {
        const lastChild = prevChunk.lastChild
        assert(lastChild)
        prevChunk.removeChild(lastChild)
        this.mergeIntoChunk(lastChild, chunkCapacity)
      }
    } else {
      // 创建新的 chunk
      const chunk = this.createChunkAfter(prevChunk)
      chunk.appendChild(child)
    }
  }

  private createChunkAfter(after?: Chunk<ChildType>) {
    const chunk = new Chunk<ChildType>()
    this.chunks.insertAfter(chunk, after)
    return chunk
  }

  private removeFromChunk(child: ChildType) {
    const chunk = child.parentData?.chunk
    if (!chunk) {
      return
    }

    // 将 child 从 chunk 移出
    chunk.removeChild(child)

    // 同时删除空的 chunk
    if (chunk.childCount === 0) {
      this.chunks.removeChild(chunk)
    }
  }

  override attach(owner: RenderPipeline) {
    super.attach(owner)

    // chunks 作为渲染代理，也要 attach，即使他不是 [RenderChunk] 的子节点
    this.chunks.attach(owner)
  }

  override detach() {
    super.detach()

    // chunks 作为渲染代理，也要 detach，即使他不是 [RenderChunk] 的子节点
    this.chunks.detach()
  }

  protected override _paint(context: PaintingContext, offset: Point) {
    // 通过 ChunkContainer 渲染子节点
    this.chunks.paintChildren(context, offset, this.viewportOffset, this._viewport)
  }

  override markLayoutDirty(cause?: ChildType) {
    super.markLayoutDirty()
    if (cause) {
      const chunk = cause.parentData?.chunk
      // 子节点被 append 时也会调用该方法，此时子节点的 chunk 可能尚未分配
      if (chunk) {
        chunk._layoutDirty = true
      }
    }
  }

  override markPaintDirty(cause?: ChildType) {
    super.markPaintDirty()
    if (cause) {
      const chunk = cause.parentData?.chunk
      // 造成 chunk 不存在的原因只有节点刚被 adopt 时，trackStyle 中处理了样式，此时又直接调用了 markPaintDirty(this)，就会导致此处 Chunk 不存在
      // assert(chunk, '无法定位子节点所在 chunk')
      if (chunk) {
        chunk._paintDirty = true
      }
    }
  }

  override performLayout() {

    // 先调用 [RenderView] 的布局方法，对所有子节点进行布局
    super.performLayout()

    // 随后，调用 chunks 的布局方法
    this.chunks.performLayout()
  }

  override hitTestChildren(result: HitTestResult, position: Point) {
    let child = this._lastChild
    const { viewportOffset } = this
    while (child) {
      // 通过关联 chunk 的 offstage 进行优化
      const isHit = !child.parentData!.chunk!.offstage && result.addWithPaintOffset(
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
}

class ChunkContainer<ChildType extends RenderObject<ChunkParentData<ChildType>>> extends RenderView<Chunk<ChildType>> {
  override performLayout() {
    let child = this._firstChild
    while (child) {
      // ChunkContainer 需要了解子节点 Chunk 的 size
      child.layoutAsChild(true, false)
      child = child.parentData!.nextSibling
    }
  }

  isOffstage = ChunkContainer.defaultIsOffstage

  static defaultIsOffstage(viewport: Rect, childBounds: Rect) {
    return !Rect.overlaps(viewport, childBounds)
  }

  override paintChildren(
    context: PaintingContext,
    offset: Point,
    viewportOffset: Point,
    viewport: Rect,
  ) {
    let child = this._firstChild
    const viewportNotEmpty = !Rect.isEmpty(viewport)
    while (child) {
      child.offstage = viewportNotEmpty && this.isOffstage(viewport, child.bounds)
      if (!child.offstage) {
        context.paintChild(child, Point.add3(child._offset, offset, viewportOffset))
      }
      child = child.parentData!.nextSibling
    }
  }
}

class Chunk<ChildType extends RenderObject<ChunkParentData<ChildType>>>
  extends RenderObject<ViewParentData<Chunk<ChildType>>>
  implements RenderContainer<ChildType> {

  paint(context: PaintingContext, offset: Point): void {
    let child = this._firstChild
    const invOffset = Point.invert(this._offset)
    while (child) {
      context.paintChild(child, Point.add3(child._offset, offset, invOffset))
      child = child.parentData!.nextSiblingInChunk
    }
  }

  override hitTestChildren(_result: HitTestResult, _position: Point): boolean {
    throw new IllegalStateError(`Chunk 只提供分块渲染功能，不提供命中检测功能，如果你遇到了这个错误，这通常是 glui 的问题。`)
  }


  @Log()
  override performLayout() {
    let bounds: Rect | undefined
    let child = this._firstChild
    while (child) {
      const childBounds = Rect.fromOffsetAndSize(child._offset, child._size)
      if (!bounds) {
        bounds = childBounds
      } else {
        bounds = Rect.expandToInclude(bounds, childBounds)
      }
      child = child.parentData!.nextSiblingInChunk
    }
    assert(bounds, 'bounds 是 undefined，说明当前 Chunk 是空的，不应该执行布局流程')
    this.offset = Point.fromXY(bounds.left, bounds.top)
    this.size = Size.fromWH(bounds.width, bounds.height)
  }

  override get repaintBoundary() {
    return true
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
    assert(child.parent instanceof Chunk)
    return child.parentData?.prevSiblingInChunk
  }

  childAfter(child: ChildType) {
    assert(child.parent instanceof Chunk)
    return child.parentData?.nextSiblingInChunk
  }

  redepthChildren() {
    let child = this._firstChild
    while (child) {
      this.redepthChild(child)
      const childParentData = child.parentData!
      child = childParentData.nextSiblingInChunk
    }
  }

  visitChildren(visitor: Visitor<ChildType>) {
    let child = this._firstChild
    while (child) {
      visitor(child)
      child = child.parentData!.nextSiblingInChunk
    }
  }

  private debugUltimatePrevSiblingOf(child: ChildType, equals: ChildType | undefined) {
    let childParentData = child.parentData!
    while (childParentData.prevSiblingInChunk) {
      assert(childParentData.prevSiblingInChunk !== child)
      child = childParentData.prevSiblingInChunk
      childParentData = child.parentData!
    }
    return child === equals
  }

  private debugUltimateNextSiblingOf(child: ChildType, equals: ChildType | undefined) {
    let childParentData = child.parentData!
    while (childParentData.nextSiblingInChunk) {
      assert(childParentData.nextSiblingInChunk !== child)
      child = childParentData.nextSiblingInChunk!
      childParentData = child.parentData!
    }
    return child === equals
  }

  private internalInsertAfter(child: ChildType, after?: ChildType) {
    const childParentData = child.parentData!
    assert(!childParentData.nextSiblingInChunk, 'child 不能已关联 nextSiblingInChunk')
    assert(!childParentData.prevSiblingInChunk, 'child 不能已关联 prevSiblingInChunk')
    assert(!childParentData.chunk, 'child 不能已分配 chunk')
    childParentData.chunk = this
    child.offstage = false
    this._childCount++
    assert(this._childCount > 0)
    if (!after) {
      // 从头部插入 (_firstChild)
      childParentData.nextSiblingInChunk = this._firstChild
      if (this._firstChild) {
        const firstChildParentData = this._firstChild.parentData
        assert(firstChildParentData)
        firstChildParentData.prevSiblingInChunk = child
      }
      this._firstChild = child
      this._lastChild ??= child
    } else {
      assert(this._firstChild)
      assert(this._lastChild)
      assert(this.debugUltimatePrevSiblingOf(after, this._firstChild))
      assert(this.debugUltimateNextSiblingOf(after, this._lastChild))
      const afterParentData = after.parentData!
      if (!afterParentData.nextSiblingInChunk) {
        // 从尾部插入 (_lastChild)
        assert(after === this._lastChild)
        childParentData.prevSiblingInChunk = after
        afterParentData.nextSiblingInChunk = child
        this._lastChild = child
      } else {
        // 从中间插入
        childParentData.nextSiblingInChunk = afterParentData.nextSiblingInChunk
        childParentData.prevSiblingInChunk = after
        const childPrevSiblingParentData = childParentData.prevSiblingInChunk!.parentData!
        const childNextSiblingParentData = childParentData.nextSiblingInChunk!.parentData!
        childPrevSiblingParentData.nextSiblingInChunk = child
        childNextSiblingParentData.prevSiblingInChunk = child
        assert(afterParentData.nextSiblingInChunk === child)
      }
    }
    this._layoutDirty = true
    this._paintDirty = true
  }

  insertAfter(child: ChildType, after?: ChildType) {
    assert(child as unknown !== this)
    assert(after as unknown !== this)
    assert(child !== after, '节点不能把自己添加到自己后面')
    assert(child !== this._firstChild, '节点已经是 firstChild')
    assert(child !== this._lastChild, '节点已经是 lastChild')
    this.internalInsertAfter(child, after)
  }

  insertBefore(child: ChildType, before?: ChildType) {
    this.insertAfter(child, before?.parentData?.prevSiblingInChunk)
  }

  appendChild(child: ChildType) {
    this.insertAfter(child, this._lastChild)
  }

  private internalRemoveChild(child: ChildType) {
    const childParentData = child.parentData!
    assert(this.debugUltimatePrevSiblingOf(child, this._firstChild))
    assert(this.debugUltimateNextSiblingOf(child, this._lastChild))
    assert(childParentData.chunk === this, 'child 已分配的 chunk 不是自己')
    assert(this._childCount >= 0)
    if (!childParentData.prevSiblingInChunk) {
      // 子节点是 firstChild
      assert(this._firstChild === child)
      this._firstChild = childParentData.nextSiblingInChunk
    } else {
      const childPrevSiblingParentData = childParentData.prevSiblingInChunk.parentData!
      childPrevSiblingParentData.nextSiblingInChunk = childParentData.nextSiblingInChunk
    }
    if (!childParentData.nextSiblingInChunk) {
      // 子节点是 lastChild
      assert(this._lastChild === child)
      this._lastChild = childParentData.prevSiblingInChunk
    } else {
      const childNextSiblingParentData = childParentData.nextSiblingInChunk.parentData!
      childNextSiblingParentData.prevSiblingInChunk = childParentData.prevSiblingInChunk
    }
    childParentData.prevSiblingInChunk = undefined
    childParentData.nextSiblingInChunk = undefined
    childParentData.chunk = undefined
    child.offstage = true
    this._childCount -= 1
    this._layoutDirty = true
    this._paintDirty = true
  }

  removeChild(child: ChildType) {
    this.internalRemoveChild(child)
  }

  removeAllChildren() {
    let child = this._firstChild
    while (child) {
      const childParentData = child.parentData!
      const next = childParentData.nextSiblingInChunk
      childParentData.prevSiblingInChunk = undefined
      childParentData.nextSiblingInChunk = undefined
      childParentData.chunk = undefined
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
        child = child.parentData!.nextSiblingInChunk!
      }
    }
    return children
  }

}
