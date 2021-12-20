import { NonConstructiable } from '../foundation'
import { Rect } from './rect'
import { Size } from './size'

export interface Point {
  readonly x: number
  readonly y: number
}

export class Point extends NonConstructiable {

  static clone(p: Point): Point {
    return {
      x: p.x,
      y: p.y,
    }
  }

  static fromXY(x: number, y: number): Point {
    return {
      x,
      y,
    }
  }

  static fromRect(rect: Rect): Point {
    return {
      x: rect.left,
      y: rect.top,
    }
  }

  static fromSize(size: Size): Point {
    return {
      x: size.width,
      y: size.height,
    }
  }

  static readonly zero = Point.fromXY(0, 0)

  static isZero(point: Point): boolean {
    return point === Point.zero
      || (point.x === 0 && point.y === 0)
  }

  static eq(lhs: Point, rhs: Point): boolean {
    return lhs.x === rhs.x && lhs.y === rhs.y
  }

  static add(lhs: Point, rhs: Point): Point {
    return {
      x: lhs.x + rhs.x,
      y: lhs.y + rhs.y,
    }
  }

  /**
   * 三个 Point 累加
   */
  static add3(p1: Point, p2: Point, p3: Point): Point {
    return {
      x: p1.x + p2.x + p3.x,
      y: p1.y + p2.y + p3.y,
    }
  }

  static invert(p: Point): Point {
    return {
      x: -p.x,
      y: -p.y,
    }
  }

}
