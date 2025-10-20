
export type CrossPlatformCanvasElement = HTMLCanvasElement

export type CrossPlatformOffscreenCanvas = OffscreenCanvas

export type CrossPlatformCanvasOrOffscreenCanvas = CrossPlatformCanvasElement | CrossPlatformOffscreenCanvas

export type FrameCallback = (ms: number) => void

/**
 * Interface for frame scheduling (requestAnimationFrame-like functionality).
 * Separates frame scheduling concerns from canvas creation.
 */
export interface IFrameScheduler {
  /**
   * Request that a frame be scheduled
   */
  scheduleFrame(): void

  /**
   * Register a callback to be invoked on each frame
   * @param callback Function to call on each frame with timestamp
   * @returns Cleanup function to unregister the callback
   */
  onFrame(callback: FrameCallback): () => void
}

/**
 * Interface for canvas creation and management.
 * Separates canvas lifecycle concerns from frame scheduling.
 */
export interface ICanvasFactory {
  createCanvas(width: number, height: number): CrossPlatformCanvasElement
  createOffscreenCanvas(width: number, height: number): CrossPlatformCanvasOrOffscreenCanvas
  createRenderingContext(width: number, height: number): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null
  resizeCanvas(
    el: CrossPlatformCanvasOrOffscreenCanvas,
    width: number, height: number
  ): void
  readonly supportOffscreenCanvas: boolean
}

/**
 * Combined platform adapter interface for backward compatibility.
 * Implements both frame scheduling and canvas creation.
 */
export interface IPlatformAdapter extends IFrameScheduler, ICanvasFactory {}
