// eslint-disable: no-empty
import { expectType } from 'ts-expect'
import { assert } from '../assert'
import { AssertionError } from '../assertion-error'

describe('assert', () => {
  test('asserts true', () => {
    assert(true)
  })

  test('asserts falsy', () => {
    expect(() => {
      assert(false)
    }).toThrowError(Error)
  })

  test('asserts iife without error', () => {
    assert(() => {
      // noop
    })
  })

  test('asserts iife with error', () => {
    expect(() => {
      assert(() => {
        assert(false)
      })
    }).toThrowError(Error)
  })

  test('should asserts type', () => {
    let foo: string | undefined
    try {
      assert(foo)
      expectType<string>(foo)
    } catch {
      //
    }
  })

  test('asserts with custom message', () => {
    expect(() => {
      assert(false, 'custom message')
    }).toThrowError(new AssertionError({ message: 'custom message', actual: false }))
  })
})
