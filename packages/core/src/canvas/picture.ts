import type { Canvas } from '../canvas'
import { Log } from '../foundation'
import { NonConstructiable } from '../foundation/non-constructible'
import { Rect } from '../math'

export type PictureVersion = '1.0.0'

export type DrawOpName = keyof Canvas

export type DrawOp = {
  name: DrawOpName
  args?: any[]
}

export interface Picture {
  readonly id: number
  readonly version: PictureVersion
  readonly drawOps: DrawOp[]
  readonly cullRect: Rect
  readonly hasDrawText: boolean
}

export class Picture extends NonConstructiable {

  private static nextId = 0

  static from(
    drawOps: DrawOp[],
    cullRect: Rect,
    hasDrawText: boolean,
  ): Picture {
    return {
      id: Picture.nextId++,
      version: '1.0.0',
      drawOps,
      cullRect,
      hasDrawText,
    }
  }

  static playback(picture: Picture, canvas: Canvas): void {
    Picture.draw(
      picture.drawOps,
      canvas,
    )
  }

  @Log({ disabled: true })
  private static draw(ops: DrawOp[], canvas: Canvas) {
    for (const { name, args } of ops) {
      const fn = canvas[name] as (...args: any[]) => void
      if (args) {
        // eslint-disable-next-line prefer-spread
        fn.apply(canvas, args)
      } else {
        fn.apply(canvas)
      }
    }
  }
}
