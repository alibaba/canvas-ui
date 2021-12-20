import { RenderCanvas, RenderPipeline, RenderSingleChild } from '../'
import { Point, Rect, Size } from '../../math'
import { TestRenderObject } from './test-render-object'
import { TestStyleRenderObject } from './test-style-render-object'

describe('RenderObject', () => {
  test('new RenderObject', () => {
    const node = new TestRenderObject()
    expect(node._layoutDirty).toBe(true)
    expect(node.owner).toBeUndefined()
    expect(node.parent).toBeUndefined()
    expect(node._relayoutBoundary).toBeUndefined()

    // 无效，因为没有 owner
    node.markLayoutDirty()
    expect(node._layoutDirty).toBe(true)
  })

  test('可以追踪样式', () => {
    const node = new TestStyleRenderObject()
    node._relayoutBoundary = node
    node.style.width = 50
    node.style.height = 50

    const handleVisualUpdate = jest.fn(() => {
      requestAnimationFrame(() => {
        pipeline.flushLayout()
      })
    })
    const pipeline = new RenderPipeline(handleVisualUpdate)
    pipeline.rootNode = node
    expect(handleVisualUpdate).toHaveBeenCalledTimes(1)
    jest.runOnlyPendingTimers()

    expect(node._paintDirty).toBe(true)
    expect(Size.eq(node.size, Size.fromWH(50, 50)))
  })

  test('_needsCompositingDirty 的初始状态', () => {
    const node = new TestRenderObject()
    expect(node._needsCompositingDirty).toBe(false)
    expect(node.needsCompositing).toBe(false)
    const handleVisualUpdate = jest.fn(() => {
      requestAnimationFrame(() => {
        pipeline.flushNeedsCompositing()
      })
    })
    const pipeline = new RenderPipeline(handleVisualUpdate)
    pipeline.rootNode = node
    expect(node._needsCompositingDirty).toBe(false)
    expect(node.needsCompositing).toBe(false)
    jest.runAllTimers()
    expect(node._needsCompositingDirty).toBe(false)
    expect(node.needsCompositing).toBe(false)
    expect(handleVisualUpdate).not.toBeCalled()
  })

  test('localToGlobal', () => {
    //
    // 构造结构
    //
    //  canvas (0, 0) RenderCanvas
    //   \
    //    root (0, 0) 逻辑根节点
    //     \
    //      a (10, 20)
    //       \
    //        b (10, 20)
    //         \
    //          c (0, 0)

    const canvas = new RenderCanvas()
    canvas.prepareInitialFrame()
    canvas.dpr = 2

    const root = new RenderSingleChild()
    canvas.child = root

    const a = new RenderSingleChild()
    a.offset = Point.fromXY(10, 20)
    root.child = a

    const b = new RenderSingleChild()
    b.offset = Point.fromXY(10, 20)
    a.child = b

    const c = new RenderSingleChild()
    b.child = c

    // 相对于 root
    expect(c.localToGlobal(Point.fromXY(0, 0))).toEqual(Point.fromXY(20, 40))

    // 相对于 root with local offset
    expect(c.localToGlobal(Point.fromXY(5, 10))).toEqual(Point.fromXY(25, 50))

    // 相对于 parent
    expect(c.localToGlobal(Point.fromXY(0, 0), c.parent)).toEqual(Point.fromXY(0, 0))

    // 相对于 parent with local offset
    expect(c.localToGlobal(Point.fromXY(5, 5), c.parent)).toEqual(Point.fromXY(5, 5))

    // 相对于 parent.parent
    expect(c.localToGlobal(Point.fromXY(0, 0), c.parent!.parent)).toEqual(Point.fromXY(10, 20))

    // 相对于 parent.parent with local offset
    expect(c.localToGlobal(Point.fromXY(5, 5), c.parent!.parent)).toEqual(Point.fromXY(15, 25))

    // 相对于 Canvas (为了得到物理像素)
    expect(c.localToGlobal(Point.fromXY(0, 0), canvas)).toEqual(Point.fromXY(40, 80))

    // 相对于 Canvas (为了得到物理像素) local offset
    expect(c.localToGlobal(Point.fromXY(5, 10), canvas)).toEqual(Point.fromXY(50, 100))

    // b 相对于其 parent 应等于自己 offset
    expect(b.localToGlobal(Point.fromXY(0, 0), b.parent)).toEqual(b.offset)
  })

  test('globalToLocal', () => {
    //
    // 构造结构
    //
    //  canvas (0, 0) RenderCanvas
    //   \
    //    root (0, 0) 逻辑根节点
    //     \
    //      a (10, 20)
    //       \
    //        b (10, 20)
    //         \
    //          c (0, 0)

    const canvas = new RenderCanvas()
    canvas.prepareInitialFrame()
    canvas.dpr = 2

    const root = new RenderSingleChild()
    canvas.child = root

    const a = new RenderSingleChild()
    a.offset = Point.fromXY(10, 20)
    root.child = a

    const b = new RenderSingleChild()
    b.offset = Point.fromXY(10, 20)
    a.child = b

    const c = new RenderSingleChild()
    b.child = c

    // 相对于 root
    expect(c.globalToLocal(Point.fromXY(0, 0))).toEqual(Point.fromXY(-20, -40))

    // 相对于 root with local offset
    expect(c.globalToLocal(Point.fromXY(5, 5))).toEqual(Point.fromXY(-15, -35))

    // 相对于 parent
    expect(c.globalToLocal(Point.fromXY(0, 0), c.parent)).toEqual(Point.fromXY(0, 0))

    // 相对于 parent with local offset
    expect(c.globalToLocal(Point.fromXY(5, 5), c.parent)).toEqual(Point.fromXY(5, 5))

    // 相对于 parent.parent
    expect(c.globalToLocal(Point.fromXY(0, 0), c.parent!.parent)).toEqual(Point.fromXY(-10, -20))

    // 相对于 parent.parent with local offset
    expect(c.globalToLocal(Point.fromXY(5, 5), c.parent!.parent)).toEqual(Point.fromXY(-5, -15))

    // 相对于 Canvas (为了得到物理像素)
    expect(c.globalToLocal(Point.fromXY(0, 0), canvas)).toEqual(Point.fromXY(-20, -40))

    // 相对于 Canvas (为了得到物理像素) local offset
    expect(c.globalToLocal(Point.fromXY(5, 10), canvas)).toEqual(Point.fromXY(-17.5, -35))

    // b 相对于其 parent 应等于自己 -offset
    expect(b.globalToLocal(Point.fromXY(0, 0), b.parent)).toEqual(Point.invert(b.offset))
  })

  test('getBoundingClientRect', () => {
    //
    // 构造结构
    //
    //  canvas (0, 0) RenderCanvas
    //   \
    //    root (0, 0) 逻辑根节点
    //     \
    //      a (10, 20)
    //       \
    //        b (10, 20)
    //         \
    //          c (0, 0) size=(10, 10)

    const canvas = new RenderCanvas()
    canvas.prepareInitialFrame()
    canvas.dpr = 2

    const root = new RenderSingleChild()
    canvas.child = root

    const a = new RenderSingleChild()
    a.offset = Point.fromXY(10, 20)
    root.child = a

    const b = new RenderSingleChild()
    b.offset = Point.fromXY(10, 20)
    a.child = b

    const c = new RenderSingleChild()
    c.size = Size.fromWH(10, 10)
    b.child = c

    // 相对于 root
    expect(c.getBoundingClientRect()).toEqual(Rect.fromLTWH(20, 40, 10, 10))

    // 相对于 parent
    expect(c.getBoundingClientRect(c.parent)).toEqual(Rect.fromLTWH(0, 0, 10, 10))

    // 相对于 parent.parent
    expect(c.getBoundingClientRect(c.parent!.parent)).toEqual(Rect.fromLTWH(10, 20, 10, 10))

    // 相对于 Canvas (为了得到物理像素)
    expect(c.getBoundingClientRect(canvas)).toEqual(Rect.fromLTWH(40, 80, 20, 20))
  })

})
