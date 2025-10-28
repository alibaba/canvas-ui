import { BridgeEventBinding } from '../bridge-event-binding'
import { SyntheticEventManager } from '../synthetic-event-manager'
import { RenderCanvas } from '../../rendering/render-canvas'
import { RenderView } from '../../rendering/render-view'
import { Point, Size } from '../../math'

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

describe('Pointer Capture', () => {
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

  test('should register and track pointer capture', () => {
    const component = new RenderView()
    component.offstage = false
    component.size = Size.fromWH(100, 100)
    component.offset = Point.fromXY(100, 100)
    canvas.child = component

    component.setPointerCapture(1)
    expect(component.hasPointerCapture(1)).toBe(true)
  })

  test('should release pointer capture', () => {
    const component = new RenderView()
    component.offstage = false
    component.size = Size.fromWH(100, 100)
    component.offset = Point.fromXY(100, 100)
    canvas.child = component

    component.setPointerCapture(1)
    expect(component.hasPointerCapture(1)).toBe(true)

    component.releasePointerCapture(1)
    expect(component.hasPointerCapture(1)).toBe(false)
  })

  test('should return false for uncaptured pointer', () => {
    const component = new RenderView()
    component.offstage = false
    component.size = Size.fromWH(100, 100)
    canvas.child = component

    expect(component.hasPointerCapture(0)).toBe(false)
  })

  test('should route pointer events to capturing component, not hit-tested component', () => {
    // Create two components: outer and inner
    const outer = new RenderView()
    outer.offstage = false
    outer.size = Size.fromWH(400, 400)
    outer.offset = Point.fromXY(0, 0)

    const inner = new RenderView()
    inner.offstage = false
    inner.size = Size.fromWH(200, 200)
    inner.offset = Point.fromXY(100, 100)

    outer.appendChild(inner)
    canvas.child = outer

    // Track events on both components
    const outerMoveHandler = jest.fn()
    const innerMoveHandler = jest.fn()
    outer.addEventListener('pointermove', outerMoveHandler)
    inner.addEventListener('pointermove', innerMoveHandler)

    // Capture pointer on outer component
    outer.setPointerCapture(0)

    // Inject pointer event at inner component's position
    // Normally this would hit inner, but should go to outer (captured)
    bridgeBinding.injectPointerEvent('pointermove', 150, 150, 0, 0)
    eventManager.flushNativeEvents()

    // Outer should receive event (captured)
    expect(outerMoveHandler).toHaveBeenCalled()
    // Inner should NOT receive event
    expect(innerMoveHandler).not.toHaveBeenCalled()
  })

  test('should maintain capture during drag operation outside component bounds', () => {
    const draggable = new RenderView()
    draggable.offstage = false
    draggable.size = Size.fromWH(100, 100)
    draggable.offset = Point.fromXY(100, 100)
    canvas.child = draggable

    const moveHandler = jest.fn()
    const downHandler = jest.fn()
    draggable.addEventListener('pointermove', moveHandler)
    draggable.addEventListener('pointerdown', downHandler)

    // Simulate drag: pointerdown, capture, move outside bounds
    bridgeBinding.injectPointerEvent('pointerdown', 150, 150, 0, 0)
    eventManager.flushNativeEvents()

    expect(downHandler).toHaveBeenCalled()

    // Capture pointer
    draggable.setPointerCapture(0)

    // Move pointer outside component bounds (component is at 100-200, move to 500)
    bridgeBinding.injectPointerEvent('pointermove', 500, 500, 0, 0)
    eventManager.flushNativeEvents()

    // Component should still receive event (captured)
    expect(moveHandler).toHaveBeenCalledTimes(1)
  })

  test('should track capture for multiple pointers independently', () => {
    const component1 = new RenderView()
    component1.offstage = false
    component1.size = Size.fromWH(100, 100)
    component1.offset = Point.fromXY(0, 0)

    const component2 = new RenderView()
    component2.offstage = false
    component2.size = Size.fromWH(100, 100)
    component2.offset = Point.fromXY(200, 0)

    component1.appendChild(component2)
    canvas.child = component1

    component1.setPointerCapture(0)
    component2.setPointerCapture(1)

    expect(component1.hasPointerCapture(0)).toBe(true)
    expect(component1.hasPointerCapture(1)).toBe(false)
    expect(component2.hasPointerCapture(0)).toBe(false)
    expect(component2.hasPointerCapture(1)).toBe(true)
  })

  test('should allow release and re-capture of same pointer', () => {
    const component = new RenderView()
    component.offstage = false
    component.size = Size.fromWH(100, 100)
    canvas.child = component

    // Capture
    component.setPointerCapture(0)
    expect(component.hasPointerCapture(0)).toBe(true)

    // Release
    component.releasePointerCapture(0)
    expect(component.hasPointerCapture(0)).toBe(false)

    // Re-capture
    component.setPointerCapture(0)
    expect(component.hasPointerCapture(0)).toBe(true)
  })

  test('should use normal hit testing when no capture is active', () => {
    const outer = new RenderView()
    outer.offstage = false
    outer.size = Size.fromWH(400, 400)
    outer.offset = Point.fromXY(0, 0)

    const inner = new RenderView()
    inner.offstage = false
    inner.size = Size.fromWH(200, 200)
    inner.offset = Point.fromXY(100, 100)

    outer.appendChild(inner)
    canvas.child = outer

    const outerHandler = jest.fn()
    const innerHandler = jest.fn()
    outer.addEventListener('pointermove', outerHandler)
    inner.addEventListener('pointermove', innerHandler)

    // No capture - should hit test normally
    bridgeBinding.injectPointerEvent('pointermove', 150, 150, 0, 0)
    eventManager.flushNativeEvents()

    // Inner should receive event (normal hit testing)
    expect(innerHandler).toHaveBeenCalled()
    // Outer should also receive event (bubbling)
    expect(outerHandler).toHaveBeenCalled()
  })

  test('should handle pointerdown events with capture', () => {
    const component = new RenderView()
    component.offstage = false
    component.size = Size.fromWH(100, 100)
    component.offset = Point.fromXY(100, 100)
    canvas.child = component

    const downHandler = jest.fn()
    component.addEventListener('pointerdown', downHandler)

    component.setPointerCapture(0)

    // Inject pointerdown outside component bounds
    bridgeBinding.injectPointerEvent('pointerdown', 500, 500, 0, 0)
    eventManager.flushNativeEvents()

    // Component should receive event (captured)
    expect(downHandler).toHaveBeenCalled()
  })

  test('should handle pointerup events with capture', () => {
    const component = new RenderView()
    component.offstage = false
    component.size = Size.fromWH(100, 100)
    component.offset = Point.fromXY(100, 100)
    canvas.child = component

    const upHandler = jest.fn()
    component.addEventListener('pointerup', upHandler)

    component.setPointerCapture(0)

    // Inject pointerup outside component bounds
    bridgeBinding.injectPointerEvent('pointerup', 500, 500, 0, 0)
    eventManager.flushNativeEvents()

    // Component should receive event (captured)
    expect(upHandler).toHaveBeenCalled()
  })

  test('typical drag-and-drop workflow', () => {
    const draggable = new RenderView()
    draggable.offstage = false
    draggable.size = Size.fromWH(100, 100)
    draggable.offset = Point.fromXY(100, 100)
    canvas.child = draggable

    const events: string[] = []

    draggable.addEventListener('pointerdown', (e: any) => {
      events.push('down')
      draggable.setPointerCapture(e.pointerId || 0)
    })

    draggable.addEventListener('pointermove', () => {
      events.push('move')
    })

    draggable.addEventListener('pointerup', (e: any) => {
      events.push('up')
      draggable.releasePointerCapture(e.pointerId || 0)
    })

    // Start drag inside component
    bridgeBinding.injectPointerEvent('pointerdown', 150, 150, 0, 0)
    eventManager.flushNativeEvents()

    // Down event should be received
    expect(events).toContain('down')

    // Capture should be active
    expect(draggable.hasPointerCapture(0)).toBe(true)

    // Drag outside component bounds
    bridgeBinding.injectPointerEvent('pointermove', 500, 500, 0, 0)
    eventManager.flushNativeEvents()

    // Move event should be received even though pointer is outside
    expect(events).toContain('move')

    // Release outside component bounds
    bridgeBinding.injectPointerEvent('pointerup', 500, 500, 0, 0)
    eventManager.flushNativeEvents()

    // Up event should be received
    expect(events).toContain('up')

    // Capture should be released
    expect(draggable.hasPointerCapture(0)).toBe(false)
  })

  test('should not affect events from different pointer IDs', () => {
    const container = new RenderView()
    container.offstage = false
    container.size = Size.fromWH(800, 600)
    container.offset = Point.fromXY(0, 0)

    const component1 = new RenderView()
    component1.offstage = false
    component1.size = Size.fromWH(100, 100)
    component1.offset = Point.fromXY(100, 100)

    const component2 = new RenderView()
    component2.offstage = false
    component2.size = Size.fromWH(100, 100)
    component2.offset = Point.fromXY(300, 100)

    canvas.child = container
    container.appendChild(component1)
    container.appendChild(component2)

    const handler1 = jest.fn()
    const handler2 = jest.fn()
    component1.addEventListener('pointermove', handler1)
    component2.addEventListener('pointermove', handler2)

    // Capture pointer 0 on component1
    component1.setPointerCapture(0)

    // Event with pointer 0 at component2's position should go to component1 (captured)
    bridgeBinding.injectPointerEvent('pointermove', 350, 150, 0, 0)
    eventManager.flushNativeEvents()
    expect(handler1).toHaveBeenCalled()

    handler1.mockClear()
    handler2.mockClear()

    // Event with pointer 1 at component2's position should hit-test normally (not captured)
    bridgeBinding.injectPointerEvent('pointermove', 350, 150, 0, 1)
    eventManager.flushNativeEvents()

    // Component2 should receive it (normal hit testing for pointer 1)
    expect(handler2).toHaveBeenCalled()
  })
})
