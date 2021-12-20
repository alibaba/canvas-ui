import { Mut, NonConstructiable } from '../foundation'
import { Point } from './point'
import { Rect } from './rect'

const enum M {
  scaleX,
  skewX,
  transX,
  skewY,
  scaleY,
  transY,
  persp0,
  persp1,
  persp2,
}

/**
 * 标准 3×3，row-major order
 * 
 * | scale-x  skew-x   trans-x |
 * | skew-y   scale-y  trans-y |
 * | persp-0  persp-1  persp-2 |
 * 
 */
export interface Matrix {
  readonly values: Readonly<Float32Array>
}

export class Matrix extends NonConstructiable {

  static readonly identity = Matrix.fromArray([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  ])

  static eq({ values: lValues }: Matrix, { values: rValues }: Matrix) {
    return lValues[0] === rValues[0]
      && lValues[1] === rValues[1]
      && lValues[2] === rValues[2]
      && lValues[3] === rValues[3]
      && lValues[4] === rValues[4]
      && lValues[5] === rValues[5]
      && lValues[6] === rValues[6]
      && lValues[7] === rValues[7]
      && lValues[8] === rValues[8]
  }

  static fromArray(
    array: [
      number, number, number,
      number, number, number,
      number, number, number,
    ]
  ): Matrix {
    return {
      values: new Float32Array(array)
    }
  }

  static fromTranslate(tx: number, ty: number): Matrix {
    return Matrix.fromArray([
      1, 0, tx,
      0, 1, ty,
      0, 0, 1,
    ])
  }

  static fromScale(sx: number, sy = sx): Matrix {
    return Matrix.fromArray([
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1,
    ])
  }

  static fromScaleTranslate(sx: number, sy: number, tx: number, ty: number): Matrix {
    return Matrix.fromArray([
      sx, 0, tx - sx * tx,
      0, sy, ty - sy * ty,
      0, 0, 1,
    ])
  }

  static fromRotation(rad: number, tx: number, ty: number): Matrix {
    const sin = Math.sin(rad)
    const cos = Math.cos(rad)
    const oneMinusCos = 1 - cos
    const R = Matrix.fromArray([
      cos, -sin, sin * ty + oneMinusCos * tx,
      sin, cos, -sin * tx + oneMinusCos * ty,
      0, 0, 1
    ])
    return R
  }

  static clone(m: Matrix): Matrix {
    return {
      values: new Float32Array(m.values)
    }
  }

  /**
   * 矩阵乘法
   * 
   *            | A B C |   | J K L |   | AJ+BM+CP AK+BN+CQ AL+BO+CR |
   *    a * b = | D E F | * | M N O | = | DJ+EM+FP DK+EN+FQ DL+EO+FR |
   *            | G H I |   | P Q R |   | GJ+HM+IP GK+HN+IQ GL+HO+IR |
   */
  static mul(lhs: Matrix, rhs: Matrix): Matrix {

    const { values: l } = lhs
    const { values: r } = rhs

    return Matrix.fromArray([

      l[M.scaleX] * r[M.scaleX] + l[M.skewX] * r[M.skewY] /* + 透视 */,
      l[M.scaleX] * r[M.skewX] + l[M.skewX] * r[M.scaleY] /* + 透视 */,
      l[M.scaleX] * r[M.transX] + l[M.skewX] * r[M.transY] + l[M.transX] /* *persp2 (总是为 1 故省略) */,

      l[M.skewY] * r[M.scaleX] + l[M.scaleY] * r[M.skewY] /* + 透视 */,
      l[M.skewY] * r[M.skewX] + l[M.scaleY] * r[M.scaleY] /* + 透视 */,
      l[M.skewY] * r[M.transX] + l[M.scaleY] * r[M.transY] + l[M.transY] /* *persp2 (总是为 1 故省略) */,

      0, 0, 1,
    ])
  }

  static getTranslate(m: Matrix): Point {
    return Point.fromXY(
      m.values[M.transX],
      m.values[M.transY],
    )
  }

  static leftTranslate(offset: Point, rhs: Matrix) {
    // todo(haocong): 使用更高效的方法实现左乘
    return Matrix.mul(Matrix.fromTranslate(offset.x, offset.y), rhs)
  }

