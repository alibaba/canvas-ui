import { RenderPipeline, RenderScrollView, RenderSingleChild, RenderView, ScrollBounds, RenderCanvas, ScrollAxis } from '..'
import { Point, Rect, Size } from '../../math'
import { PlatformAdapter } from '../../platform'
import { BridgeEventBinding, SyntheticEventManager } from '../../events'

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

// Mock FrameScheduler for integration tests
const createMockFrameScheduler = () => {
  const callbacks: Array<(ms: number) => void> = []
  return {
    scheduleFrame: () => {
      callbacks.forEach(cb => cb(performance.now()))
    },
    onFrame: (callback: (ms: number) => void) => {
      callbacks.push(callback)
      return () => {
        const index = callbacks.indexOf(callback)
        if (index !== -1) callbacks.splice(index, 1)
      }
    }
  }
}

describe('RenderScrollView - Wheel Event Bubbling', () => {
  let canvas: RenderCanvas
  let bridgeBinding: BridgeEventBinding
  let eventManager: SyntheticEventManager

  beforeEach(() => {
    bridgeBinding = new BridgeEventBinding()
    canvas = new RenderCanvas(
      createMockFrameScheduler(),
      bridgeBinding
    )
    canvas.prepareInitialFrame()
    canvas.offstage = false
    canvas.size = Size.fromWH(800, 600)
    eventManager = SyntheticEventManager.findInstance(canvas)!
  })

  afterEach(() => {
    canvas.dispose()
  })

  test('wheel event preventDefault called when scrolling within bounds', () => {
    // Setup: ScrollView with scrollable content
    const scrollView = new RenderScrollView()
    scrollView.offstage = false
    scrollView.size = Size.fromWH(200, 200)
    scrollView.offset = Point.fromXY(100, 100)
    scrollView.scrollAxis = ScrollAxis.Vertical

    const child = new RenderView()
    child.offstage = false
    child.size = Size.fromWH(200, 400) // Taller than viewport
    scrollView.child = child

    canvas.child = scrollView

    // Scroll down while NOT at bottom (scrollTop starts at 0)
    const initialScrollTop = scrollView.scrollTop
    bridgeBinding.injectWheelEvent(150, 150, 0, 10) // Scroll down
    eventManager.flushNativeEvents()

    // Assert: Scroll position should change (preventDefault was called internally)
    expect(scrollView.scrollTop).toBeGreaterThan(initialScrollTop)
  })

  test('wheel event preventDefault NOT called at bottom scroll bound', () => {
    const scrollView = new RenderScrollView()
    scrollView.offstage = false
    scrollView.size = Size.fromWH(200, 200)
    scrollView.offset = Point.fromXY(100, 100)
    scrollView.scrollAxis = ScrollAxis.Vertical

    const child = new RenderView()
    child.offstage = false
    child.size = Size.fromWH(200, 400) // Taller than viewport
    scrollView.child = child

    canvas.child = scrollView

    // Scroll to bottom
    scrollView.scrollTop = scrollView.scrollTopMax
    const scrollTopAtBottom = scrollView.scrollTop

    // Try to scroll down further
    bridgeBinding.injectWheelEvent(150, 150, 0, 10) // Scroll down
    eventManager.flushNativeEvents()

    // Assert: Scroll position should NOT change
    expect(scrollView.scrollTop).toBe(scrollTopAtBottom)
    expect(scrollView.scrollTop).toBe(scrollView.scrollTopMax)
  })

  test('wheel event preventDefault NOT called at top scroll bound', () => {
    const scrollView = new RenderScrollView()
    scrollView.offstage = false
    scrollView.size = Size.fromWH(200, 200)
    scrollView.offset = Point.fromXY(100, 100)
    scrollView.scrollAxis = ScrollAxis.Vertical

    const child = new RenderView()
    child.offstage = false
    child.size = Size.fromWH(200, 400)
    scrollView.child = child

    canvas.child = scrollView

    // ScrollView starts at top (scrollTop = 0)
    expect(scrollView.scrollTop).toBe(0)
    const scrollTopAtTop = scrollView.scrollTop

    // Try to scroll up
    bridgeBinding.injectWheelEvent(150, 150, 0, -10) // Scroll up
    eventManager.flushNativeEvents()

    // Assert: Scroll position should NOT change
    expect(scrollView.scrollTop).toBe(scrollTopAtTop)
    expect(scrollView.scrollTop).toBe(0)
  })

  test('wheel event preventDefault NOT called at left scroll bound', () => {
    const scrollView = new RenderScrollView()
    scrollView.offstage = false
    scrollView.size = Size.fromWH(200, 200)
    scrollView.offset = Point.fromXY(100, 100)
    scrollView.scrollAxis = ScrollAxis.Horizontal

    const child = new RenderView()
    child.offstage = false
    child.size = Size.fromWH(400, 200) // Wider than viewport
    scrollView.child = child

    canvas.child = scrollView

    // ScrollView starts at left (scrollLeft = 0)
    expect(scrollView.scrollLeft).toBe(0)
    const scrollLeftAtLeft = scrollView.scrollLeft

    // Try to scroll left
    bridgeBinding.injectWheelEvent(150, 150, -10, 0) // Scroll left
    eventManager.flushNativeEvents()

    // Assert: Scroll position should NOT change
    expect(scrollView.scrollLeft).toBe(scrollLeftAtLeft)
    expect(scrollView.scrollLeft).toBe(0)
  })

  test('wheel event preventDefault NOT called at right scroll bound', () => {
    const scrollView = new RenderScrollView()
    scrollView.offstage = false
    scrollView.size = Size.fromWH(200, 200)
    scrollView.offset = Point.fromXY(100, 100)
    scrollView.scrollAxis = ScrollAxis.Horizontal

    const child = new RenderView()
    child.offstage = false
    child.size = Size.fromWH(400, 200)
    scrollView.child = child

    canvas.child = scrollView

    // Scroll to right
    scrollView.scrollLeft = scrollView.scrollLeftMax
    const scrollLeftAtRight = scrollView.scrollLeft

    // Try to scroll right further
    bridgeBinding.injectWheelEvent(150, 150, 10, 0) // Scroll right
    eventManager.flushNativeEvents()

    // Assert: Scroll position should NOT change
    expect(scrollView.scrollLeft).toBe(scrollLeftAtRight)
    expect(scrollView.scrollLeft).toBe(scrollView.scrollLeftMax)
  })

  test('nested ScrollViews - inner at bounds allows outer to scroll', () => {
    // Outer ScrollView
    const outerScrollView = new RenderScrollView()
    outerScrollView.offstage = false
    outerScrollView.size = Size.fromWH(400, 400)
    outerScrollView.offset = Point.fromXY(50, 50)
    outerScrollView.scrollAxis = ScrollAxis.Vertical

    const outerContent = new RenderView() as any
    outerContent.offstage = false
    outerContent.size = Size.fromWH(400, 800) // Taller than outer viewport
    outerScrollView.child = outerContent

    // Inner ScrollView nested inside outer
    const innerScrollView = new RenderScrollView()
    innerScrollView.offstage = false
    innerScrollView.size = Size.fromWH(200, 200)
    innerScrollView.offset = Point.fromXY(100, 100) // Position inside outer
    innerScrollView.scrollAxis = ScrollAxis.Vertical

    const innerContent = new RenderView()
    innerContent.offstage = false
    innerContent.size = Size.fromWH(200, 400) // Taller than inner viewport
    innerScrollView.child = innerContent

    outerContent.appendChild(innerScrollView)
    canvas.child = outerScrollView

    // Scroll inner to bottom
    innerScrollView.scrollTop = innerScrollView.scrollTopMax
    const innerScrollTopAtBottom = innerScrollView.scrollTop

    const outerWheelHandler = jest.fn()
    outerScrollView.addEventListener('wheel', outerWheelHandler)

    // Wheel event on inner ScrollView at bottom bound
    // Global coordinates: 150 + 50 (canvas offset) + 100 (inner offset) = position inside inner
    const initialOuterScrollTop = outerScrollView.scrollTop

    // Inject wheel event at inner ScrollView position
    bridgeBinding.injectWheelEvent(250, 250, 0, 10) // Scroll down
    eventManager.flushNativeEvents()

    // Assert: Inner didn't scroll (at bottom), but outer should receive event
    expect(innerScrollView.scrollTop).toBe(innerScrollTopAtBottom)
    expect(outerWheelHandler).toHaveBeenCalled()

    // Outer should scroll because inner didn't preventDefault
    expect(outerScrollView.scrollTop).toBeGreaterThan(initialOuterScrollTop)
  })
})
