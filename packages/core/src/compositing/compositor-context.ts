import type { Canvas } from '../canvas'
import type { Matrix } from '../math'
import { LayerTree } from './layer-tree'
import { RasterCache } from './raster-cache'

type CompositorContextOptions = {
  surfaceTransform: Matrix
}

export class CompositorContext {

  private readonly rasterCache = new RasterCache()

  private readonly surfaceTransform: Matrix

  constructor({
    surfaceTransform,
  }: CompositorContextOptions) {
    this.surfaceTransform = surfaceTransform
  }

  acquireFrame(canvas: Canvas) {
    return new CompositorFrame(
      canvas,
      this.rasterCache,
      this.surfaceTransform,
    )
  }
}

export class CompositorFrame {
  constructor(
    readonly canvas: Canvas,
    readonly rasterCache: RasterCache,
    readonly surfaceTransform: Matrix,
  ) {
  }

  raster(layerTree: LayerTree) {
    layerTree.preroll(this)
    layerTree.paint(this)
  }

  beforeFrame () {
    this.canvas.clear()
    this.rasterCache.prepareBeforeFrame()
  }

  endFrame() {
    this.rasterCache.sweepAfterFrame()
  }
}
