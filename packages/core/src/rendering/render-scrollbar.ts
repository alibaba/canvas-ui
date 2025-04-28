import { assert } from '@canvas-ui/assert'
import { SyntheticPointerEvent } from '../events'
import { Point, Size } from '../math'
import { RenderObject } from './render-object'
import { RenderRRect } from './render-rrect'
import { RenderSingleChild } from './render-single-child'

export abstract class RenderScrollbar extends RenderSingleChild<RenderRRect> {

  /**
   * 默认样式
   */
  static readonly defaultStyles = {
    thickness: 8,
    rx: 4,
    ry: 4,
    strokeWidth: 1,
    stroke: 'rgba(255, 255, 255, 0.6)',
    fill: 'rgba(0, 0, 0, 0.2)',
    cursor: 'default',
    minGripLength: 20,
  } as const

  constructor() {
    super()
    this.child = this.createGrip()
    this.thickness = RenderScrollbar.defaultStyles.thickness
  }

  /**
   * 设置或获取滚动条的长度
   */
  get length() {
    return this._length
  }
  set length(value) {
    this._length = value
    this.applyLengthAndThickness(value, this._thickness)
    this.updateGripPositionAndSize()
  }
  private _length = 0

  get thickness() {
    return this._thickness
  }
  set thickness(value) {
    if (value === this._thickness) {
      return
    }
    this._thickness = value
    this.applyLengthAndThickness(this._length, value)
  }
  protected declare _thickness: number

  protected abstract computeMoveDelta(lhs: SyntheticPointerEvent<RenderObject>, rhs: SyntheticPointerEvent<RenderObject>): number
  protected abstract applyLengthAndThickness(length: number, thickness: number): void
  protected abstract applyGripLengthAndPosition(gripLength: number, gripPosition: number): void

  private updateGripPositionAndSize() {

    // 计算抓手的长度 (Length)
    const scrollRatio = this._viewportLength / this._contentLength
    const trackLength = this.length
    let gripLength = trackLength * scrollRatio
    if (gripLength < RenderScrollbar.defaultStyles.minGripLength) {
      gripLength = RenderScrollbar.defaultStyles.minGripLength
    } else if (gripLength > trackLength) {
      gripLength = trackLength
    }

    // 计算抓手的位置 (gripPosition)

    // 滚动空间的长度
    const contentScrollAreaLength = this._contentLength - this._viewportLength

    // 滚动空间滚动比率
    const contentScrollAreaRatio = this._scrollPosition / contentScrollAreaLength

    // 轨道滚动空间的长度
    const trackScrollAreaLength = this._length - gripLength

    // 抓手的位置
    const gripPosition = contentScrollAreaRatio * trackScrollAreaLength

    this.gripPosition = gripPosition
    this.gripLength = gripLength
    this.trackScrollAreaLength = trackScrollAreaLength
    this.contentScrollAreaLength = contentScrollAreaLength

    this.applyGripLengthAndPosition(gripLength, gripPosition)
  }

  get scrollPosition() {
    return this._scrollPosition
  }
  set scrollPosition(value) {
    if (value === this._scrollPosition) {
      return
    }
    this._scrollPosition = value
    this.updateGripPositionAndSize()
  }
  private _scrollPosition = 0

  get contentLength() {
    return this._contentLength
  }
  set contentLength(value) {
    if (value === this._contentLength) {
      return
    }
    this._contentLength = value
    this.updateGripPositionAndSize()
  }
  private _contentLength = 0

  get viewportLength() {
    return this._viewportLength
  }
  set viewportLength(value) {
    this._viewportLength = value
    this.updateGripPositionAndSize()
  }
  private _viewportLength = 0


  get rx() {
    return this.grip.rx
  }
  set rx(value) {
    this.grip.rx = value
  }
  get ry() {
    return this.grip.ry
  }
  set ry(value) {
    this.grip.ry = value
  }
  get strokeWidth() {
    return this.grip.strokeWidth
  }
  set strokeWidth(value) {
    this.grip.strokeWidth = value
  }
  get stroke() {
    return this.grip.stroke
  }
  set stroke(value) {
    this.grip.stroke = value
  }
  get fill() {
    return this.grip.fill
  }
  set fill(value) {
    this.grip.fill = value
  }

