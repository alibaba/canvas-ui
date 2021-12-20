import { Point } from '..'

describe('Point', () => {
  test('fromXY', () => {
    const a = Point.fromXY(100, 200)
    expect(a).toEqual({ x: 100, y: 200 })
  })

  test('zero', () => {
    const a = Point.zero
    expect(a).toEqual({ x: 0, y: 0 })
  })

  test('isZero', () => {
    const a = Point.fromXY(0, 0)
    expect(Point.isZero(a)).toBe(true)
  })

  test('add', () => {
    const a = Point.fromXY(1, 2)
    const b = Point.fromXY(3, 4)
    expect(Point.add(a, b)).toEqual(Point.fromXY(4, 6))
  })
})
