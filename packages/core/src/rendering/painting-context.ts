import assert from 'assert'
import {
  Canvas,
  Paint,
  PaintStyle,
  PictureRecoder
} from '../canvas'
import {
  ClipRectLayer,
  ClipRRectLayer,
  ContainerLayer,
  Layer,
  OffsetLayer,
  PictureLayer,
  TransformLayer
} from '../compositing'
import { DebugFlags } from '../debug'
import { Log } from '../foundation'
import { Point, Rect, RRect } from '../math'
import type { RenderObject } from './render-object'

export type PaintingContextCallback = (context: PaintingContext, offset: Point) => void

export class PaintingContext {

  @Log({ disabled: true })
  static repaintCompositedChild(child: RenderObject, debugAlsoPaintedParent = false) {
    assert(child._paintDirty, '子节点的 paintDirty 不为 true')
    PaintingContext._repaintCompositedChild(child, debugAlsoPaintedParent)
  }

  private static _repaintCompositedChild(child: RenderObject, debugAlsoPaintedParent = false) {
    assert(child.repaintBoundary, '子节点不是 repaintBoundary')

    let childLayer = child._layer
    if (!childLayer) {
      assert(debugAlsoPaintedParent)
      child._layer = childLayer = new OffsetLayer()
    } else {
      assert(debugAlsoPaintedParent || childLayer.attached)
      childLayer.removeAllChildren()
    }
    assert(childLayer === child._layer)
    assert(child._layer instanceof TransformLayer)
    const childContext = new PaintingContext(child._layer!, child.paintBounds)
    child.paintWithContext(childContext, Point.zero)

    // 再次检查确保 paint() 不会替换 ._layer 
    assert(childLayer === child._layer)
    childContext.stopRecordingIfNeeded()
  }

  protected constructor(
    private readonly containerLayer: ContainerLayer,
    private readonly estimatedBounds: Rect,
  ) { }

  /**
   * 绘制一个子节点
   * 
   * 如果子节点具有自己的合成层，则会在当前上下文中创建一个子图层进行绘制，否则会绘制到当前图层
   */
  paintChild(child: RenderObject, offset: Point) {
    if (child.repaintBoundary) {
      this.stopRecordingIfNeeded()
      this.compositeChild(child, offset)
    } else {
      child.paintWithContext(this, offset)
    }
  }

  private compositeChild(child: RenderObject, offset: Point) {
    assert(!this.isRecording)
    assert(child.repaintBoundary)
    assert(!this._canvas)

    // 创建图层，然后绘制到该图层上
    if (child._paintDirty) {
      PaintingContext.repaintCompositedChild(child, true)
    }
    assert(child._layer instanceof OffsetLayer)
    child._layer.offset = offset
    this.appendLayer(child._layer)
  }

  protected appendLayer(layer: Layer) {
    assert(!this.isRecording)
    layer.removeFromParent()
    this.containerLayer.appendChild(layer)
  }

  private pictureLayer?: PictureLayer;
  private recorder?: PictureRecoder;
  private _canvas?: Canvas

  get canvas() {
    if (!this._canvas) {
      this.startRecording()
    }
    return this._canvas!
  }

  private get isRecording() {
    const hasCanvas = !!this._canvas
    assert.doesNotThrow(() => {
      if (hasCanvas) {
        assert(this.pictureLayer)
        assert(this.recorder)
        assert(this._canvas)
      } else {
        assert(!this.pictureLayer)
        assert(!this.recorder)
        assert(!this._canvas)
      }
    })
    return hasCanvas
  }

  private startRecording() {
    assert(!this.isRecording)
    this.pictureLayer = new PictureLayer()
    this.recorder = new PictureRecoder()
    this._canvas = this.recorder.begin()
    this.containerLayer.appendChild(this.pictureLayer)
  }

  protected stopRecordingIfNeeded() {
    if (!this.isRecording) {
      return
    }

    const picture = this.recorder!.end()
    assert.doesNotThrow(() => {
      if (DebugFlags.paintLayerBounds) {
        const paint: Paint = {
          style: PaintStyle.stroke,
          strokeWidth: 1,
          color: '#FF9800',
        }

        // 如果没有提供预估边界，则使用 picture 的边界
        const estimatedBounds = Rect.isEmpty(this.estimatedBounds) ? picture.cullRect : this.estimatedBounds
        this.canvas.drawRect(
          estimatedBounds.left,
          estimatedBounds.top,
          estimatedBounds.width,
          estimatedBounds.height,
          paint,
        )
      }
    })

    this.pictureLayer!.picture = picture
    this.pictureLayer = undefined
    this.recorder = undefined
    this._canvas = undefined
  }

  pushLayer(
    childLayer: ContainerLayer,
    painter: PaintingContextCallback,
    offset: Point,
    childPaintBounds?: Rect
  ) {
    if (childLayer.hasChildren) {
      childLayer.removeAllChildren()
    }
    this.stopRecordingIfNeeded()
    this.appendLayer(childLayer)
    const childContext = this.createChildContext(childLayer, childPaintBounds ?? this.estimatedBounds)
    painter(childContext, offset)
    childContext.stopRecordingIfNeeded()
  }

  protected createChildContext(childLayer: ContainerLayer, bounds: Rect) {
    return new PaintingContext(childLayer, bounds)
  }

  pushClipRect(
    needsCompositing: boolean,
    offset: Point,
    clipRect: Rect,
    painter: PaintingContextCallback,
    oldLayer?: ClipRectLayer,
  ) {
    const offsetClipRect = Rect.shift(clipRect, offset)
    if (needsCompositing) {
      const layer = oldLayer ?? new ClipRectLayer(offsetClipRect)
      layer.clipRect = offsetClipRect
      this.pushLayer(layer, painter, offset, offsetClipRect)
      return layer
    } else {
      this.clipRectAndPaint(offsetClipRect, () => painter(this, offset))
      return null
    }
  }

  clipRectAndPaint(rect: Rect, painter: () => void) {
    this.canvas.save()
    this.canvas.clipRect(rect.left, rect.top, rect.width, rect.height)
    painter()
    this.canvas.restore()
  }

  pushClipRRect(
    needsCompositing: boolean,
    offset: Point,
    clipRRect: RRect,
    painter: PaintingContextCallback,
    oldLayer?: ClipRRectLayer,
  ) {
    const offsetClipRRect = RRect.shift(clipRRect, offset)
    if (needsCompositing) {
      const layer = oldLayer ?? new ClipRRectLayer(offsetClipRRect)
      layer.clipRRect = offsetClipRRect
      this.pushLayer(layer, painter, offset, offsetClipRRect)
      return layer
    } else {
      this.clipRRectAndPaint(offsetClipRRect, () => painter(this, offset))
      return null
    }
  }

  clipRRectAndPaint(rrect: RRect, painter: () => void) {
    this.canvas.save()
    this.canvas.clipRRect(rrect.left, rrect.top, rrect.width, rrect.height, rrect.radiusX, rrect.radiusY)
    painter()
    this.canvas.restore()
  }

  setWillChange() {
    if (this.pictureLayer) {
      this.pictureLayer.willChange = true
    }
  }
}