  static setTranslate(matrix: Matrix, tx: number, ty: number): Matrix {
    const values = new Float32Array(matrix.values)
    values[M.transX] = tx
    values[M.transY] = ty
    return {
      values
    }
  }

  static transformPoint({ values }: Matrix, { x, y }: Point): Point {
    // todo(haocong): 实现透视
    const rx = values[M.scaleX] * x + values[M.skewX] * y + values[M.transX]
    const ry = values[M.skewY] * x + values[M.scaleY] * y + values[M.transY]
    return Point.fromXY(rx, ry)
  }

  static inverseTransformPoint({ values }: Matrix, { x, y }: Point): Point {
    // todo(haocong): 实现透视
    const scaleX = values[M.scaleX]
    const skewX = values[M.skewX]
    const transX = values[M.transX]
    const skewY = values[M.skewY]
    const scaleY = values[M.scaleY]
    const transY = values[M.transY]

    const invDet = 1 / ((scaleX * scaleY) - (skewX * skewY))

    const rx = (scaleY * invDet * x) + (-skewX * invDet * y) + (((transY * skewX) - (transX * scaleY)) * invDet)
    const ry = (scaleX * invDet * y) + (-skewY * invDet * x) + (((-transY * scaleX) + (transX * skewY)) * invDet)

    return Point.fromXY(rx, ry)
  }

  static transformRect(
    matrix: Matrix,
    { left, top, right, bottom }: Rect,
  ) {
    const topLeft = Matrix.transformPoint(matrix, Point.fromXY(left, top))
    const topRight = Matrix.transformPoint(matrix, Point.fromXY(right, top))
    const bottomLeft = Matrix.transformPoint(matrix, Point.fromXY(left, bottom))
    const bottomRight = Matrix.transformPoint(matrix, Point.fromXY(right, bottom))

    return Rect.roundOut(
      Rect.fromLTRB(
        Math.min(Math.min(Math.min(topLeft.x, topRight.x), bottomLeft.x), bottomRight.x),
        Math.min(Math.min(Math.min(topLeft.y, topRight.y), bottomLeft.y), bottomRight.y),
        Math.max(Math.max(Math.max(topLeft.x, topRight.x), bottomLeft.x), bottomRight.x),
        Math.max(Math.max(Math.max(topLeft.y, topRight.y), bottomLeft.y), bottomRight.y)
      )
    )
  }

}

export class MutableMatrix implements Mut<Matrix> {

  private constructor(
    readonly values: Float32Array
  ) { }

  static fromMatrix(matrix: Matrix) {
    return new MutableMatrix(new Float32Array(matrix.values))
  }

  static fromIdentity() {
    return new MutableMatrix(new Float32Array(Matrix.identity.values))
  }

  translate(tx: number, ty: number) {
    // todo(haocong): 支持基于透视的 translate
    const rx = this.values[M.scaleX] * tx + this.values[M.skewX] * ty + this.values[M.transX]
    const ry = this.values[M.skewY] * tx + this.values[M.scaleY] * ty + this.values[M.transY]

    this.values[M.transX] = rx
    this.values[M.transY] = ry
  }

  mul({ values: r }: Matrix) {
    // todo(haocong): 支持基于透视的 translate
    const l = this.values

    const scaleX = l[M.scaleX] * r[M.scaleX] + l[M.skewX] * r[M.skewY] /* + 透视 */
    const skewX = l[M.scaleX] * r[M.skewX] + l[M.skewX] * r[M.scaleY] /* + 透视 */
    const transX = l[M.scaleX] * r[M.transX] + l[M.skewX] * r[M.transY] + l[M.transX] /* *persp2 (总是为 1 故省略) */
    const skewY = l[M.skewY] * r[M.scaleX] + l[M.scaleY] * r[M.skewY] /* + 透视 */
    const scaleY = l[M.skewY] * r[M.skewX] + l[M.scaleY] * r[M.scaleY] /* + 透视 */
    const transY = l[M.skewY] * r[M.transX] + l[M.scaleY] * r[M.transY] + l[M.transY] /* *persp2 (总是为 1 故省略) */

    l[M.scaleX] = scaleX
    l[M.skewX] = skewX
    l[M.transX] = transX
    l[M.skewY] = skewY
    l[M.scaleY] = scaleY
    l[M.transY] = transY
  }
}
