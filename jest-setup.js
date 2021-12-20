/* eslint-disable no-undef */

// 由于 JSDOM 的 PointerEvent 是 ES6 版本的
// 为了避免 ts 转译到 es5 又继承自 es6 class 的冲突，单独 Polyfill 到这里
class PointerEventShim extends MouseEvent {

  constructor(type, eventInitDict) {
    super(type, eventInitDict)
    if (eventInitDict) {
      this.pointerId = eventInitDict.pointerId || 0
      this.width = eventInitDict.width || 0
      this.height = eventInitDict.height || 0
      this.pressure = eventInitDict.pressure || 0
      this.tiltX = eventInitDict.tiltX || 0
      this.tiltY = eventInitDict.tiltY || 0
      this.pointerType = eventInitDict.pointerType || ''
      this.isPrimary = eventInitDict.isPrimary || false
      this.tangentialPressure = eventInitDict.tangentialPressure || 0
      this.twist = eventInitDict.twist || 0
    } else {
      this.pointerId = 0
      this.width = 0
      this.height = 0
      this.pressure = 0
      this.tiltX = 0
      this.tiltY = 0
      this.pointerType = ''
      this.isPrimary = false
      this.tangentialPressure = 0
      this.twist = 0
    }
  }

  getCoalescedEvents() {
    return []
  }

  getPredictedEvents() {
    return []
  }
}

PointerEventShim.constructor.name = 'PointerEvent'

self.PointerEvent = PointerEventShim
