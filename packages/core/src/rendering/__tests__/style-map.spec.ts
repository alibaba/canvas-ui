import { StyleMap } from '../style-map'
import { hasOwn } from '../../utils'

describe('StyleMap', () => {

  test('可以设置和获取', () => {
    const style = new StyleMap()
    style.position = 'absolute'
    expect(style.position).toBe('absolute')
  })

  test('能够广播', () => {
    const style = new StyleMap()
    const callback = jest.fn()
    style.on('position', callback)
    style.position = 'absolute'
    expect(callback).toHaveBeenCalledWith('absolute')
  })

  test('如果值相等，则不广播', () => {
    const style = new StyleMap()
    const callback = jest.fn()
    style.on('position', callback)
    style.position = 'absolute'
    style.position = 'absolute'
    expect(callback).toBeCalledTimes(1)
  })

  test('可以 delete，并能够广播', () => {
    const style = new StyleMap()
    const callback = jest.fn()
    style.on('position', callback)
    style.position = 'absolute'
    delete style.position
    expect(style.position).toBeUndefined()
    expect(callback).toHaveBeenNthCalledWith(2, undefined)
  })

  test('可以设置 undefined', () => {
    const style = new StyleMap()
    const callback = jest.fn()
    style.on('position', callback)
    style.position = 'absolute'
    style.position = undefined
    expect(style.position).toBeUndefined()
    expect(callback).toHaveBeenNthCalledWith(2, undefined)
  })

  test('可以枚举', () => {
    const style = new StyleMap()
    style.position = 'absolute'
    const keys = Object.keys(style)
    expect(keys).toEqual(['position'])
  })

  test('可以 hasOwn', () => {
    const style = new StyleMap()
    expect(hasOwn(style, 'position')).toBe(false)
    style.position = 'absolute'
    expect(hasOwn(style, 'position')).toBe(true)
  })
})
