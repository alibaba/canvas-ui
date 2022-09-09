import { assert } from '@canvas-ui/assert'
import { PointerEventSaveTarget, WheelEventSaveTarget } from './firefox-event-save-target'
import type { NativeEventBinding, NativePointerEvents } from './types'

export class DOMEventBinding implements NativeEventBinding {

  static get supportsPointerEvents() {
    return !!self.PointerEvent
  }

  static isFirefox = navigator.userAgent.toLowerCase().includes('firefox')

  onEvents?: () => void

  private _el?: HTMLElement
  get el() {
    return this._el
  }
  set el(value) {
    if (value === this._el) {
      return
    }
    if (this._el) {
      this.removeListeners()
    }
    this._el = value
    if (this._el) {
      this.addListeners()
    }
  }

  get bound() {
    return !!this._el
  }

  get document() {
    return this._el?.ownerDocument
  }

  private pointerEventsBuffer: NativePointerEvents = {}

  flushPointerEvents() {
    const { pointerEventsBuffer } = this
    this.pointerEventsBuffer = {}
    return pointerEventsBuffer
  }

  private wheelEvent?: WheelEvent

  flushWheelEvent() {
    const { wheelEvent } = this
    this.wheelEvent = undefined
    return wheelEvent
  }

  get hasWheelEvent() {
    return !!this.wheelEvent
  }

  private removeListeners() {
    const { _el, document } = this
    assert(_el)
    assert(document)

    if (DOMEventBinding.supportsPointerEvents) {
      _el.style.touchAction = 'none'
    }

    // pointer events
    _el.removeEventListener('pointermove', this, true)
    _el.removeEventListener('pointerenter', this, true)
    _el.removeEventListener('pointerdown', this, true)
    self.removeEventListener('pointerup', this, true)
    _el.removeEventListener('pointerleave', this, true)

    // wheel event
    _el.removeEventListener('wheel', this.handleWheelEvent, { capture: true })
  }

  private addListeners() {
    const { _el, document } = this
    assert(_el)
    assert(document)

    if (DOMEventBinding.supportsPointerEvents) {
      _el.style.touchAction = 'none'
    }

    // pointer events
    _el.addEventListener('pointermove', this, true)
    _el.addEventListener('pointerenter', this, true)
    _el.addEventListener('pointerdown', this, true)
    self.addEventListener('pointerup', this, true)
    _el.addEventListener('pointerleave', this, true)

    // wheel event
    _el.addEventListener('wheel', this.handleWheelEvent, { capture: true })
  }

  /**
   * 将 PointerEvents 写入缓冲区
   */
  handleEvent(event: PointerEvent) {
    let { type } = event
    if (event.target !== this._el) {
      type += 'outside'
    }
    if (this.pointerEventsBuffer[event.pointerId]) {
      this.pointerEventsBuffer[event.pointerId][type] = !DOMEventBinding.isFirefox
        ? event
        : new PointerEventSaveTarget(event)
    } else {
      this.pointerEventsBuffer[event.pointerId] = {
        [type]: !DOMEventBinding.isFirefox
          ? event
          : new PointerEventSaveTarget(event)
      }
    }
    this.onEvents?.()
  }

  /**
   * 将 WheelEvent 事件并写入缓冲区
   */
  handleWheelEvent = (event: WheelEvent) => {
    event.preventDefault()
    this.wheelEvent = !DOMEventBinding.isFirefox
      ? event
      : new WheelEventSaveTarget(event)
    this.onEvents?.()
  }

}
