import { NonConstructiable } from '../foundation'
import { CanvasSurface, CanvasSurfaceOptions } from './canvas-surface'
import { OffscreenCanvasSurface } from './offscreen-canvas-surface'
import { Surface as ISurface } from './surface'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Surface extends ISurface {

}

export class Surface extends NonConstructiable {
  static makeCanvasSurface(options?: CanvasSurfaceOptions): Surface {
    return new CanvasSurface(options)
  }

  static makeOffscreenCanvasSurface(): Surface {
    return new OffscreenCanvasSurface()
  }
}
