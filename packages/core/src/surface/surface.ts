import type { Image } from '../canvas'
import type { Size } from '../math'
import type { SurfaceFrame } from './surface-frame'

export interface Surface {
  toImage(): Image
  toImage(sx: number, sy: number, sw: number, sh: number): Image
  acquireFrame(size: Size): SurfaceFrame
}
