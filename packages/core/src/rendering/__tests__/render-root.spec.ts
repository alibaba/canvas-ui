import { RenderSingleChild, RenderRoot } from '..'

describe('RenderRoot', () => {

  let root: RenderRoot

  beforeEach(() => {
    root = new RenderRoot()
  })

  afterEach(() => {
    root.dispose()
  })

  test('dispose', () => {
    const c = new RenderRoot()
    c.dispose()
    expect(c.attached).toBe(false)
  })

  test('child accessor', () => {
    const child1 = new RenderSingleChild()
    root.child = child1
    expect(child1.attached).toBe(true)
    expect(child1.parent).toBe(root)
    root.child = undefined
    expect(child1.attached).toBe(false)
    expect(child1.parent).toBeUndefined()
  })

  test('prepareInitialFrame: 没有 child', () => {
    root.prepareInitialFrame()
    expect(root.attached).toBe(true)
    expect(root._layoutDirty).toBe(true)
    expect(root.owner?.debugLayoutDirtyObjects[0]).toBe(root)
    jest.runAllTimers()
    expect(root._layoutDirty).toBe(false)
  })

  test('prepareInitialFrame: 有 child', () => {
    const root = new RenderRoot()
    const child1 = new RenderSingleChild()
    root.child = child1
    root.prepareInitialFrame()
    expect(child1._layoutDirty).toBe(true)
    expect(root.owner?.debugLayoutDirtyObjects[0]).toBe(root)
    expect(root.owner?.debugLayoutDirtyObjects).toHaveLength(1)
    jest.runAllTimers()
    expect(root._layoutDirty).toBe(false)
    expect(child1._layoutDirty).toBe(false)
    root.dispose()
  })

  test('应只绘制一次', () => {
    //
  })

})
