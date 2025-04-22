
export type CrossPlatformCanvasElement = HTMLCanvasElement

export type CrossPlatformOffscreenCanvas = OffscreenCanvas

export type CrossPlatformCanvasOrOffscreenCanvas = CrossPlatformCanvasElement | CrossPlatformOffscreenCanvas

export type FrameCallback = (ms: number) => void

export interface IPlatformAdapter {
  scheduleFrame(): void
  onFrame(callback: FrameCallback): () => void
  createCanvas(width: number, height: number): CrossPlatformCanvasElement
  createOffscreenCanvas(width: number, height: number): CrossPlatformCanvasOrOffscreenCanvas
  createRenderingContext(width: number, height: number): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null
  resizeCanvas(
    el: CrossPlatformCanvasOrOffscreenCanvas,
    width: number, height: number
  ): void
  readonly supportOffscreenCanvas: boolean
}
