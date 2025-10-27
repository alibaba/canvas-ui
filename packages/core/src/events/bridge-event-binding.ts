import type { NativeEventBinding, NativePointerEvents, SyntheticEventTarget } from '../events/types'

/**
 * BridgeEventBinding - A NativeEventBinding implementation for programmatic event injection.
 *
 * This class bridges external event sources (DOM events, XR controller events, test playback)
 * to Canvas UI's event processing system. Unlike DOMEventBinding which listens to DOM events,
 * BridgeEventBinding allows manual injection of events programmatically.
 *
 * Usage:
 * ```ts
 * const bridgeBinding = new BridgeEventBinding()
 *
 * // Pass to RenderCanvas constructor (recommended)
 * const canvas = new RenderCanvas(undefined, bridgeBinding)
 * canvas.prepareInitialFrame()
 *
 * // Later, inject events:
 * bridgeBinding.injectPointerEvent('pointermove', x, y, 0, 0)
 * bridgeBinding.injectPointerEvent('pointerdown', x, y, 0, 0)
 * ```
 */
export class BridgeEventBinding implements NativeEventBinding {
  private pointerEventsBuffer: NativePointerEvents = {}
  private wheelEvent?: WheelEvent
  private _el?: HTMLElement

  /**
   * Callback invoked when events are added to the buffer.
   * Canvas UI uses this to schedule frame rendering.
   */
  onEvents?: () => void

  /**
   * Always returns true since programmatic binding is always "bound"
   */
  get bound() {
    return true
  }

  /**
   * No-op element setter - BridgeEventBinding doesn't use DOM elements
   * Returns a fake element for testing
   */
  get el() {
    // If no element is set, create a fake one
    if (!this._el) {
      this._el = {
        setPointerCapture: () => {},
        releasePointerCapture: () => {},
      } as any
    }
    return this._el
  }
  set el(value) {
    this._el = value
  }

  /**
   * Stub - pointer capture not implemented for BridgeEventBinding
   */
  registerPointerCapture(_target: SyntheticEventTarget, _pointerId: number): void {
    // No-op stub
  }

  /**
   * Stub - pointer capture not implemented for BridgeEventBinding
   */
  unregisterPointerCapture(_pointerId: number): void {
    // No-op stub
  }

  /**
   * Stub - pointer capture not implemented for BridgeEventBinding
   */
  getCapturedTarget(_pointerId: number): SyntheticEventTarget | undefined {
    return undefined
  }

  /**
   * Stub - pointer capture not implemented for BridgeEventBinding
   */
  isPointerCaptured(_pointerId: number): boolean {
    return false
  }

  /**
   * Check if there's a wheel event in the buffer
   */
  get hasWheelEvent() {
    return !!this.wheelEvent
  }

  /**
   * Inject a pointer event programmatically.
   *
   * @param type - Event type (pointermove, pointerdown, pointerup, pointerenter, pointerleave)
   * @param x - X coordinate in canvas space (offsetX)
   * @param y - Y coordinate in canvas space (offsetY)
   * @param button - Mouse button (0 = left, 1 = middle, 2 = right)
   * @param pointerId - Pointer ID for multi-touch (default 0)
   */
  injectPointerEvent(
    type: 'pointermove' | 'pointerdown' | 'pointerup' | 'pointerenter' | 'pointerleave',
    x: number,
    y: number,
    button: number = 0,
    pointerId: number = 0
  ) {
    // Create a synthetic PointerEvent-like object
    const event = {
      type,
      offsetX: x,
      offsetY: y,
      button,
      pointerId,
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      movementX: 0,
      movementY: 0,
      timeStamp: performance.now(),
    } as PointerEvent

    // Add to buffer, keyed by pointerId
    if (!this.pointerEventsBuffer[pointerId]) {
      this.pointerEventsBuffer[pointerId] = {}
    }
    this.pointerEventsBuffer[pointerId][type] = event

    // Notify that events are available (triggers frame scheduling)
    this.onEvents?.()
  }

  /**
   * Inject a wheel (scroll) event programmatically.
   *
   * @param x - X coordinate in canvas space
   * @param y - Y coordinate in canvas space
   * @param deltaX - Horizontal scroll amount
   * @param deltaY - Vertical scroll amount
   * @param deltaMode - Delta mode (0 = pixels, 1 = lines, 2 = pages)
   */
  injectWheelEvent(
    x: number,
    y: number,
    deltaX: number,
    deltaY: number,
    deltaMode: number = 0
  ) {
    // Create a synthetic WheelEvent-like object with mock preventDefault
    this.wheelEvent = {
      type: 'wheel',
      offsetX: x,
      offsetY: y,
      deltaX,
      deltaY,
      deltaZ: 0,
      deltaMode,
      bubbles: true,
      cancelable: true,
      timeStamp: performance.now(),
      preventDefault: () => {
        // Mock preventDefault for testing
      },
      stopPropagation: () => {
        // Mock stopPropagation for testing
      },
    } as WheelEvent

    // Notify that events are available
    this.onEvents?.()
  }

  /**
   * Flush all buffered pointer events and clear the buffer.
   * Called by SyntheticEventManager during event processing.
   */
  flushPointerEvents(): NativePointerEvents {
    const buffer = this.pointerEventsBuffer
    this.pointerEventsBuffer = {}
    return buffer
  }

  /**
   * Flush the buffered wheel event and clear it.
   * Called by SyntheticEventManager during event processing.
   */
  flushWheelEvent(): WheelEvent | undefined {
    const event = this.wheelEvent
    this.wheelEvent = undefined
    return event
  }
}
