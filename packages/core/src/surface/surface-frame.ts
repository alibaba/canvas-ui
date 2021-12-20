import assert from 'assert'
import type { Canvas } from '../canvas'
import type { Size } from '../math'

export class SurfaceFrame {

  private submitted = false

  constructor(

    /**
     * 通过这个 canvas 可以绘制到表面
     */
    readonly canvas: Canvas,

    /**
     * 帧的**像素**大小，与 DPR 无关
     */
    readonly size: Size,

    private readonly onSubmit: (canvas: Canvas) => void
  ) {

  }

  submit() {
    assert(!this.submitted)
    this.submitted = false
    this.onSubmit(this.canvas)
  }
}