  /**
   * 用户手动操作滚动条滚动时会调用该方法
   */
  declare onScroll?: (value: number) => void

  /**
   * The event triggered when the user manually operates the scrollbar by pressing the mouse.
   */
  declare onPointerDownGrip?: (grip: RenderRRect) => void

  /**
   * The event triggered when the user manually operates the scrollbar by releasing the mouse.
   */
  declare onPointerUpGrip?: (grip: RenderRRect) => void

  private createGrip() {
    const grip = new RenderRRect()
    grip.rx = RenderScrollbar.defaultStyles.rx
    grip.ry = RenderScrollbar.defaultStyles.ry
    grip.strokeWidth = RenderScrollbar.defaultStyles.strokeWidth
    grip.stroke = RenderScrollbar.defaultStyles.stroke
    grip.fill = RenderScrollbar.defaultStyles.fill
    grip.style.cursor = RenderHScrollbar.defaultStyles.cursor
    grip.addEventListener('pointerdown', this.handleGripPointerDown)
    return grip
  }

  protected handleGripPointerDown = (downEvent: SyntheticPointerEvent<RenderObject>) => {
    const rootNode = this.owner?.rootNode
    const downGripPosition = this.gripPosition
    this.onPointerDownGrip?.(this.grip)
    const handlePointerMove = (moveEvent: SyntheticPointerEvent<RenderObject>) => {
      const moveDelta = this.computeMoveDelta(moveEvent, downEvent)
      let gripPosition = downGripPosition + moveDelta
      if (gripPosition < 0) {
        gripPosition = 0
      } else if (gripPosition > this.trackScrollAreaLength) {
        gripPosition = this.trackScrollAreaLength
      }
      const gripPositionRatio = gripPosition / this.trackScrollAreaLength
      const scrollPosition = gripPositionRatio * this.contentScrollAreaLength
      this.onScroll?.(scrollPosition)
    }
    rootNode?.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', () => {
      this.onPointerUpGrip?.(this.grip)
      rootNode?.removeEventListener('pointermove', handlePointerMove)
    }, { once: true })
  }

  /**
   * 抓手的长度 (会被映射成 grip.size.width 或 grip.size.height)
   * 
   * 抓手的长度会根据内容和视口比例计算得出
   */
  protected gripLength = 0

  /**
   * 抓手的位置 (会被映射成 grip.position.x 或 grip.position.y)
   */
  protected gripPosition = 0

  /**
   * 轨道的长度
   */
  protected trackScrollAreaLength = 0

  /**
   * 内容的可滚动长度
   */
  protected contentScrollAreaLength = 0

  get grip() {
    assert(this._child, 'RenderScrollbar.grip: this._child is not set.')
    return this._child
  }
}

export class RenderHScrollbar extends RenderScrollbar {

  protected computeMoveDelta(lhs: SyntheticPointerEvent<RenderObject>, rhs: SyntheticPointerEvent<RenderObject>): number {
    return lhs.clientX - rhs.clientX
  }

  protected applyLengthAndThickness(length: number, thickness: number) {
    this.setSize(Size.fromWH(length, thickness))
  }

  protected applyGripLengthAndPosition(
    gripLength: number,
    gripPosition: number,
  ) {
    this.grip.size = Size.fromWH(gripLength, this.thickness)
    this.grip.offset = Point.fromXY(gripPosition, 0)
  }

}

export class RenderVScrollbar extends RenderScrollbar {

  protected computeMoveDelta(lhs: SyntheticPointerEvent<RenderObject>, rhs: SyntheticPointerEvent<RenderObject>): number {
    return lhs.clientY - rhs.clientY
  }

  protected applyLengthAndThickness(length: number, thickness: number) {
    this.setSize(Size.fromWH(thickness, length))
  }

  protected applyGripLengthAndPosition(
    gripLength: number,
    gripPosition: number,
  ) {
    this.grip.size = Size.fromWH(this.thickness, gripLength)
    this.grip.offset = Point.fromXY(0, gripPosition)
  }

}
