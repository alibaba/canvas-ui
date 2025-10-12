import { BridgeEventBinding, SyntheticEventManager } from '..'
import { RenderCanvas } from '../../rendering'
import { createElement } from '../../index'
import { Point, Size } from '../../math'

// Mock FrameScheduler for tests
const createMockFrameScheduler = () => {
  const callbacks: Array<(ms: number) => void> = []
  return {
    scheduleFrame: () => {
      // Immediately flush all callbacks
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

describe('BridgeEventBinding', () => {
  describe('Unit Tests', () => {
    test('injectPointerEvent adds event to buffer', () => {
      const binding = new BridgeEventBinding()

      binding.injectPointerEvent('pointerdown', 100, 50, 0, 0)

      const events = binding.flushPointerEvents()
      expect(events[0]).toBeDefined()
      expect(events[0].pointerdown).toBeDefined()
      expect(events[0].pointerdown?.offsetX).toBe(100)
      expect(events[0].pointerdown?.offsetY).toBe(50)
    })

    test('flushPointerEvents clears buffer', () => {
      const binding = new BridgeEventBinding()

      binding.injectPointerEvent('pointerdown', 100, 50)
      binding.flushPointerEvents()

      const events = binding.flushPointerEvents()
      expect(events).toEqual({})
    })

    test('onEvents callback fires on injection', () => {
      const binding = new BridgeEventBinding()
      const onEvents = jest.fn()
      binding.onEvents = onEvents

      binding.injectPointerEvent('pointermove', 10, 20)

      expect(onEvents).toHaveBeenCalledTimes(1)
    })

    test('supports multiple pointer IDs', () => {
      const binding = new BridgeEventBinding()

      binding.injectPointerEvent('pointerdown', 10, 20, 0, 0)
      binding.injectPointerEvent('pointerdown', 50, 60, 0, 1)

      const events = binding.flushPointerEvents()
      expect(events[0]?.pointerdown?.offsetX).toBe(10)
      expect(events[1]?.pointerdown?.offsetX).toBe(50)
    })

    test('injectWheelEvent adds wheel event', () => {
      const binding = new BridgeEventBinding()

      binding.injectWheelEvent(100, 50, 0, -10)

      expect(binding.hasWheelEvent).toBe(true)
      const event = binding.flushWheelEvent()
      expect(event?.deltaY).toBe(-10)
    })
  })

  describe('Integration Tests with Core API', () => {
    let canvas: RenderCanvas
    let bridgeBinding: BridgeEventBinding
    let eventManager: SyntheticEventManager

    beforeEach(() => {
      // Create RenderCanvas with BridgeEventBinding injected
      bridgeBinding = new BridgeEventBinding()
      canvas = new RenderCanvas(
        createMockFrameScheduler(),
        bridgeBinding
      )
      canvas.prepareInitialFrame()
      canvas.offstage = false
      canvas.size = Size.fromWH(800, 600)

      // Get event manager
      eventManager = SyntheticEventManager.findInstance(canvas)!
    })

    afterEach(() => {
      canvas.dispose()
    })

    test('injected pointerdown event reaches element handler', () => {
      const handleClick = jest.fn()

      // Create UI using explicit positioning
      const rect = createElement('Rect')
      rect.offstage = false
      rect.size = Size.fromWH(100, 50)
      rect.offset = Point.fromXY(50, 50)
      rect.addEventListener('pointerdown', handleClick)
      canvas.child = rect

      // Inject click inside bounds
      bridgeBinding.injectPointerEvent('pointerdown', 75, 60)
      eventManager.flushNativeEvents()

      expect(handleClick).toHaveBeenCalled()
      expect(handleClick.mock.calls[0][0].type).toBe('pointerdown')
    })

    test('events outside bounds do not trigger handlers (hit testing)', () => {
      const handleClick = jest.fn()

      const rect = createElement('Rect')
      rect.offstage = false
      rect.size = Size.fromWH(100, 50)
      rect.offset = Point.fromXY(50, 50)
      rect.addEventListener('pointerdown', handleClick)
      canvas.child = rect

      // Inject click outside bounds
      bridgeBinding.injectPointerEvent('pointerdown', 10, 10)
      eventManager.flushNativeEvents()

      expect(handleClick).not.toHaveBeenCalled()
    })

    test('pointermove generates pointerenter event on hover', () => {
      const handleEnter = jest.fn()

      const rect = createElement('Rect')
      rect.offstage = false
      rect.size = Size.fromWH(100, 50)
      rect.offset = Point.fromXY(50, 50)
      rect.addEventListener('pointerenter', handleEnter)
      canvas.child = rect

      // First move outside to establish a previous path
      bridgeBinding.injectPointerEvent('pointermove', 10, 10)
      eventManager.flushNativeEvents()

      // Then move into bounds - this triggers pointerenter
      bridgeBinding.injectPointerEvent('pointermove', 75, 60)
      eventManager.flushNativeEvents()

      expect(handleEnter).toHaveBeenCalled()
    })

    test('pointermove generates pointerleave event when leaving', () => {
      const handleLeave = jest.fn()

      const rect = createElement('Rect')
      rect.offstage = false
      rect.size = Size.fromWH(100, 50)
      rect.offset = Point.fromXY(50, 50)
      rect.addEventListener('pointerleave', handleLeave)
      canvas.child = rect

      // Move into bounds
      bridgeBinding.injectPointerEvent('pointermove', 75, 60)
      eventManager.flushNativeEvents()

      // Move out of bounds
      bridgeBinding.injectPointerEvent('pointermove', 10, 10)
      eventManager.flushNativeEvents()

      expect(handleLeave).toHaveBeenCalled()
    })

    test('events bubble through component hierarchy', () => {
      const handleOuterClick = jest.fn()
      const handleInnerClick = jest.fn()

      const outer = createElement('View') as any
      outer.offstage = false
      outer.size = Size.fromWH(200, 200)
      outer.offset = Point.fromXY(50, 50)
      outer.addEventListener('pointerdown', handleOuterClick)

      const inner = createElement('Rect')
      inner.offstage = false
      inner.size = Size.fromWH(100, 100)
      inner.offset = Point.fromXY(25, 25)
      inner.addEventListener('pointerdown', handleInnerClick)

      outer.appendChild(inner)
      canvas.child = outer

      // Click on inner element (absolute position: 50+25=75, 50+25=75)
      bridgeBinding.injectPointerEvent('pointerdown', 100, 100)
      eventManager.flushNativeEvents()

      expect(handleInnerClick).toHaveBeenCalled()
      expect(handleOuterClick).toHaveBeenCalled() // Bubbled
    })

    test('wheel events trigger scroll handlers', () => {
      const handleWheel = jest.fn()

      const rect = createElement('Rect')
      rect.offstage = false
      rect.size = Size.fromWH(100, 50)
      rect.offset = Point.fromXY(50, 50)
      rect.addEventListener('wheel', handleWheel)
      canvas.child = rect

      // Inject wheel event
      bridgeBinding.injectWheelEvent(75, 60, 0, -10)
      eventManager.flushNativeEvents()

      expect(handleWheel).toHaveBeenCalled()
      expect(handleWheel.mock.calls[0][0].deltaY).toBe(-10)
    })

    test('complex UI tree with multiple event handlers', () => {
      const handleButton1 = jest.fn()
      const handleButton2 = jest.fn()
      const handleHover = jest.fn()

      const container = createElement('View') as any
      container.offstage = false
      container.size = Size.fromWH(800, 600)
      container.offset = Point.fromXY(0, 0)

      const button1 = createElement('Rect')
      button1.offstage = false
      button1.size = Size.fromWH(200, 50)
      button1.offset = Point.fromXY(0, 0)
      button1.addEventListener('pointerdown', handleButton1)
      button1.addEventListener('pointerenter', handleHover)

      const button2 = createElement('Rect')
      button2.offstage = false
      button2.size = Size.fromWH(200, 50)
      button2.offset = Point.fromXY(0, 50)
      button2.addEventListener('pointerdown', handleButton2)

      container.appendChild(button1)
      container.appendChild(button2)
      canvas.child = container

      // First move outside to establish previous path
      bridgeBinding.injectPointerEvent('pointermove', 300, 300)
      eventManager.flushNativeEvents()

      // Hover over button 1 - this triggers pointerenter
      bridgeBinding.injectPointerEvent('pointermove', 100, 25)
      eventManager.flushNativeEvents()
      expect(handleHover).toHaveBeenCalled()

      // Click button 1
      bridgeBinding.injectPointerEvent('pointerdown', 100, 25)
      eventManager.flushNativeEvents()
      expect(handleButton1).toHaveBeenCalled()

      // Click button 2 (y offset: 50px down)
      bridgeBinding.injectPointerEvent('pointerdown', 100, 75)
      eventManager.flushNativeEvents()
      expect(handleButton2).toHaveBeenCalled()
    })
  })
})
