import { Rect } from '..'

describe('Rect.fromLTWH', () => {
  test('empty', () => {
    expect(Rect.fromLTWH(0, 0, 0, 0)).toEqual({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      height: 0,
      width: 0,
    })
  })

  test('width > 0', () => {
    expect(Rect.fromLTWH(0, 0, 10, 0)).toEqual({
      left: 0,
      right: 10,
      top: 0,
      bottom: 0,
      height: 0,
      width: 10,
    })
  })

  test('height > 0', () => {
    expect(Rect.fromLTWH(0, 0, 0, 10)).toEqual({
      left: 0,
      right: 0,
      top: 0,
      bottom: 10,
      height: 10,
      width: 0,
    })
  })

  test('roundOut', () => {
    expect(Rect.roundOut(Rect.fromLTRB(0.1, 0.1, 1.1, 1.1))).toEqual(
      Rect.fromLTRB(0, 0, 2, 2)
    )
  })

})
