import { HashMap } from '..'

describe('HashMap', () => {
  test('set', () => {
    const map = new HashMap<string, string, string>((lhs, rhs) => {
      return lhs === rhs
    })
    expect(map.get('foo', 'bar')).toBe(undefined)
    map.set('foo', 'bar', 'bar')
    map.set('foo', 'bax', 'bax')
    expect(map.get('foo', 'bar')).toBe('bar')
    expect([...map]).toEqual([['foo', 'bar', 'bar'], ['foo', 'bax', 'bax']])
  })

  test('delete', () => {
    const map = new HashMap<string, string, string>((lhs, rhs) => {
      return lhs === rhs
    })
    expect(map.delete('foo', 'bar')).toBe(false)
    map.set('foo', 'bar', 'bar')
    map.set('foo', 'bax', 'bax')
    expect(map.delete('foo', 'bar')).toBe(true)
    expect(map.get('foo', 'bar')).toBe(undefined)
    expect([...map]).toEqual([['foo', 'bax', 'bax']])
    expect(map.delete('foo', 'bax')).toBe(true)
    expect([...map]).toEqual([])
  })
})
