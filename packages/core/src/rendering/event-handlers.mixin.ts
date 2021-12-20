import type { SyntheticEventListener, SyntheticEventTarget } from '../events'

const EventKeys = [
  'onPointerMove',
  'onPointerOver',
  'onPointerEnter',
  'onPointerDown',
  'onPointerUp',
  'onPointerOut',
  'onPointerLeave',
  'onWheel',
] as const

export class EventHandlers {
  static mixin(ctor: { prototype: SyntheticEventTarget }) {
    const properties: Record<string, PropertyDescriptor & ThisType<SyntheticEventTarget & Record<string, SyntheticEventListener>>> = {}

    // 冒泡阶段
    EventKeys.forEach(key => {
      const slot = `_${key}`
      const type = key.substr(2).toLowerCase()
      properties[key] = {
        get() {
          return this[slot]
        },
        set(value) {
          if (this[slot]) {
            this.removeEventListener(type, this[slot])
          }
          this[slot] = value
          if (this[slot]) {
            this.addEventListener(type, this[slot])
          }
        }
      }
    })

    // 捕获阶段
    EventKeys.forEach(key => {
      const slot = `_${key}Capture`
      const type = key.substr(2).toLowerCase()
      properties[`${key}Capture`] = {
        get() {
          return this[slot]
        },
        set(value) {
          if (this[slot]) {
            this.removeEventListener(type, this[slot], { capture: true })
          }
          this[slot] = value
          if (this[slot]) {
            this.addEventListener(type, this[slot], { capture: true })
          }
        }
      }
    })

    Object.defineProperties(ctor.prototype, properties)

  }
}
