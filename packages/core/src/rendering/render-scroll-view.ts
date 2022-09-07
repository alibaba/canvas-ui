import { assert } from '@canvas-ui/assert'
import { SyntheticEvent, SyntheticEventListener, SyntheticWheelEvent } from '../events'
import type { Mut } from '../foundation'
import { Point, Rect, Size } from '../math'
import { HitTestResult } from './hit-test'
import type { PaintingContext } from './painting-context'
import type { RenderObject, Visitor } from './render-object'
import { RenderPipeline } from './render-pipeline'
import { RenderHScrollbar, RenderVScrollbar } from './render-scrollbar'
import { RenderSingleChild } from './render-single-child'

export enum ScrollAxis {
  None = 0,
  Horizontal = 1,
  Vertical = 2,
}

export enum ScrollBounds {
  None = 0,
  Horizontal = 1,
  Vertical = 2,

  /**
   * 相当于设置 ScrollBounds.Horizontal | ScrollBounds.Vertical
   * @deprecated
   */
  Fit = 1 | 2,
}

export class RenderScrollView extends RenderSingleChild<RenderObject> {

  private hScrollbar = new RenderHScrollbar()

  private vScrollbar = new RenderVScrollbar()

  readonly scrollbarMargin = 4

  constructor() {
    super()
    this.addEventListener('wheel', this.handleWheel)
    this.adoptChild(this.hScrollbar)
    this.hScrollbar.onScroll = scrollPosition => {
      this.scrollLeft = scrollPosition
    }
    this.adoptChild(this.vScrollbar)
    this.vScrollbar.onScroll = scrollPosition => {
      this.scrollTop = scrollPosition
    }

    this.scrollbarAutoHideDelay = 1000
  }

  private handleWheel = (event: SyntheticWheelEvent<RenderScrollView>) => {
    if (this._scrollAxis === ScrollAxis.None) {
      return
    }

    const vertical = Math.abs(event.deltaY) > Math.abs(event.deltaX)

    const scrollDelta = Point.fromXY(
      !vertical && (this._scrollAxis & ScrollAxis.Horizontal) ? event.deltaX : 0,
      vertical && (this._scrollAxis & ScrollAxis.Vertical) ? event.deltaY : 0,
    )

    if (!Point.eq(scrollDelta, Point.zero)) {
      this.scrollOffset = Point.add(
        this._scrollOffset ?? Point.zero,
        scrollDelta,
      )
    }
  }

  /**
   * 滚动方向，默认 ScrollAxis.Horizontal | ScrollAxis.Vertical
   */
  get scrollAxis() {
    return this._scrollAxis
  }
  set scrollAxis(value) {
    if (value === this._scrollAxis) {
      return
    }
    this._scrollAxis = value
  }
  private _scrollAxis = ScrollAxis.Horizontal | ScrollAxis.Vertical

  /**
   * 设置或获取是否按需展示滚动条
   * 
   * 滚动条是不占位的，他会覆盖在滚动内容上方
   * 
   * 默认情况下，当滚动范围大于滚动大小时，展示滚动条
   * 
   * 你也可以单独设置滚动条是否展示
   * 
   * 例如：
   * 
   * ```typescript
   * // 仅按需展示水平滚动条
   * myScrollView.scrollbar = ScrollAxis.Horizontal
   * ```
   */
  get scrollbar() {
    return this._scrollbar
  }
  set scrollbar(value) {
    if (value === this._scrollbar) {
      return
    }
    this._scrollbar = value
    this.markPaintDirty()
  }
  private _scrollbar = ScrollAxis.Horizontal | ScrollAxis.Vertical


  /**
   * 滚动条自动消失的延迟 ms，默认 1000
   */
  get scrollbarAutoHideDelay() {
    return this._scrollbarAutoHideDelay
  }
  set scrollbarAutoHideDelay(value) {
    this._scrollbarAutoHideDelay = value
    this._scrollbarAutoHideDelayFrames = Math.round(this._scrollbarAutoHideDelay / (1000 / 60))
  }
  private declare _scrollbarAutoHideDelay: number
  private declare _scrollbarAutoHideDelayFrames: number
  private _scrollOffsetUpdateFlag = 0

  /**
   * 滚动边界，修改该属性会导致 relayout，默认 ScrollBounds.Horizontal | ScrollBounds.Vertical
   */
  get scrollBounds() {
    return this._scrollBounds
  }
  set scrollBounds(value) {
    if (value === this._scrollBounds) {
      return
    }
    this._scrollBounds = value
    this.markLayoutDirty()
  }
  private _scrollBounds = ScrollBounds.Horizontal | ScrollBounds.Vertical

