import { NonConstructiable } from '../foundation'
import { Point } from './point'
import { Rect } from './rect'

export interface Circle extends Point {
  radius: number
}

export class Circle extends NonConstructiable {
  static fromXYR(x: number, y: number, radius: number): Circle {
    return {
      x,
      y,
      radius,
    }
  }

  static getBounds(circle: Circle): Rect {
    return Rect.fromLTWH(circle.x - circle.radius, circle.y - circle.radius, circle.radius * 2, circle.radius * 2)
  }
}
