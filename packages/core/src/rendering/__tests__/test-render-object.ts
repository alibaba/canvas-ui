import type { Point } from '../../math'
import type { PaintingContext } from '../painting-context'
import { RenderObject } from '..'

export class TestRenderObject extends RenderObject {


  constructor(
    readonly onVisitChildren?: () => void,
    readonly onRedepthChildren?: () => void,
  ) {
    super()
  }

  visitChildren(): void {
    this.onVisitChildren?.()
  }

  protected redepthChildren(): void {
    this.onRedepthChildren?.()
  }

  override hitTestSelf() {
    return true
  }

  paint(_context: PaintingContext, _offset: Point) {
  }

}
