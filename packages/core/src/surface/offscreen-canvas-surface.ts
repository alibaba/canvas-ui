import { assert } from '@canvas-ui/assert'
import { Canvas, Canvas2DCanvas, Image } from '../canvas'
import { Size } from '../math'
import { CrossPlatformCanvasElement, CrossPlatformOffscreenCanvas, PlatformAdapter } from '../platform'
import { Surface } from './surface'
import { SurfaceFrame } from './surface-frame'

export class OffscreenCanvasSurface implements Surface {

  private _canvas?: Canvas

  private _context?: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D

  private el?: CrossPlatformOffscreenCanvas | CrossPlatformCanvasElement

  private prevFrame?: SurfaceFrame

  acquireFrame(size: Size): SurfaceFrame {

    this.createOrUpdateEl(size)

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

  private createOrUpdateEl(size: Size) {
    if (!this.el) {
      this.el = PlatformAdapter.supportOffscreenCanvas
        ? PlatformAdapter.createOffscreenCanvas(size.width, size.height)
        : PlatformAdapter.createCanvas(size.width, size.height)

    } else {
      const shouldResizeCanvas =
        !this.prevFrame
        || !Size.eq(this.prevFrame.size, size)

      if (shouldResizeCanvas) {
        this.el.width = size.width
        this.el.height = size.height
      }
    }

  }

  get context() {
    if (!this._context) {
      assert(this.el)
      const context = this.el.getContext('2d')
      assert(context)
      this._context = context as OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D
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
    assert(this.el)
    assert(this.prevFrame)

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
