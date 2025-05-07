import { assert } from '@canvas-ui/assert'
import { Paint, PaintStyle } from '../canvas'
import { ContainerLayer, OffsetLayer, TransformLayer } from '../compositing'
import { DebugFlags } from '../debug'
import {
  HitTestRoot,
  SyntheticEvent,
  SyntheticEventDispatcher,
  SyntheticEventListener,
  SyntheticEventManager,
  SyntheticEventTarget,
  SyntheticPointerEvent,
  SyntheticWheelEvent
} from '../events'
import { AbstractNode, Log } from '../foundation'
import { Matrix, MutableMatrix, Point, Rect, Size } from '../math'
import { EventHandlers } from './event-handlers.mixin'
import { HitTestEntry, HitTestResult } from './hit-test'
import { PaintingContext } from './painting-context'
import { RenderPipeline } from './render-pipeline'
import { StyleMap } from './style-map'
import { Yoga, YogaMeasure } from './yoga'

/**
 * 储存所有由父对象管理的数据
 */
export class ParentData {
  /**
   * RenderObject 被从 parent 移除时调用
   */
  detach() {
    //
  }
}

export type Visitor<T extends RenderObject> = { bivarianceHack(child: T): void }['bivarianceHack']

export interface RenderObject {
  onPointerMove?: SyntheticEventListener<SyntheticPointerEvent<any>>
  onPointerOver?: SyntheticEventListener<SyntheticPointerEvent<any>>
  onPointerEnter?: SyntheticEventListener<SyntheticPointerEvent<any>>
  onPointerDown?: SyntheticEventListener<SyntheticPointerEvent<any>>
  onPointerUp?: SyntheticEventListener<SyntheticPointerEvent<any>>
  onPointerOut?: SyntheticEventListener<SyntheticPointerEvent<any>>
  onPointerLeave?: SyntheticEventListener<SyntheticPointerEvent<any>>
  onWheel?: SyntheticEventListener<SyntheticWheelEvent<any>>
  onPointerMoveCapture?: SyntheticEventListener<SyntheticPointerEvent<any>>
  onPointerOverCapture?: SyntheticEventListener<SyntheticPointerEvent<any>>
  onPointerEnterCapture?: SyntheticEventListener<SyntheticPointerEvent<any>>
  onPointerDownCapture?: SyntheticEventListener<SyntheticPointerEvent<any>>
  onPointerUpCapture?: SyntheticEventListener<SyntheticPointerEvent<any>>
  onPointerOutCapture?: SyntheticEventListener<SyntheticPointerEvent<any>>
  onPointerLeaveCapture?: SyntheticEventListener<SyntheticPointerEvent<any>>
  onWheelCapture?: SyntheticEventListener<SyntheticWheelEvent<any>>
  onPaint?: (offset: Point) => void
}

/**
 * RenderObject 是场景树中所有对象的基类
 * 
 */
