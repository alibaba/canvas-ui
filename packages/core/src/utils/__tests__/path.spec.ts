import { Rect } from '../../math'
import { Directive, Path } from '../path'

const path = 'M 2 5 l 2 -2 L 4 4 h 3 H 9 C 8 3 10 3 10 3 c 1 -1 2 0 1 1 S 8 5 9 7 v 1 s 2 -1 1 2 Q 9 10 10 11 T 12 11 t -1 -1 v 2 T 10 12 S 9 12 7 11 c 0 -1 0 -1 -2 -2 z m 0 2 l 1 0 l 0 1 l -1 0 z M 1 1 a 1 1 30 1 0 2 2 A 2 2 30 1 0 6 6'
const expectedParse: Directive[] = [['M', 2, 5], ['l', 2, -2], ['L', 4, 4], ['h', 3], ['H', 9], ['C', 8, 3, 10, 3, 10, 3], ['c', 1, -1, 2, 0, 1, 1], ['S', 8, 5, 9, 7], ['v', 1], ['s', 2, -1, 1, 2], ['Q', 9, 10, 10, 11], ['T', 12, 11], ['t', -1, -1], ['v', 2], ['T', 10, 12], ['S', 9, 12, 7, 11], ['c', 0, -1, 0, -1, -2, -2], ['z'], ['m', 0, 2], ['l', 1, 0], ['l', 0, 1], ['l', -1, 0], ['z'], ['M', 1, 1], ['a', 1, 1, 30, 1, 0, 2, 2], ['A', 2, 2, 30, 1, 0, 6, 6]]
const expectedSimplified = [['M', 2, 5], ['L', 4, 3], ['L', 4, 4], ['L', 7, 4], ['L', 9, 4], ['C', 8, 3, 10, 3, 10, 3], ['C', 11, 2, 12, 3, 11, 4], ['C', 10, 5, 8, 5, 9, 7], ['L', 9, 8], ['C', 9, 8, 11, 7, 10, 10], ['Q', 9, 10, 10, 11], ['Q', 11, 12, 12, 11], ['Q', 13, 10, 11, 10], ['L', 11, 12], ['Q', 11, 12, 10, 12], ['C', 10, 12, 9, 12, 7, 11], ['C', 7, 10, 7, 10, 5, 9], ['z'], ['M', 2, 7], ['L', 3, 7], ['L', 3, 8], ['L', 2, 8], ['z'], ['M', 1, 1], [
  'C',
  0.44771525016920655,
  1.5522847498307935,
  0.44771525016920655,
  2.4477152501692068,
  1,
  3
],
[
  'C',
  1.5522847498307935,
  3.5522847498307932,
  2.4477152501692068,
  3.5522847498307932,
  3,
  3
],
[
  'C',
  2.1715728752538106,
  3.8284271247461903,
  2.1715728752538106,
  5.17157287525381,
  3.0000000000000004,
  6
],
[
  'C',
  3.8284271247461903,
  6.82842712474619,
  5.17157287525381,
  6.82842712474619,
  6,
  6
]]

describe('Path', () => {
  test('parse', () => {
    const parsed = Path.parse(path)
    parsed.forEach(function (command, index) {
      expect(command).toEqual(expectedParse[index])
    })
  })

  test('simplify', () => {
    const simplified = Path.simplify(expectedParse)
    simplified.forEach(function (command, index) {
      expect(command).toEqual(expectedSimplified[index])
    })
  })

  test('calculateBounds', () => {
    const path: Directive[] = [['M', 100, 100], ['L', 300, 100], ['L', 200, 300], ['z']]
    const bounds = Path.calculateBounds(path)
    expect(bounds).toEqual(Rect.fromLTWH(100, 100, 200, 200))
  })
})
