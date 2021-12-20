import { NonConstructiable } from '../foundation'
import { Point } from './point'

export interface Size {
  readonly width: number
  readonly height: number
}

export class Size extends NonConstructiable {
  static max(lhs: Size, rhs: Size): Size {
    return Size.fromWH(
      Math.max(lhs.width, rhs.width),
      Math.max(lhs.height, rhs.height),
    )
  }

  static zero = Size.fromWH(0, 0)

  static fromWH(width: number, height: number): Size {
    return {
      width,
      height,
    }
  }

  static add(size: Size, acc: Point): Size {
    return {
      width: size.width + acc.x,
      height: size.height + acc.y,
    }
  }

  static eq(lhs: Size, rhs: Size): boolean {
    return lhs.width === rhs.width && lhs.height === rhs.height
  }

  static isZero(size: Size): boolean {
    return Size.eq(size, Size.zero)
  }

  static clone({ width, height }: Size): Size {
    return Size.fromWH(width, height)
  }

  static contains(size: Size, offset: Point): boolean {
    return offset.x >= 0 && offset.x <= size.width && offset.y >= 0 && offset.y <= size.height
  }

  static scale(size: Size, scale: number): Size {
    return Size.fromWH(size.width * scale, size.height * scale)
  }

}
