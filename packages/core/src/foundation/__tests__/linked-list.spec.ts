import { LinkedList } from '..'

describe('LinkedList', () => {
  test('empty', () => {
    expect(new LinkedList().length).toBe(0)
  })

  test('append', () => {
    const list = new LinkedList()
    list.append(1)
    list.append(2)
    list.append(3)
    expect(list.length).toBe(3)
  })

  test('delete', () => {
    const list = new LinkedList()
    list.append(1)
    list.append(2)
    list.append(3)
    expect(list.delete(1)).toBe(true)
    expect(list.toJSON()).toEqual([2, 3])
    expect(list.length).toEqual(2)
    expect(list.delete(1)).toBe(false)
    expect(list.toJSON()).toEqual([2, 3])
    expect(list.length).toEqual(2)
    expect(list.delete(2)).toBe(true)
    expect(list.delete(3)).toBe(true)
    expect(list.delete(4)).toBe(false)
    expect(list.length).toEqual(0)
    list.append(4)
    expect(list.toJSON()).toEqual([4])
    expect(list.length).toEqual(1)
  })

  test('toJSON', () => {
    const list = new LinkedList()
    list.append(1)
    list.append(2)
    list.append(3)
    expect(list.toJSON()).toEqual([1, 2, 3])
  })

  test('IterableIterator', () => {
    const list = new LinkedList()
    list.append(1)
    list.append(2)
    list.append(3)

    expect([...list]).toEqual([1, 2, 3])
    expect(Array.from(list)).toEqual([1, 2, 3])
  })

})
