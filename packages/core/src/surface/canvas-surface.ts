import { assert } from '@canvas-ui/assert'
import { Canvas, Canvas2DCanvas, Image } from '../canvas'
import { Size } from '../math'
import { CrossPlatformCanvasOrOffscreenCanvas } from '../platform'
import { Surface } from './surface'
import { SurfaceFrame } from './surface-frame'

export type CanvasSurfaceOptions = {
  el?: CrossPlatformCanvasOrOffscreenCanvas
}

export class CanvasSurface implements Surface {

  private _canvas?: Canvas

  private _context?: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

  private el: CrossPlatformCanvasOrOffscreenCanvas

  private prevFrame?: SurfaceFrame

  constructor({
    el,
  }: CanvasSurfaceOptions = {}) {
    assert(el, 'CanvasSurface requires a canvas element')
    this.el = el
  }

  acquireFrame(size: Size): SurfaceFrame {

    this.ensureCanvasSize(size)

    const frame = new SurfaceFrame(
      this.canvas,
      size,
      this.present,
    )

    // 记录下来，下一帧需要比较 size
    this.prevFrame = frame

    return frame
  }

  private present = () => {
    // canvas 2d 没有 present
  }

  /**
   * Ensures the canvas is sized correctly for the given size.
   * Resizes the canvas only if the size has changed since the last frame.
   */
  private ensureCanvasSize(size: Size) {
    const shouldResize =
      !this.prevFrame
      || !Size.eq(this.prevFrame.size, size)

    if (shouldResize) {
      this.el.width = size.width
      this.el.height = size.height
    }
  }

  get context() {
    if (!this._context) {
      const context = this.el.getContext('2d')
      assert(context, 'Failed to get 2d context from canvas')
      this._context = context as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
    }
    return this._context
  }

  get canvas() {
    if (!this._canvas) {
      assert(this.context)
      this._canvas = new Canvas2DCanvas({
        context: this.context,
      })
    }
    assert(this._canvas)
    return this._canvas
  }

  toImage(sx?: number, sy?: number, sw?: number, sh?: number) {
    assert(this.prevFrame, 'Cannot create image before first frame')

    if (typeof sx !== 'number') {
      return Image.from(
        this.el,
        this.prevFrame.size.width,
        this.prevFrame.size.height,
      )
    }

    return Image.fromXYWH(
      this.el,
      sx,
      sy!,
      sw!,
      sh!
    )
  }
}