export abstract class RenderObject<ParentDataType extends ParentData = ParentData>
  extends AbstractNode<RenderPipeline>
  implements SyntheticEventTarget {


  /**
   * `RenderObject` 的 parent，如果没有 parent，则为 undefined
   */
  override get parent() {
    return this._parent as RenderObject | undefined
  }

  /**
   * 唯一 id
   */
  id?: string | number

  /**
   * 样式
   */
  readonly style = new StyleMap()

  protected trackStyle() {
    this.style.on('width', this.handleWidthChange, this)
    this.style.on('height', this.handleHeightChange, this)
    this.style.on('display', this.handleDisplayChange, this)
    this.style.on('visibility', this.handleVisibilityChange, this)
    if (this.style.has('display')) {
      this.handleDisplayChange(this.style.display)
    }
    if (this.style.has('visibility')) {
      this.handleVisibilityChange(this.style.visibility)
    }
    this.style.on('left', this.handleLeftChange, this)
    this.style.on('top', this.handleTopChange, this)
  }

  /**
   * 从样式更新 bounds
   */
  protected updateOffsetAndSizeFromStyle() {
    const { width, height, left, top } = this.style

    if (typeof width === 'number' && typeof height === 'number') {
      this.size = Size.fromWH(width, height)
    } else if (typeof width === 'number') {
      this.size = Size.fromWH(width, this._size.height)
    } else if (typeof height === 'number') {
      this.size = Size.fromWH(this._size.width, height)
    }

    if (typeof left === 'number' && typeof top === 'number') {
      this.offset = Point.fromXY(left, top)
    } else if (typeof left === 'number') {
      this.offset = Point.fromXY(left, this._offset.y)
    } else if (typeof top === 'number') {
      this.offset = Point.fromXY(this._offset.x, top)
    }
  }

  /**
   * 父节点使用的信息，比如说保存一些布局相关信息，偏移量等等
   * 对于子节点来说是不透明的
   */
  parentData?: ParentDataType

  protected setupParentData(child: RenderObject) {
    if (!(child.parentData instanceof ParentData)) {
      child.parentData = new ParentData()
    }
  }

  override adoptChild(child: RenderObject) {
    this.setupParentData(child)
    this.markLayoutDirty()
    this.markNeedsCompositingDirty()
    super.adoptChild(child)
    this.allocChildYogaNode(child)
  }

  protected allocChildYogaNode(child: RenderObject) {
    if (this._yogaNode || child.alwaysHoldYogaNode) {
      if (!child.yogaNode) {
        const childYogaNode = Yoga.Node.create()
        child.yogaNode = childYogaNode
      }
    }
    child.allocChildrenYogaNode()
  }

  protected allocChildrenYogaNode() { }

  override dropChild(child: RenderObject) {
    assert(child.parentData)
    super.dropChild(child)
    child.cleanRelayoutBoundary()
    child.parentData.detach()
    child.parentData = undefined
    this.deallocYogaNode(child)
    this.markLayoutDirty()
    this.markNeedsCompositingDirty()
  }

  protected deallocYogaNode(child: RenderObject) {
    const { yogaNode } = child
    if (yogaNode) {
      // 先解引用，然后释放内存
      child.yogaNode = undefined
      yogaNode.free()
    }
    child.deallocYogaNodeChildren()
  }

  protected deallocYogaNodeChildren() { }

  abstract visitChildren(visitor: Visitor<RenderObject>): void

  /**
   * 我们使用 Yoga 进行 Flex 布局，yogaNode 表示 RenderObject 的**伴生 yoga 节点**
   */
  get yogaNode() {
    return this._yogaNode
  }
  set yogaNode(value) {
    if (this._yogaNode) {
      this.disposeYogaNode()
    }
    this._yogaNode = value
    if (this._yogaNode) {
      this.setupYogaNode()
    }
  }
  _yogaNode?: Yoga.YogaNode

  /**
   * 节点是否总是持有 YogaNode
   */
  get alwaysHoldYogaNode() {
    return false
  }

  /**
   * 初始化 yogaNode
   */
  protected setupYogaNode() {
    assert(this.yogaNode)
    if (this.yogaMeasure) {
      this.yogaNode.setMeasureFunc(this.yogaMeasure)
    }

    // 同步样式到 yogaNode
    const { style } = this
    if (style.has('flexBasis')) {
      this.handleFlexBasisChange(style.flexBasis)
    }
    if (style.has('flexGrow')) {
      this.handleFlexGrowChange(style.flexGrow)
    }
    if (style.has('flexShrink')) {
      this.handleFlexShrinkChange(style.flexShrink)
    }
    if (style.has('width')) {
      this.handleWidthChange(style.width)
    }
    if (style.has('height')) {
      this.handleHeightChange(style.height)
    }
    if (style.has('minWidth')) {
      this.handleMinWidthChange(style.minWidth)
    }
    if (style.has('minHeight')) {
      this.handleMinHeightChange(style.minHeight)
    }
    if (style.has('maxWidth')) {
      this.handleMaxWidthChange(style.maxWidth)
    }
    if (style.has('maxHeight')) {
      this.handleMaxHeightChange(style.maxHeight)
    }
    if (style.has('paddingTop')) {
      this.handlePaddingTopChange(style.paddingTop)
    }
    if (style.has('paddingRight')) {
      this.handlePaddingRightChange(style.paddingRight)
    }
    if (style.has('paddingBottom')) {
      this.handlePaddingBottomChange(style.paddingBottom)
    }
    if (style.has('paddingLeft')) {
      this.handlePaddingLeftChange(style.paddingLeft)
    }
    if (style.has('marginTop')) {
      this.handleMarginTopChange(style.marginTop)
    }
    if (style.has('marginRight')) {
      this.handleMarginRightChange(style.marginRight)
    }
    if (style.has('marginBottom')) {
      this.handleMarginBottomChange(style.marginBottom)
    }
    if (style.has('marginLeft')) {
      this.handleMarginLeftChange(style.marginLeft)
    }
    if (style.has('display')) {
      this.handleDisplayChange(style.display)
    }
    if (style.has('position')) {
      this.handlePositionChange(style.position)
    }
    if (style.has('right')) {
      this.handleRightChange(style.right)
    }
    if (style.has('bottom')) {
      this.handleBottomChange(style.bottom)
    }
    // 追踪变更
    style.on('flexBasis', this.handleFlexBasisChange, this)
    style.on('flexGrow', this.handleFlexGrowChange, this)
    style.on('flexShrink', this.handleFlexShrinkChange, this)

    // width 和 height 样式在 handleWidthChange 中已经追踪，这里无需重复追踪
    // style.on('width', this.handleWidthChange, this)
    // style.on('height', this.handleHeightChange, this)
    style.on('minWidth', this.handleMinWidthChange, this)
    style.on('minHeight', this.handleMinHeightChange, this)
    style.on('maxWidth', this.handleMaxWidthChange, this)
    style.on('maxHeight', this.handleMaxHeightChange, this)
    style.on('paddingTop', this.handlePaddingTopChange, this)
    style.on('paddingLeft', this.handlePaddingLeftChange, this)
    style.on('paddingRight', this.handlePaddingRightChange, this)
    style.on('paddingBottom', this.handlePaddingBottomChange, this)
    style.on('marginTop', this.handleMarginTopChange, this)
    style.on('marginLeft', this.handleMarginLeftChange, this)
    style.on('marginRight', this.handleMarginRightChange, this)
    style.on('marginBottom', this.handleMarginBottomChange, this)
    style.on('position', this.handlePositionChange, this)
    style.on('right', this.handleRightChange, this)
    style.on('bottom', this.handleBottomChange, this)
    // style.on('display', this.handleDisplayChange, this)

    // let childIndex = 0
    // this.visitChildren(child => {
    //   if (child.yogaNode) {
    //     this.yogaNode!.insertChild(child.yogaNode, childIndex++)
    //   }
    // })
  }

  protected disposeYogaNode() {
    assert(this._yogaNode)
    const { style } = this
    style.off('flexBasis', this.handleFlexBasisChange, this)
    style.off('flexGrow', this.handleFlexGrowChange, this)
    style.off('flexShrink', this.handleFlexShrinkChange, this)
    // style.off('width', this.handleWidthChange, this)
    // style.off('height', this.handleHeightChange, this)
    style.off('minWidth', this.handleMinWidthChange, this)
    style.off('minHeight', this.handleMinHeightChange, this)
    style.off('maxWidth', this.handleMaxWidthChange, this)
    style.off('maxHeight', this.handleMaxHeightChange, this)
    style.off('paddingTop', this.handlePaddingTopChange, this)
    style.off('paddingLeft', this.handlePaddingLeftChange, this)
    style.off('paddingRight', this.handlePaddingRightChange, this)
    style.off('paddingBottom', this.handlePaddingBottomChange, this)
    style.off('marginTop', this.handleMarginTopChange, this)
    style.off('marginLeft', this.handleMarginLeftChange, this)
    style.off('marginRight', this.handleMarginRightChange, this)
    style.off('marginBottom', this.handleMarginBottomChange, this)
    // style.off('display', this.handleDisplayChange, this)
    if (this.yogaMeasure) {
      this._yogaNode.unsetMeasureFunc()
    }
  }

  protected handleFlexBasisChange(value: StyleMap['flexBasis'] = 'auto') {
    assert(this.yogaNode)
    this.yogaNode.setFlexBasis(value)
    this.markLayoutDirty()
  }

  protected handleFlexGrowChange(value: StyleMap['flexGrow'] = 0) {
    assert(this.yogaNode)
    this.yogaNode.setFlexGrow(value)
    this.markLayoutDirty()
  }

  protected handleFlexShrinkChange(value: StyleMap['flexShrink'] = 1) {
    assert(this.yogaNode)
    this.yogaNode.setFlexShrink(value)
    this.markLayoutDirty()
  }

  protected handleWidthChange(value: StyleMap['width'] = 'auto') {
    this.yogaNode?.setWidth(value)
    this.markLayoutDirty()
  }

  protected handleHeightChange(value: StyleMap['height'] = 'auto') {
    this.yogaNode?.setHeight(value)
    this.markLayoutDirty()
  }

  protected handleMinWidthChange(value: StyleMap['minWidth'] = 'auto') {
    assert(this.yogaNode)
    this.yogaNode.setMinWidth(value === 'auto' ? NaN : value)
    this.markLayoutDirty()
  }

  protected handleMinHeightChange(value: StyleMap['minHeight'] = 'auto') {
    assert(this.yogaNode)
    this.yogaNode.setMinHeight(value === 'auto' ? NaN : value)
    this.markLayoutDirty()
  }

  protected handleMaxWidthChange(value: StyleMap['maxWidth'] = 'auto') {
    assert(this.yogaNode)
    this.yogaNode.setMaxWidth(value === 'auto' ? NaN : value)
    this.markLayoutDirty()
  }

  protected handleMaxHeightChange(value: StyleMap['maxHeight'] = 'auto') {
    assert(this.yogaNode)
    this.yogaNode.setMaxHeight(value === 'auto' ? NaN : value)
    this.markLayoutDirty()
  }

  protected handlePaddingTopChange(value: StyleMap['paddingTop'] = 0) {
    assert(this.yogaNode)
    this.yogaNode.setPadding(Yoga.EDGE_TOP, value)
    this.markLayoutDirty()
  }

  protected handlePaddingRightChange(value: StyleMap['paddingRight'] = 0) {
    assert(this.yogaNode)
    this.yogaNode.setPadding(Yoga.EDGE_RIGHT, value)
    this.markLayoutDirty()
  }

  protected handlePaddingBottomChange(value: StyleMap['paddingBottom'] = 0) {
    assert(this.yogaNode)
    this.yogaNode.setPadding(Yoga.EDGE_BOTTOM, value)
    this.markLayoutDirty()
  }

  protected handlePaddingLeftChange(value: StyleMap['paddingLeft'] = 0) {
    assert(this.yogaNode)
    this.yogaNode.setPadding(Yoga.EDGE_LEFT, value)
    this.markLayoutDirty()
  }

  protected handleMarginTopChange(value: StyleMap['marginTop'] = 0) {
    assert(this.yogaNode)
    this.yogaNode.setMargin(Yoga.EDGE_TOP, value)
    this.markLayoutDirty()
  }

  protected handleMarginRightChange(value: StyleMap['marginRight'] = 0) {
    assert(this.yogaNode)
    this.yogaNode.setMargin(Yoga.EDGE_RIGHT, value)
    this.markLayoutDirty()
  }

  protected handleMarginBottomChange(value: StyleMap['marginBottom'] = 0) {
    assert(this.yogaNode)
    this.yogaNode.setMargin(Yoga.EDGE_BOTTOM, value)
    this.markLayoutDirty()
  }

  protected handleMarginLeftChange(value: StyleMap['marginLeft'] = 0) {
    assert(this.yogaNode)
    this.yogaNode.setMargin(Yoga.EDGE_LEFT, value)
    this.markLayoutDirty()
  }

  protected handleDisplayChange(value: StyleMap['display']) {
    this.yogaNode?.setDisplay(value === 'none' ? Yoga.DISPLAY_NONE : Yoga.DISPLAY_FLEX)
    this.hidden = value === 'none' || this.style.visibility === 'hidden'
  }

  protected handleVisibilityChange(value: StyleMap['visibility']) {
    this.hidden = this.style.display === 'none' || value === 'hidden'
  }

  protected handleLeftChange(value: StyleMap['left'] = 0) {
    assert(typeof value === 'number', 'style.left 仅支持 number')
    if (this.yogaNode) {
      this.yogaNode.setPosition(Yoga.EDGE_LEFT, value)
      this.markLayoutDirty()
    } else {
      this.offset = Point.fromXY(value, this._offset.y)
      // 仅标记父节点需要重新布局
      this.parent?.markLayoutDirty(this)
    }
  }

  protected handleTopChange(value: StyleMap['top'] = 0) {
    assert(typeof value === 'number', 'style.top 仅支持 number')
    if (this.yogaNode) {
      this.yogaNode.setPosition(Yoga.EDGE_TOP, value)
      this.markLayoutDirty()
    } else {
      this.offset = Point.fromXY(this._offset.x, value)
      // 仅标记父节点需要重新布局
      this.parent?.markLayoutDirty(this)
    }
  }

  protected handleRightChange(value: StyleMap['right'] = 0) {
    assert(typeof value === 'number', 'style.left 仅支持 number')
    if (this.yogaNode) {
      this.yogaNode.setPosition(Yoga.EDGE_RIGHT, value)
      this.markLayoutDirty()
    }
  }

  protected handleBottomChange(value: StyleMap['bottom'] = 0) {
    assert(typeof value === 'number', 'style.bottom 仅支持 number')
    if (this.yogaNode) {
      this.yogaNode.setPosition(Yoga.EDGE_BOTTOM, value)
      this.markLayoutDirty()
    }
  }

  protected handlePositionChange(value: StyleMap['position']) {
    assert(this.yogaNode)

    const positionType =
      value === 'absolute'
        ? Yoga.POSITION_TYPE_ABSOLUTE
        : value === 'relative'
          ? Yoga.POSITION_TYPE_RELATIVE
          : null

    if (!positionType) {
      return
    }

    this.yogaNode.setPositionType(positionType)
    this.markLayoutDirty()
  }

  protected updateOffsetAndSizeFromYogaNode() {
    assert(this._yogaNode, 'updateOffsetAndSizeFromYogaNode: _yogaNode 不存在')
    const layout = this._yogaNode.getComputedLayout()
    this.size = Size.fromWH(layout.width, layout.height)

    // 如果自己是布局边界，则不更新 offset，因为 offset 受 parent (例如 View) 控制
    // todo(haocong): 这会导致根节点的 margin 不起作用，需要考虑一个方法解决
    if (this._relayoutBoundary !== this
      && this._yogaNode.getPositionType() !== Yoga.POSITION_TYPE_ABSOLUTE
    ) {
      this._offset = Point.fromXY(layout.left, layout.top)
    } else {
      const { left, top } = this.style
      const nextOffset = Point.fromXY(
        typeof left === 'number'
          ? left
          : this._offset.x,
        typeof top === 'number'
          ? top
          : this._offset.y,
      )
      if (!Point.eq(nextOffset, this._offset)) {
        this._offset = nextOffset
        this.parent?.markLayoutDirty(this)
      }
    }
  }

  override attach(owner: RenderPipeline) {
    super.attach(owner)

    if (this._layoutDirty && this._relayoutBoundary !== undefined) {
      this._layoutDirty = false
      this.markLayoutDirty()
    }

    if (this._needsCompositingDirty) {
      this._needsCompositingDirty = false
      this.markNeedsCompositingDirty()
    }

    if (this._paintDirty && this._layer) {
      this._paintDirty = false
      this.markPaintDirty()
    }

    // 初始化样式
    this.trackStyle()
  }

  override detach() {
    super.detach()

    // 结束样式追踪
    this.style.eventNames().forEach(it => {
      this.style.removeListener(it)
    })
  }

  /**
   * 设置或获取节节点的逻辑 size
   * 
   * 默认情况下 `paintBounds` 返回该值，作为参考指示你不可以超出画面进行绘制
   * 
   * 设置该属性不会导致重新布局，但是会导致重新绘制
   * 
   */
  get size() {
    return this._size
  }
  set size(value) {
    this.setSize(value)
  }
  protected setSize(value: Size) {
    if (Size.eq(value, this._size)) {
      return false
    }
    this._size = value
    this.markPaintDirty()
    return true
  }
  /**
   * @internal
   */
  _size = Size.zero

  /**
   * 设置或获取节点相对于 parent 的偏移
   * 
   * 设置该属性不会导致重新布局，但是会导致重新绘制
   */
  get offset() {
    return this._offset
  }
  set offset(value) {
    this.setOffset(value)
  }
  protected setOffset(value: Point) {
    if (Point.eq(this._offset, value)) {
      return false
    }
    this._offset = value

    // 修改了 offset 不会影响自身，而是影响父对象，所以我们需要标记父对象需要重绘
    this.parent?.markPaintDirty()
    return true
  }
  /**
   * @internal
   */
  _offset = Point.zero

  /**
   * 设置或获取节点的视口
   * 
   * 视口描述了一组裁剪区域和绘制偏移
   * 
   * 组件在实现 `paint` 时应读取该属性执行不可见区域的剔除和绘制偏移
   * 
   * 在实现 `hitTest` 系列方法时也需要应用偏移和裁剪
   * 
   */
  get viewport() {
    return this._viewport
  }
  set viewport(value) {
    if (Rect.eq(this._viewport, value)) {
      return
    }
    this._viewport = value
    this.markPaintDirty()
  }
  protected _viewport = Rect.zero
  get viewportOffset() {
    return Point.invert(Point.fromRect(this._viewport))
  }

  /**
   * 标记当前节点已离屏
   */
  offstage = true

  /**
   * 标记当前节点已隐藏 
   */
  get hidden() {
    return this._hidden
  }
  set hidden(value) {
    if (value === this._hidden) {
      return
    }
    this._hidden = value
    this.markLayoutDirty()
    this.markPaintDirty()
  }
  protected _hidden = false

  /**
   * 如果设置了 yogaMeasure yogaNode 为 dirty
   */
  protected markYogaNodeDirty() {
    // 只有设置了自定义测量方法的 Yoga 节点才可以 markDirty 
    if (!this.yogaMeasure) {
      return
    }
    this.yogaNode?.markDirty()
  }

  protected readonly yogaMeasure?: YogaMeasure

  /** friend of RenderPipeline */ _layoutDirty = true

  _relayoutBoundary?: RenderObject

  /**
   * 标记需要重新布局
   * 
   * @param cause 指示本次标记产生的子节点
   * 
   */
  @Log()
  markLayoutDirty(cause?: RenderObject) {
    assert(!cause || cause._parent === this)
    if (this._relayoutBoundary !== this) {
      this.markSelfAndParentLayoutDirty()
    } else {
      if (!this._layoutDirty) {
        this._layoutDirty = true
        // 如果使用了自定义测量方法，则需额外标记 Yoga 节点
        this.markYogaNodeDirty()
        if (this._owner) {
          this._owner.addLayoutDirty(this)
          this._owner.requestVisualUpdate()
        }
      }
    }
  }

  /**
   * 寻找布局边界并标记为 dirty
   */
  protected markSelfAndParentLayoutDirty() {
    this._layoutDirty = true
    this.markYogaNodeDirty()
    this.parent?.markLayoutDirty(this)
  }

  /**
   * 调度首次布局
   */
  scheduleInitialLayout() {
    assert(this._owner)
    assert(!(this._parent instanceof RenderObject))
    assert(!this._relayoutBoundary)
    this._relayoutBoundary = this
    this._owner.addLayoutDirty(this)
  }

  layoutAsChild(parentUsesSize: boolean, force: boolean) {
    if (this._hidden) {
      this._layoutDirty = false
      return
    }
    if (this._layoutDirty || force) {

      let relayoutBoundary: RenderObject | undefined

      if (!this.parent || !parentUsesSize) {
        relayoutBoundary = this
      } else {
        relayoutBoundary = this.parent._relayoutBoundary
      }

      if (this._relayoutBoundary !== undefined && this._relayoutBoundary !== relayoutBoundary) {
        this.visitChildren(RenderObject.cleanChildRelayoutBoundary)
      }
      this._relayoutBoundary = relayoutBoundary

      try {
        this.performLayout()
      } catch (err) {
        console.error(err)
      }
      this._layoutDirty = false
      this.markPaintDirty()
    }
  }

  private cleanRelayoutBoundary() {
    if (this._relayoutBoundary !== this) {
      this._relayoutBoundary = undefined
      this._layoutDirty = true
      this.visitChildren(RenderObject.cleanChildRelayoutBoundary)
    }
  }

  layoutAsBoundary() {
    if (this._hidden) {
      this._layoutDirty = false
      this.markPaintDirty()
      return
    }
    assert(this._layoutDirty)
    assert(this._relayoutBoundary === this, '节点的 _relayoutBoundary 不是自己')
    try {
      this.performLayout()
    } catch (err) {
      console.error(err)
    }
    this._layoutDirty = false
    this.markPaintDirty()
  }

  private static cleanChildRelayoutBoundary(child: RenderObject) {
    child.cleanRelayoutBoundary()
  }

  /**
   * 子类实现的布局逻辑
   */
  performLayout() {
    this.updateOffsetAndSize()
  }

  /**
   * 节点调度了 enterFrame 时调用
   */
  unstable_enterFrame() { }

  /**
   * 标记节点需要调度 enterFrame
   */
  unstable_markEnterFrame() {
    this._owner?.addEnterFrame(this)
    this._owner?.requestVisualUpdate()
  }

  /**
   * 更新 offset 和 size
   */
  protected updateOffsetAndSize() {
    if (this.yogaNode) {
      this.updateOffsetAndSizeFromYogaNode()
    } else {
      this.updateOffsetAndSizeFromStyle()
    }
  }

  /**
   * 当前对象是否是重绘边界
   */
  get repaintBoundary() {
    return this._repaintBoundary
  }
  set repaintBoundary(value) {
    assert(this._repaintBoundaryLocked === false, '节点的 repaintBoundary 已锁定，不能修改')
    if (value === this._repaintBoundary) {
      return
    }

    this._repaintBoundary = value
    this.markNeedsCompositingDirty()

    // 自己和 parent 都需要重新绘制
    this._paintDirty = true
    this.parent?.markPaintDirty()
  }
  protected _repaintBoundary = false

  protected _repaintBoundaryLocked = false

  /**
   * 指示是否总是需要合成
   */
  get alwaysNeedsCompositing() {
    return false
  }

  protected get layer() {
    assert(
      !this.repaintBoundary || (!this._layer || this._layer instanceof OffsetLayer),
      '如果 RenderObject 不是 repaintBoundary，_layer 只能是 OffsetLayer 或 undefined',
    )
    return this._layer
  }

  protected set layer(value: ContainerLayer | undefined) {
    assert(!this.repaintBoundary, '如果 RenderObject 不是 repaintBoundary，则 RenderPipeline 会自动创建 layer，你不能手动设置')
    this._layer = value
  }

  _layer?: ContainerLayer

  _needsCompositingDirty = false

  markNeedsCompositingDirty() {
    if (this._needsCompositingDirty) {
      return
    }

    this._needsCompositingDirty = true

    if (this._parent instanceof RenderObject) {
      const parent = this._parent
      if (parent._needsCompositingDirty) {
        return
      }
      if (!this.repaintBoundary && !parent.repaintBoundary) {
        parent.markNeedsCompositingDirty()
        return
      }
    }

    this._owner?.addNeedsCompositingDirty(this)
  }

  protected _needsCompositing = this.repaintBoundary || this.alwaysNeedsCompositing

  /**
   * 当前及子节点是否需要合成
   */
  get needsCompositing() {
    assert(!this._needsCompositingDirty, '不能在 _needsCompositingDirty=true 时访问 needsCompositing')
    return this._needsCompositing
  }

  updateNeedsCompositing() {
    if (!this._needsCompositingDirty) {
      return
    }
    const prevNeedsCompositing = this._needsCompositing
    this._needsCompositing = false
    this.visitChildren(child => {
      child.updateNeedsCompositing()
      if (child.needsCompositing)
        this._needsCompositing = true
    })
    if (this.repaintBoundary || this.alwaysNeedsCompositing) {
      this._needsCompositing = true
    }
    if (prevNeedsCompositing !== this._needsCompositing) {
      this.markPaintDirty()
    }
    this._needsCompositingDirty = false
  }

  _paintDirty = true

  /**
   * 标记节点需要重新绘制
   * 
   * @param cause 指示本次标记产生的子节点
   */
  markPaintDirty(cause?: RenderObject) {
    assert(!cause || cause._parent === this)
    if (this._paintDirty) {
      return
    }

    // 先标记自己
    this._paintDirty = true
    if (this.repaintBoundary) {
      // 当前是 RepaintBoundary，我们可以重绘自己
      assert(this._layer instanceof TransformLayer, '当前节点是 repaintBoundary，但 _layer 不是 ')
      if (this._owner) {
        this._owner.addPaintDirty(this)
        this._owner.requestVisualUpdate()
      }
    } else if (this._parent instanceof RenderObject) {
      // 逐级寻找 parent，到 repaintBoundary 为止
      this._parent.markPaintDirty(this)
    } else {
      // 根节点，例如 RenderCanvas，此时已经被加入 Pipeline.paintDirtyObjects
      // 我们只需要 requestVisualUpdate 即可
      this.owner?.requestVisualUpdate()
    }
  }

  /**
   * RenderPipeline.flushPaint 重绘 RenderObject，但所在图层还没有 attached
   * 
   * 为了保证子树在图层被 attached 时最终可以得到重绘，我们标记所有祖先 paintDirty
   */
  skipPaint() {
    assert(this.attached)
    assert(this.repaintBoundary)
    assert(this._paintDirty)
    assert(this._layer)
    assert(!this._layer.attached)
    let node = this._parent
    while (node instanceof RenderObject) {
      if (node.repaintBoundary) {
        if (!node._layer)
          break // 子树从未被渲染（图层也没有创建过）：交给该节点自行处理后续绘制
        if (node._layer.attached)
          break // 该节点主动 detach 了当前图层：交给该节点自行处理后续绘制
        node._paintDirty = true
      }
      node = node.parent
    }
  }

  scheduleInitialPaint(rootLayer: ContainerLayer) {
    assert(rootLayer.attached)
    assert(!this.parent, '仅限根节点使用')
    assert(this.repaintBoundary)
    assert(!this._layer)
    this._layer = rootLayer
    assert(this._paintDirty)
    assert(this._owner)
    this._owner.addPaintDirty(this)
  }

  replaceRootLayer(rootLayer: TransformLayer) {
    assert(rootLayer.attached)
    assert(this._owner)
    assert(!this.parent, '仅限根节点使用')
    assert(this.repaintBoundary)
    assert(this._layer, '首次绘制请使用 scheduleInitialPaint')
    this._layer.detach()
    this._layer = rootLayer
    this.markPaintDirty()
  }

  /**
   * 绘制边界，指示了当前节点的绘制区域
   * 
   * 你可以绘制超出该区域
   * 
   */
  get paintBounds() {
    return Rect.fromSize(this._size)
  }

  /**
   * 对象的边界，用于离屏检测
   */
  get bounds() {
    return Rect.fromLTWH(this._offset.x, this._offset.y, this._size.width, this._size.height)
  }

  _debugDoingThisPaint = false

  static _debugActivePaint?: RenderObject

  /* friend of RenderPipeline */paintWithContext(context: PaintingContext, offset: Point) {
    assert(!this._debugDoingThisPaint, '节点不能单独重复调用 _paintWithContext')
    if (this._layoutDirty) {
      return
    }
    assert(() => {
      if (this._needsCompositingDirty) {
        if (this.parent) {
          let visitedByParent = false
          this.parent.visitChildren(child => {
            if (child === this) {
              visitedByParent = true
            }
          })
          if (!visitedByParent) {
            throw new Error(`节点未通过其父节点进行绘制`)
          }
        }
        throw new Error(`不允许节点在 _needsCompositingDirty = true 时绘制`)
      }
    })
    let debugLastActivePaint: RenderObject | undefined
    assert(() => {
      this._debugDoingThisPaint = true
      debugLastActivePaint = RenderObject._debugActivePaint
      RenderObject._debugActivePaint = this
      assert(!this.repaintBoundary || this._layer !== null)
    })
    this._paintDirty = false
    if (!this._hidden) {
      try {
        this.paint(context, offset)
        this.onPaint?.(offset)
        assert(!this._layoutDirty, '检测到 paint 方法中重新将 _layoutDirty 标记为 true')
        assert(!this._paintDirty, '检测到 paint 方法中重新将 _paintDirty 标记为 true')
      } catch (err) {
        console.error(err)
      }
    }
    assert(() => {
      this.debugPaint(context, offset)
      RenderObject._debugActivePaint = debugLastActivePaint
      this._debugDoingThisPaint = false
    })
  }

  abstract paint(context: PaintingContext, offset: Point): void

  debugPaint(context: PaintingContext, offset: Point) {
    this.debugPaintSize(context, offset)
    this.debugPaintId(context, offset)
  }

  protected debugPaintSize(context: PaintingContext, offset: Point) {
    if (!DebugFlags.paintNodeBounds) {
      return
    }
    const paint: Paint = {
      style: PaintStyle.stroke,
      strokeWidth: 1,
      color: '#00FFFF',
    }
    context.canvas.drawRect(
      offset.x + this.viewportOffset.x,
      offset.y + this.viewportOffset.y,
      this.size.width,
      this.size.height,
      paint,
    )
  }

  protected debugPaintId(context: PaintingContext, offset: Point) {
    if (!DebugFlags.paintNodeId) {
      return
    }

    if (!this.id) {
      return
    }

    context.canvas.debugDrawText(
      String(this.id),
      offset.x,
      offset.y,
    )
  }

  applyPaintTransform(child: RenderObject, transform: MutableMatrix) {
    const { viewportOffset: childViewportOffset } = child
    transform.translate(
      child._offset.x + childViewportOffset.x,
      child._offset.y + childViewportOffset.y,
    )
  }

  localToGlobal(point: Point, ancestor?: RenderObject): Point {
    const transform = this.getTransformTo(ancestor)
    return Matrix.transformPoint(transform, point)
  }

  globalToLocal(point: Point, ancestor?: RenderObject): Point {
    const transform = this.getTransformTo(ancestor)
    return Matrix.inverseTransformPoint(transform, point)
  }

  @Log({ disabled: false })
  getBoundingClientRect(ancestor?: RenderObject) {
    const transform = this.getTransformTo(ancestor)
    return Matrix.transformRect(transform, Rect.fromSize(this._size))
  }

  getTransformTo(ancestor?: RenderObject): Matrix {
    assert(this._owner, '节点缺少 owner')
    const stop = ancestor ?? this._owner.rootNode
    const nodes: RenderObject[] = []
    for (let node: RenderObject = this; node !== stop; node = node.parent as RenderObject) {
      assert(node)
      nodes.push(node)
    }

    if (ancestor) {
      nodes.push(ancestor)
    }

    const transform = MutableMatrix.fromIdentity()
    for (let index = nodes.length - 1; index > 0; index -= 1) {
      nodes[index].applyPaintTransform(nodes[index - 1], transform)
    }
    return transform
  }

  protected get dispatcher(): SyntheticEventDispatcher {
    return this._dispatcher ??= new SyntheticEventDispatcher()
  }
  protected _dispatcher?: SyntheticEventDispatcher

  addEventListener(type: string, listener: SyntheticEventListener, options?: boolean | AddEventListenerOptions): void {
    return this.dispatcher.addEventListener(type, listener, options)
  }

  dispatchEvent(event: SyntheticEvent<SyntheticEventTarget, Event>): boolean {
    const rootNode = this._owner?.rootNode as unknown as HitTestRoot
    if (rootNode) {
      event.target = this
      event.path = [this]
      SyntheticEventManager.findInstance(rootNode)?.dispatchEvent(event)
    }
    return false
  }

  removeEventListener(type: string, listener: SyntheticEventListener, options?: boolean | EventListenerOptions): void {
    return this._dispatcher?.removeEventListener(type, listener, options)
  }

  getDispatcher() {
    return this._dispatcher
  }

  hitTestDisabled = false

  hitTestSelfDisabled = false

  hitTest(result: HitTestResult, position: Point): boolean {
    if (this.offstage || this._hidden || this.hitTestDisabled) {
      return false
    }
    if (
      !this.hitTestSelfDisabled && (
        !(Size.eq(this._size, Size.zero)
          || Size.contains(this._size, position)))
    ) {
      return false
    }

    if (
      this.hitTestChildren(result, position)
      || this.hitTestSelf(position)) {
      result.add(new HitTestEntry(this, position))
      return true
    }

    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected hitTestSelf(_position: Point): boolean {
    return !this.hitTestSelfDisabled
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected hitTestChildren(_result: HitTestResult, _position: Point): boolean {
    return false
  }

}

EventHandlers.mixin(RenderObject)
