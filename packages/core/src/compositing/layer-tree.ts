import { CompositorFrame } from './compositor-context'
import { ContainerLayer, PaintContext, PrerollContext } from './layer'

export type LayerTreeOptions = {
  rootLayer: ContainerLayer
}


export class LayerTree {

  readonly rootLayer: ContainerLayer

  constructor({
    rootLayer,
  }: LayerTreeOptions) {
    this.rootLayer = rootLayer
  }

  preroll(frame: CompositorFrame) {
    const context = new PrerollContext(frame.rasterCache)
    this.rootLayer.preroll(context, frame.surfaceTransform)
  }

  paint(frame: CompositorFrame) {
    const context = new PaintContext(
      frame.canvas,
      frame.rasterCache,
    )
    if (this.rootLayer.needsPainting) {
      this.rootLayer.paint(context)
    }
  }
}
