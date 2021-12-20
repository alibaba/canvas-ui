import { RenderFlex, RenderObject, RenderPipeline, RenderSingleChild, RenderView } from '..'
import { Point, Size } from '../../math'
import { PlatformAdapter } from '../../platform'
import { TestRenderObject } from './test-render-object'

describe('RenderFlex', () => {

  let root!: RenderSingleChild<RenderObject>
  let disposeRoot!: () => void

  beforeEach(() => {
    root = new RenderSingleChild()
    root._relayoutBoundary = root
    const handleVisualUpdate = () => {
      PlatformAdapter.scheduleFrame()
    }
    const clearOnFrame = PlatformAdapter.onFrame(() => {

      // 仅更新布局
      pipeline.flushLayout()
    })
    const pipeline = new RenderPipeline(handleVisualUpdate)
    pipeline.rootNode = root

    disposeRoot = () => {
      clearOnFrame()
    }
  })

  afterEach(() => {
    (<any>root) = undefined
    disposeRoot()
  })

  test('yogaNode 的生命周期', () => {
    const root = new RenderSingleChild()
    const a = new RenderFlex()
    root.child = a
    expect(a.yogaNode).toBeDefined() // 被 adoptChild: 创建 YogaNode
    root.child = undefined
    expect(a.yogaNode).toBeUndefined() // 被 dropChid: 销毁 YogaNode
  })

  test('能够布局', () => {

    //
    // 如下结构
    //  root
    //    \
    //     a
    //    / \
    //   b   c - (100, 100)
    //   \
    //   (50, 50)
    //

    const a = new RenderFlex()
    const b = new TestRenderObject()
    const c = new TestRenderObject()
    root.child = a
    jest.runAllTimers()

    a.appendChild(b)
    expect(b.yogaNode).toBeDefined()
    a.appendChild(c)
    expect(c.yogaNode).toBeDefined()

    b.style.width = 50
    b.style.height = 50
    expect(b._layoutDirty).toBe(true)
    expect(b.yogaNode!.isDirty()).toBe(true)

    c.style.width = 100
    c.style.height = 100
    expect(c._layoutDirty).toBe(true)
    expect(c.yogaNode!.isDirty()).toBe(true)

    jest.runAllTimers()
    expect(b._layoutDirty).toBe(false)
    expect(b.yogaNode!.isDirty()).toBe(false)
    expect(b._relayoutBoundary).toBe(a)
    expect(c._layoutDirty).toBe(false)
    expect(c.yogaNode!.isDirty()).toBe(false)
    expect(c._relayoutBoundary).toBe(a)

    expect(a.size).toEqual(Size.fromWH(150, 100))
    expect(b.size).toEqual(Size.fromWH(50, 50))
    expect(b.offset).toEqual(Point.fromXY(0, 0))
    expect(c.size).toEqual(Size.fromWH(100, 100))
    expect(c.offset).toEqual(Point.fromXY(50, 0))
  })


  test('能够嵌套布局', () => {

    //
    // 如下结构
    //  root
    //      \
    //       a
    //      / \
    //     b   c
    //    / \   \
    //   d   e   f
    //

    const a = new RenderFlex()
    const b = new RenderFlex()
    const c = new RenderFlex()
    const d = new TestRenderObject()
    const e = new TestRenderObject()
    const f = new TestRenderObject()
    root.child = a

    a.appendChild(b)
    a.appendChild(c)
    b.appendChild(d)
    b.appendChild(e)
    c.appendChild(f)

    d.style.width = 50
    d.style.height = 50
    e.style.width = 50
    e.style.height = 50
    f.style.width = 100
    f.style.height = 100

    jest.runAllTimers()

    expect(a.size).toEqual(Size.fromWH(200, 100))
    expect(a.offset).toEqual(Point.fromXY(0, 0))
    expect(b.size).toEqual(Size.fromWH(100, 100))
    expect(b.offset).toEqual(Point.fromXY(0, 0))
    expect(c.size).toEqual(Size.fromWH(100, 100))
    expect(c.offset).toEqual(Point.fromXY(100, 0))
  })

  test('能够混合布局', () => {

    //
    // 如下结构
    //  root
    //      \
    //     flex1
    //       \
    //      view1
    //        \
    //        flex2
    //         / \
    //        a   b

    const flex1 = new RenderFlex()
    root.child = flex1
    const view1 = new RenderView()
    flex1.appendChild(view1)
    const flex2 = new RenderFlex()
    view1.appendChild(flex2)
    const a = new TestRenderObject()
    flex2.appendChild(a)
    const b = new TestRenderObject()
    flex2.appendChild(b)
    a.style.width = 10
    a.style.height = 10
    b.style.width = 10
    b.style.height = 10
    jest.runAllTimers()

    expect(flex2._relayoutBoundary).toBe(flex2)
    expect(a._relayoutBoundary).toBe(flex2)
    expect(b._relayoutBoundary).toBe(flex2)
    expect(flex2.size).toEqual(Size.fromWH(20, 10))

    expect(a.owner).toBe(root.owner)
    root.child = undefined
    expect(a.owner).toBeUndefined()
  })
})
