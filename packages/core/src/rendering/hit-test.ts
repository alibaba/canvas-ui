import assert from 'assert'
import { Matrix, Point } from '../math'
import type { RenderObject } from './render-object'

export type HitTestFunction = (result: HitTestResult, position: Point) => boolean

export class HitTestEntry {

  constructor(
    readonly target: RenderObject,
    readonly position: Point,
  ) { }

  _transform?: Matrix
}

interface TransformPart {
  multiply(rhs: Matrix): Matrix
}

class OffsetTransformPart implements TransformPart {

  constructor(
    readonly offset: Point
  ) { }

  multiply(rhs: Matrix): Matrix {
    return Matrix.leftTranslate(this.offset, rhs)
  }
}

// 暂时用不到
// class MatrixTransformPart implements TransformPart {

//   constructor(
//     readonly matrix: Matrix
//   ) { }

//   multiply(rhs: Matrix): Matrix {
//     return Matrix.mul(this.matrix, rhs)
//   }
// }

export class HitTestResult {
  readonly path: HitTestEntry[] = []
  private readonly _transforms: Matrix[] = [Matrix.identity]
  private readonly _localTransforms: TransformPart[] = []

  private globalizeTransforms() {
    if (this._localTransforms.length === 0) {
      return
    }
    let last = this._transforms[this._transforms.length - 1]
    for (const part of this._localTransforms) {
      last = part.multiply(last)
      this._transforms.push(last)
    }
    this._localTransforms.length = 0
  }

  private get lastTransform() {
    this.globalizeTransforms()
    assert(this._localTransforms.length === 0)
    return this._transforms[this._transforms.length - 1]
  }

  add(entry: HitTestEntry) {
    assert(!entry._transform)
    entry._transform = this.lastTransform
    this.path.push(entry)
  }

  private pushOffset(offset: Point) {
    this._localTransforms.push(new OffsetTransformPart(offset))
  }

  // 暂时用不到
  // private pushTransform(transform: Matrix) {
  //   this._localTransforms.push(new MatrixTransformPart(transform))
  // }

  private popTransform() {
    if (this._localTransforms.length > 0) {
      this._localTransforms.pop()
    }
    else {
      this._transforms.pop()
    }
    assert(this._transforms.length > 0)
  }

  addWithPaintOffset(
    offset: Point,
    position: Point,
    hitTest: HitTestFunction,
  ) {
    // 求出反向偏移
    const invOffset = Point.invert(offset)
    const transformedPosition = Point.add(position, invOffset)
    this.pushOffset(invOffset)
    const isHit = hitTest(this, transformedPosition)
    this.popTransform()
    return isHit
  }
}
