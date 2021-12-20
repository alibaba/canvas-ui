import { Matrix, Size } from '../math'
import type { Surface } from '../surface'
import { CompositorContext } from './compositor-context'
import type { LayerTree } from './layer-tree'


export type RasterizerOptions = {
  surface: Surface
}

export class Rasterizer {

  private readonly surface: Surface

  private readonly context = new CompositorContext({ surfaceTransform: Matrix.identity })

  constructor(
    {
      surface,
    }: RasterizerOptions
  ) {
    this.surface = surface
  }

  draw(
    layerTree: LayerTree,
    frameSize: Size,
  ) {
    const surfaceFrame = this.surface.acquireFrame(frameSize)
    const compositeFrame = this.context.acquireFrame(surfaceFrame.canvas)
    compositeFrame.beforeFrame()
    compositeFrame.raster(layerTree)
    compositeFrame.endFrame()
    surfaceFrame.submit()
  }
}