  /**
   * 滚动位置，相当于 DOM 的 scrollLeft / scrollTop
   */
  get scrollOffset() {
    return this._scrollOffset
  }
  set scrollOffset(value) {
    if (this._setScrollOffset(value)) {
      this.dispatchScrollEvent()
    }
  }
  private _scrollOffset = Point.zero

  _setScrollOffset(value: Point) {
    // 检测滚动不可越界
    if (this._scrollBounds !== ScrollBounds.None) {
      value = this.fitIntoScrollBounds(value)
    }
    if (Point.eq(value, this._scrollOffset)) {
      return false
    }
    this._scrollOffset = value
    if (this._child) {
      const { viewport } = this._child
      this._child.viewport = Rect.fromLTWH(
        this._scrollOffset.x,
        this._scrollOffset.y,
        viewport.width,
        viewport.height,
      )

      // 更新滚动条位置
      this.hScrollbar.scrollPosition = this._scrollOffset.x
      this.vScrollbar.scrollPosition = this._scrollOffset.y

      // 隐藏滚动条
      this._scrollOffsetUpdateFlag = this._scrollbarAutoHideDelayFrames
      this.unstable_markEnterFrame()
    }
    this.markPaintDirty()
    return true
  }

  override unstable_enterFrame() {
    if (this._scrollOffsetUpdateFlag === 0) {
      this.markPaintDirty()
    } else {
      this._scrollOffsetUpdateFlag--
      this.unstable_markEnterFrame()
    }
  }

  override _paint(context: PaintingContext, offset: Point) {
    super._paint(context, offset)
    if (this._child) {
      const viewportOffset = this.viewportOffset

      if (this._scrollbarAutoHideDelay === 0 || this._scrollOffsetUpdateFlag > 0) {
        // 绘制滚动条
        this.hScrollbar.offstage = this._child.viewport.width >= this.scrollSize.width
        if (!this.hScrollbar.offstage
          && this.scrollbar & ScrollAxis.Horizontal
          && this.scrollAxis & ScrollAxis.Horizontal
        ) {
          context.paintChild(this.hScrollbar, Point.add3(this.hScrollbar.offset, offset, viewportOffset))
        }

        this.vScrollbar.offstage = this._child.viewport.height >= this.scrollSize.height
        if (!this.vScrollbar.offstage
          && this.scrollbar & ScrollAxis.Vertical
          && this.scrollAxis & ScrollAxis.Vertical
        ) {
          context.paintChild(this.vScrollbar, Point.add3(this.vScrollbar.offset, offset, viewportOffset))
        }
      }
    }
  }

  private fitIntoScrollBounds(scrollOffset: Point) {
    const offset: Mut<Point> = Point.clone(scrollOffset)

    if (this._scrollBounds & ScrollBounds.Horizontal) {
      const { scrollLeftMax } = this
      if (offset.x < 0) {
        offset.x = 0
      } else if (offset.x > scrollLeftMax) {
        offset.x = scrollLeftMax
      }
    }

    if (this._scrollBounds & ScrollBounds.Vertical) {
      const { scrollTopMax } = this
      if (offset.y < 0) {
        offset.y = 0
      } else if (offset.y > scrollTopMax) {
        offset.y = scrollTopMax
      }
    }

    return offset
  }

  protected ensureScrollOffsetValid(): void {
    if (this._scrollBounds === ScrollBounds.None || !this._child) {
      return
    }
    this.scrollOffset = this.fitIntoScrollBounds(this._scrollOffset)
  }

  /**
   * 滚动大小，相当于 scrollWidth, scrollHeight
   * 
   * 用户可以指定滚动大小，此时子节点的 size 将不起作用
   * 
   * 默认使用子节点的 size
   */
  get scrollSize(): Size {
    if (this._scrollSize) {
      return this._scrollSize
    }
    if (this._child) {
      return Size.add(this._child.size, this._child.offset)
    }
    return Size.zero
  }
  set scrollSize(value: Size | undefined) {
    if (value === this._scrollSize) {
      return
    }
    if (value && this._scrollSize) {
      if (!Size.eq(value, this._scrollSize)) {
        this._scrollSize = value
      }
    } else {
      this._scrollSize = value
    }
    // 我们可能需要重新了解子节点的大小，所以标记重新布局
    this.markLayoutDirty()
  }
  private _scrollSize?: Size

  get scrollWidth() {

    // todo(haocong): 升级 ts 4.3 以删除断言
    return this.scrollSize!.width
  }

  get scrollHeight() {

    // todo(haocong): 升级 ts 4.3 以删除断言
    return this.scrollSize!.height
  }

  get scrollLeftMax() {
    return Math.max(0, this.scrollWidth - this._size.width)
  }

