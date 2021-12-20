import { Matrix, MutableMatrix, Point, Rect } from '..'

describe('Matrix', () => {

  describe('mul', () => {
    test('with translate', () => {
      const a = Matrix.fromArray([
        1, 0, 10,
        0, 1, 0,
        0, 0, 1,
      ])
      const b = Matrix.fromArray([
        1, 0, 0,
        0, 1, 10,
        0, 0, 1,
      ])

      expect(Matrix.mul(a, b)).toEqual(Matrix.fromArray([
        1, 0, 10,
        0, 1, 10,
        0, 0, 1,
      ]))
    })

    test('mul', () => {
      const a = Matrix.fromArray([
        5, 10, 25,
        15, 20, 30,
        0, 0, 1,
      ])

      const b = Matrix.fromArray([
        2, 4, 10,
        6, 8, 12,
        0, 0, 1,
      ])
      const c = Matrix.mul(a, b)

      expect(c).toEqual(Matrix.fromArray([
        70, 100, 195,
        150, 220, 420,
        0, 0, 1,
      ]))
    })
  })

  test('fromTranslate', () => {
    const offset = Point.fromXY(1, 1)
    const m = Matrix.fromTranslate(offset.x, offset.y)
    expect(Matrix.getTranslate(m)).toEqual(offset)
  })

  test('static leftTranslate', () => {
    const p = Point.fromXY(0.5, 0)

    // 放大后再沿 x 方向平移
    const m1 = Matrix.fromScale(2, 2)
    const m11 = Matrix.leftTranslate(Point.fromXY(1, 0), m1)

    // scale: 0.5 -> 1.0
    // translate: 1.0 -> 2.0
    const p11 = Matrix.transformPoint(m11, p)
    expect(p11).toEqual(Point.fromXY(2, 0))

    //沿 x 方向平移后再放大
    const m2 = MutableMatrix.fromMatrix(Matrix.fromScale(2, 2))
    m2.translate(1, 0)

    // translate: 0.5 -> 1.5
    // scale: 1.5 -> 3.0
    const p22 = Matrix.transformPoint(m2, p)
    expect(p22).toEqual(Point.fromXY(3, 0))
  })

  test('transformRect', () => {
    const rect = Rect.fromLTWH(-1, -1, 2, 2)
    const scale2x = Matrix.fromScale(2, 2)
    expect(Matrix.transformRect(scale2x, rect)).toEqual(
      Rect.fromLTWH(-2, -2, 4, 4)
    )
    const scale2xTranslate1 = Matrix.leftTranslate(Point.fromXY(1, 0), scale2x)
    expect(Matrix.transformRect(scale2xTranslate1, rect)).toEqual(
      Rect.fromLTWH(-1, -2, 4, 4)
    )
    const inverseScale3x = Matrix.fromScale(-3, -3)
    expect(Matrix.transformRect(inverseScale3x, rect)).toEqual(
      Rect.fromLTWH(-3, -3, 6, 6)
    )
  })

})
