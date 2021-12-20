import { Size, Point } from '..'

describe('Size', () => {
  test('fromWH', () => {
    const a = Size.fromWH(100, 200)
    expect(a).toEqual({
      width: 100,
      height: 200,
    })
  })

  test('eq', () => {
    const a = Size.fromWH(100, 200)
    const b = Size.fromWH(100, 200)
    expect(Size.eq(a, b)).toBe(true)
  })

  test('clone', () => {
    const a = Size.fromWH(100, 200)
    const a_ = Size.clone(a)
    expect(a_).toEqual(a)
  })

  test('contains', () => {
    const a = Size.fromWH(100, 200)
    expect(Size.contains(a, Point.fromXY(0, 0))).toBe(true)
    expect(Size.contains(a, Point.fromXY(-1, -1))).toBe(false)
    expect(Size.contains(a, Point.fromXY(100, 200))).toBe(true)
    expect(Size.contains(a, Point.fromXY(101, 201))).toBe(false)
  })
})
