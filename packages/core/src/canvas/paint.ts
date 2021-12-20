import { NonConstructiable } from '../foundation'
import type { Shader } from './shader'

export enum PaintStyle {
  fill,
  stroke,
}

export interface Paint {
  readonly style?: number
  readonly color?: string
  readonly strokeWidth?: number
  readonly font?: string
  readonly shadowColor?: string
  readonly shadowOffsetX?: number
  readonly shadowOffsetY?: number
  readonly shadowBlur?: number
  readonly shader?: Shader
}

export class Paint extends NonConstructiable {
  static isStroke(paint: Paint) {
    return paint.style === PaintStyle.stroke
  }
}
