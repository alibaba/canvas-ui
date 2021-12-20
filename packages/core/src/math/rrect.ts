import { NonConstructiable } from '../foundation'
import type { Point } from './point'
import type { Rect } from './rect'

export interface RRect extends Rect {
  readonly radiusX: number
  readonly radiusY: number
}

export class RRect extends NonConstructiable {

  static eq(lhs: RRect, rhs: RRect) {
    return lhs.left === rhs.left
      && lhs.top === rhs.top
      && lhs.right === rhs.right
      && lhs.bottom === rhs.bottom
      && lhs.radiusX === rhs.radiusX
      && lhs.radiusY === rhs.radiusY
  }

  static readonly zero = RRect.fromLTWHXY(0, 0, 0, 0, 0, 0)

  static shift(lhs: RRect, offset: Point) {
    return RRect.fromLTWHXY(
      lhs.left + offset.x,
      lhs.top + offset.y,
      lhs.width,
      lhs.height,
      lhs.radiusX,
      lhs.radiusY,
    )
  }

  static fromLTWH(
    left: number,
    top: number,
    width: number,
    height: number,
  ): RRect {
    return RRect.fromLTWHXY(left, top, width, height, 0, 0)
  }

  static fromLTWHXY(
    left: number,
    top: number,
    width: number,
    height: number,
    radiusX: number,
    radiusY: number,
  ): RRect {

    const right = width + left
    const bottom = height + top

    return {
      left,
      right,
      top,
      bottom,
      width,
      height,
      radiusX,
      radiusY,
    }
  }
}
