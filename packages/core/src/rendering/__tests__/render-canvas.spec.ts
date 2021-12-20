import { RenderSingleChild, RenderCanvas } from '..'

describe('RenderCanvas', () => {

  let root: RenderCanvas

  beforeEach(() => {
    root = new RenderCanvas()
  })

  afterEach(() => {
    root.dispose()
  })

  test('dispose', () => {
    const c = new RenderCanvas()
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
    const canvas = new RenderCanvas()
    const child1 = new RenderSingleChild()
    canvas.child = child1
    canvas.prepareInitialFrame()
    expect(child1._layoutDirty).toBe(true)
    expect(canvas.owner?.debugLayoutDirtyObjects[0]).toBe(canvas)
    expect(canvas.owner?.debugLayoutDirtyObjects).toHaveLength(1)
    jest.runAllTimers()
    expect(canvas._layoutDirty).toBe(false)
    expect(child1._layoutDirty).toBe(false)
    canvas.dispose()
  })

  test('应只绘制一次', () => {
    //
  })

})
