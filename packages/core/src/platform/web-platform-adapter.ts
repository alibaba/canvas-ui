import assert from 'assert'
import { Log } from '../foundation'
import type {
  CrossPlatformCanvasOrOffscreenCanvas,
  CrossPlatformCanvasElement,
  CrossPlatformOffscreenCanvas,
  FrameCallback,
  IPlatformAdapter
} from './types'

export class WebPlatformAdapter implements IPlatformAdapter {

  private static _instance?: IPlatformAdapter
  static get instance() {
    return WebPlatformAdapter._instance ??= new WebPlatformAdapter()
  }

  private rafId = -1

  @Log({ disabled: true })
  scheduleFrame(): void {
    if (this.onFrameCallbacks.length > 0 && this.rafId === -1) {
      this.rafId = self.requestAnimationFrame(this.frameRequestCallback)
      return true as any // for logger
    }
    return false as any // for logger
  }

  private frameRequestCallback = (ms: number) => {
    this.rafId = -1
    this.onFrameCallbacks.forEach(it => it(ms))
  }

  private onFrameCallbacks: FrameCallback[] = []

  onFrame(callback: FrameCallback): () => void {
    assert(this.onFrameCallbacks.indexOf(callback) === -1, '重复添加了 callback')
    this.onFrameCallbacks.push(callback)
    return () => {
      this.onFrameCallbacks = this.onFrameCallbacks.filter(it => it !== callback)
    }
  }

  createCanvas(width: number, height: number): CrossPlatformCanvasElement {
    const el = document.createElement('canvas')
    this.resizeCanvas(el, width, height)
    return el
  }

  createOffscreenCanvas(width: number, height: number): CrossPlatformOffscreenCanvas {
    return new OffscreenCanvas(Math.round(width), Math.round(height))
  }

  resizeCanvas(el: CrossPlatformCanvasOrOffscreenCanvas, width: number, height: number): void {
    el.width = width
    el.height = height
  }

  readonly supportOffscreenCanvas = typeof OffscreenCanvas !== 'undefined'
}
