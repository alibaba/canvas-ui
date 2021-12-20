import { RenderPipeline, RenderScrollView, RenderSingleChild, RenderView, ScrollBounds } from '..'
import { Point, Rect, Size } from '../../math'
import { PlatformAdapter } from '../../platform'

describe('RenderScrollView', () => {

  let root!: RenderSingleChild<RenderScrollView>
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
      pipeline.flushNeedsCompositing()
      pipeline.flushPaint()
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

  test('子节点是 RenderSingleChild', () => {
    //
    // 构造结构
    //       root
    //        \
    //         a (RenderScrollView)
    //          \
    //           b (RenderSingleChild)
    //
    const a = new RenderScrollView()
    root.child = a
    const b = new RenderSingleChild()
    a.child = b

    b.style.width = 10
    b.style.height = 10
    jest.runAllTimers()

    expect(a.scrollSize).toEqual(b.size)
    a.scrollSize = Size.fromWH(20, 20)
    expect(a._layoutDirty).toEqual(true)
    jest.runAllTimers()
    expect(a.scrollSize).toEqual(Size.fromWH(20, 20))

    a.scrollOffset = Point.fromXY(5, 5)
    expect(a._paintDirty).toBe(true)
    expect(b.viewport).toEqual(Rect.fromLTWH(a.scrollOffset.x, a.scrollOffset.y, a.size.width, a.size.height))
    jest.runAllTimers()
  })

  test('子节点是 RenderView', () => {
    //
    // 构造结构
    //       root
    //        \
    //         a (RenderScrollView)
    //          \
    //           b (RenderView)
    //
    const a = new RenderScrollView()
    root.child = a
    const b = new RenderView()
    a.child = b

    b.style.width = 10
    b.style.height = 10
    jest.runAllTimers()

    expect(a.scrollSize).toEqual(b.size)
    a.scrollSize = Size.fromWH(20, 20)
    expect(a._layoutDirty).toEqual(true)
    jest.runAllTimers()
    expect(a.scrollSize).toEqual(Size.fromWH(20, 20))

    a.scrollOffset = Point.fromXY(5, 5)
    expect(a._paintDirty).toBe(true)
    expect(b.viewport).toEqual(Rect.fromLTWH(a.scrollOffset.x, a.scrollOffset.y, a.size.width, a.size.height))
    jest.runAllTimers()
  })

  test('能够处理 scrollBounds', () => {
    //
    // 构造结构
    //       root
    //        \
    //         a (RenderScrollView)
    //         \
    //          b (RenderSingleChild)
    //
    const a = new RenderScrollView()
    root.child = a
    const b = new RenderSingleChild()
    a.child = b

    a.style.width = 5
    a.style.height = 5
    b.style.width = 10
    b.style.height = 10
    jest.runAllTimers()
    expect(a.scrollHeight).toEqual(10)
    expect(a.scrollWidth).toEqual(10)
    expect(a.scrollLeftMax).toEqual(5)
    expect(a.scrollTopMax).toEqual(5)

    // ScrollBounds.Fit
    a.scrollLeft = -1
    expect(a.scrollLeft).toBe(0)
    a.scrollLeft = 6
    expect(a.scrollLeft).toBe(a.scrollLeftMax)
    a.scrollTop = -1
    expect(a.scrollTop).toBe(0)
    a.scrollTop = 6
    expect(a.scrollTop).toBe(a.scrollTopMax)

    // ScrollBounds.None
    a.scrollBounds = ScrollBounds.None
    a.scrollLeft = -1
    expect(a.scrollLeft).toBe(-1)
    a.scrollLeft = 6
    expect(a.scrollLeft).toBe(6)
    a.scrollTop = -1
    expect(a.scrollTop).toBe(-1)
    a.scrollTop = 6
    expect(a.scrollTop).toBe(6)
  })

  test('能够派发 scroll event', () => {
    //
    // 构造结构
    //       root
    //        \
    //         a (RenderScrollView)
    //         \
    //          b (RenderSingleChild)
    //
    const a = new RenderScrollView()
    const dispatchEvent = jest.spyOn(a, 'dispatchEvent')
    root.child = a
    const b = new RenderSingleChild()
    a.child = b

    a.style.width = 5
    a.style.height = 5
    b.style.width = 10
    b.style.height = 10
    jest.runAllTimers()
    expect(a.scrollHeight).toEqual(10)
    expect(a.scrollWidth).toEqual(10)
    expect(a.scrollLeftMax).toEqual(5)
    expect(a.scrollTopMax).toEqual(5)

    // ScrollBounds.Fit
    a.scrollLeft = -1
    expect(a.scrollLeft).toBe(0)
    expect(dispatchEvent).toBeCalledTimes(0) // 因为初始 scrollLeft = 0，所以没有变化
    a.scrollLeft = 6
    expect(a.scrollLeft).toBe(a.scrollLeftMax)
    expect(dispatchEvent).toBeCalledTimes(1)
    a.scrollTop = -1
    expect(a.scrollTop).toBe(0)
    expect(dispatchEvent).toBeCalledTimes(1) // 因为初始 scrollLeft = 0，所以没有变化
    a.scrollTop = 6
    expect(a.scrollTop).toBe(a.scrollTopMax)
    expect(dispatchEvent).toBeCalledTimes(2)


    // ScrollBounds.None
    a.scrollBounds = ScrollBounds.None
    a.scrollLeft = -1
    expect(a.scrollLeft).toBe(-1)
    expect(dispatchEvent).toBeCalledTimes(3)
    a.scrollLeft = 6
    expect(a.scrollLeft).toBe(6)
    expect(dispatchEvent).toBeCalledTimes(4)
    a.scrollTop = -1
    expect(a.scrollTop).toBe(-1)
    expect(dispatchEvent).toBeCalledTimes(5)
    a.scrollTop = 6
    expect(a.scrollTop).toBe(6)
    expect(dispatchEvent).toBeCalledTimes(6)
  })

})
