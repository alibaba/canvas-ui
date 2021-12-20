import { NonConstructiable } from '../foundation'
import type { Point } from './point'
import type { Size } from './size'

export interface Rect extends Size {
  readonly left: number
  readonly right: number
  readonly top: number
  readonly bottom: number
}

export class Rect extends NonConstructiable {

  static fromLTWH(
    left: number,
    top: number,
    width: number,
    height: number
  ): Rect {

    const right = width + left
    const bottom = height + top

    return {
      left,
      right,
      top,
      bottom,
      width,
      height,
    }
  }

  static fromLTRB(left: number, top: number, right: number, bottom: number): Rect {
    return {
      left,
      right,
      top,
      bottom,
      width: right - left,
      height: bottom - top,
    }
  }

  static roundOut(rect: Rect): Rect {
    return Rect.fromLTRB(
      Math.floor(rect.left),
      Math.floor(rect.top),
      Math.ceil(rect.right),
      Math.ceil(rect.bottom),
    )
  }

  static fromSize(size: Size): Rect {
    return Rect.fromLTWH(0, 0, size.width, size.height)
  }

  static fromOffsetAndSize(offset: Point, size: Size): Rect {
    return Rect.fromLTWH(
      offset.x,
      offset.y,
      size.width,
      size.height,
    )
  }

  static expandToInclude(lhs: Rect, rhs: Rect): Rect {
    return Rect.fromLTRB(
      Math.min(lhs.left, rhs.left),
      Math.min(lhs.top, rhs.top),
      Math.max(lhs.right, rhs.right),
      Math.max(lhs.bottom, rhs.bottom),
    )
  }

  static inflate(lhs: Rect, size: Size) {
    return Rect.fromLTRB(
      lhs.left - size.width,
      lhs.top - size.height,
      lhs.right + size.width,
      lhs.bottom + size.height,
    )
  }

  static isEmpty(rect: Rect): boolean {
    return rect === Rect.zero
      || rect.left >= rect.right
      || rect.top >= rect.bottom
  }

  static shift(rect: Rect, offset: Point) {
    return Rect.fromLTRB(
      rect.left + offset.x,
      rect.top + offset.y,
      rect.right + offset.x,
      rect.bottom + offset.y
    )
  }

  static eq(lhs: Rect, rhs: Rect) {
    return lhs.left === rhs.left
      && lhs.top === rhs.top
      && lhs.right === rhs.right
      && lhs.bottom === rhs.bottom
  }

  static clone({
    left,
    top,
    right,
    bottom,
    width,
    height,
  }: Rect) {
    return {
      left,
      top,
      right,
      bottom,
      width,
      height,
    }
  }

  static overlaps(lhs: Rect, rhs: Rect) {
    if (lhs.right <= rhs.left || rhs.right <= lhs.left) {
      return false
    }
    if (lhs.bottom <= rhs.top || rhs.bottom <= lhs.top) {
      return false
    }
    return true
  }

  static intersect(lhs: Rect, rhs: Rect) {
    return Rect.fromLTRB(
      Math.max(lhs.left, rhs.left),
      Math.max(lhs.top, rhs.top),
      Math.min(lhs.right, rhs.right),
      Math.min(lhs.bottom, rhs.bottom),
    )
  }

  static contains(lhs: Rect, offset: Point): boolean {
    return offset.x >= lhs.left && offset.x <= lhs.right && offset.y >= lhs.top && offset.y <= lhs.bottom
  }

  static readonly zero = Rect.fromLTWH(0, 0, 0, 0)

}
