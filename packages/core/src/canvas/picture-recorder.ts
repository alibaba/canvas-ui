import { assert } from '@canvas-ui/assert'
import { Rect } from '../math'
import type { Canvas } from './canvas'
import { Picture } from './picture'
import { RecorderCanvas } from './recorder-canvas'

export class PictureRecoder {

  private canvas?: RecorderCanvas

  private cullRect?: Rect

  begin(cullRect: Rect = Rect.zero): Canvas {
    assert(!this.canvas)
    this.cullRect = cullRect
    this.canvas = new RecorderCanvas()
    return this.canvas
  }

  end() {
    assert(this.canvas)
    assert(this.cullRect)
    const {
      clipBoundses,
      drawBoundses,
      drawOps,
      hasDrawText,
    } = this.canvas

    // 如果没有提供 cullRect
    // 我们通过 boundses 计算可以容纳所有元素的 cullRect
    if (Rect.isEmpty(this.cullRect)) {
      let totalPaintBounds = drawBoundses.length > 0 ? drawBoundses[0] : Rect.zero
      let totalClipBounds = clipBoundses.length > 0 ? clipBoundses[0] : Rect.zero
      let i = 1
      let n = drawBoundses.length
      for (i = 1; i < n; i++) {
        totalPaintBounds = Rect.expandToInclude(totalPaintBounds, drawBoundses[i])
      }

      n = clipBoundses.length
      for (i = 1; i < n; i++) {
        totalClipBounds = Rect.expandToInclude(totalClipBounds, clipBoundses[i])
      }

      if (Rect.isEmpty(totalClipBounds)) {
        this.cullRect = totalPaintBounds
      } else if (Rect.overlaps(totalPaintBounds, totalClipBounds)) {
        this.cullRect = Rect.intersect(totalPaintBounds, totalClipBounds)
      } else {
        this.cullRect = Rect.zero
      }
    }

    return Picture.from(
      drawOps,
      this.cullRect,
      hasDrawText,
    )
  }

}