  get scrollTopMax() {
    return Math.max(0, this.scrollHeight - this._size.height)
  }

  get scrollLeft() {
    return this.scrollOffset.x
  }
  set scrollLeft(value) {
    if (value !== this.scrollLeft) {
      this.scrollOffset = Point.fromXY(value, this._scrollOffset.y)
    }
  }

  get scrollTop() {
    return this.scrollOffset.y
  }
  set scrollTop(value) {
    if (value !== this.scrollTop) {
      this.scrollOffset = Point.fromXY(this._scrollOffset.x, value)
    }
  }

  override adoptChild(child: RenderObject) {
    super.adoptChild(child)
    this.updateChildViewport(child)
  }

  private updateChildViewport(child: RenderObject) {
    const { viewport } = child
    child.viewport = Rect.fromLTWH(viewport.left, viewport.top, this._size.width, this._size.height)
    this.hScrollbar.viewportLength = child.viewport.width
    this.vScrollbar.viewportLength = child.viewport.height
  }

  protected override setSize(value: Size) {
    if (super.setSize(value)) {
      if (this._child) {

        // 更新子节点的视口
        this.updateChildViewport(this._child)

        // 更新滚动条的大小和位置

        this.hScrollbar.offset = Point.fromXY(
          this.scrollbarMargin,
          this._size.height - this.scrollbarMargin - this.hScrollbar.size.height,
        )
        this.hScrollbar.length = this._size.width - 2 * this.scrollbarMargin - this.vScrollbar.size.width

        this.vScrollbar.offset = Point.fromXY(
          this._size.width - this.scrollbarMargin - this.vScrollbar.size.width,
          this.scrollbarMargin,
        )
        this.vScrollbar.length = this._size.height - 2 * this.scrollbarMargin - this.hScrollbar.size.height
      }

      return true
    }
    return false
  }

  override performLayout() {
    this.updateOffsetAndSize()
    if (this._child) {
      this.updateChildViewport(this._child)
      const parentUsesSize =
        Boolean(this._scrollBounds & ScrollBounds.Vertical || this._scrollBounds & ScrollBounds.Horizontal)
        && !this._scrollSize
      this._child.layoutAsChild(parentUsesSize, false)
      this.ensureScrollOffsetValid()

      this.hScrollbar.layoutAsChild(false, false)
      this.hScrollbar.contentLength = this.scrollWidth
      this.vScrollbar.layoutAsChild(false, false)
      this.vScrollbar.contentLength = this.scrollHeight

    }
  }

  override visitChildren(visitor: Visitor<RenderObject>) {
    if (this._child) {
      visitor(this._child)
    }
    if (this.hScrollbar) {
      visitor(this.hScrollbar)
    }
    if (this.vScrollbar) {
      visitor(this.vScrollbar)
    }
  }

  override attach(owner: RenderPipeline) {
    super.attach(owner)
    this.vScrollbar.attach(owner)
    this.hScrollbar.attach(owner)
  }

  override detach() {
    super.detach()
    this.vScrollbar.detach()
    this.hScrollbar.detach()
  }

  override get repaintBoundary() {
    return true
  }
  override _repaintBoundaryLocked = true

  override hitTestChildren(result: HitTestResult, position: Point): boolean {
    if (!this._child) {
      return false
    }

    const isHitScrollbars =
      this.hitTestScrollbar(this.vScrollbar, result, position)
      || this.hitTestScrollbar(this.hScrollbar, result, position)
    if (isHitScrollbars) {
      return isHitScrollbars
    }

    return super.hitTestChildren(result, position)
  }

  private hitTestScrollbar(
    scrollbar: RenderObject,
    result: HitTestResult,
    position: Point): boolean {
    return !scrollbar.offstage && result.addWithPaintOffset(
      Point.add(scrollbar.offset, this.viewportOffset),
      position,
      (result, transformed) => {
        assert(Point.eq(transformed, Point.add(position, Point.invert(Point.add(scrollbar.offset, this.viewportOffset)))))
        return scrollbar.hitTest(result, transformed)
      }
    )
  }

  private dispatchScrollEvent() {
    const event = new SyntheticEvent('scroll', {
      bubbles: false,
      cancelable: false,
    })
    this.dispatchEvent(event)
  }

  get onScroll() {
    return this._onScroll
  }
  set onScroll(value) {
    if (this._onScroll) {
      this.removeEventListener('scroll', this._onScroll)
    }
    this._onScroll = value
    if (this._onScroll) {
      this.addEventListener('scroll', this._onScroll)
    }
  }
  private _onScroll?: SyntheticEventListener<SyntheticEvent<RenderScrollView>>
}
