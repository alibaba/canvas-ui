import { SyntheticEvent, SyntheticEventListener, SyntheticWheelEvent } from '../events'
import type { Mut } from '../foundation'
import { Point, Rect, Size } from '../math'
import type { RenderObject } from './render-object'
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

  constructor() {
    super()
    this.addEventListener('wheel', this.handleWheel)
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
   * 滚动边界，修改该属性会导致 relayout，默认 ScrollBounds.FitContent
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
    }
    this.markPaintDirty()
    return true
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
  get scrollSize() {
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
  }

  protected override setSize(value: Size) {
    if (super.setSize(value)) {
      if (this._child) {
        this.updateChildViewport(this._child)
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
    }
  }

  override get repaintBoundary() {
    return true
  }
  override _repaintBoundaryLocked = true

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
