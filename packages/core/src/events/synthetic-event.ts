import { assert } from '@canvas-ui/assert'
import type { SyntheticEventTarget } from './types'

export type SyntheticEventInit<T extends SyntheticEventTarget, N extends Event> = {
  nativeEvent?: N,
  bubbles?: boolean
  cancelable?: boolean
  path?: T[]
  target?: T
}

export class SyntheticEvent<T extends SyntheticEventTarget, N extends Event = Event> {

  constructor(
    readonly type: string,
    {
      nativeEvent,
      bubbles = false,
      cancelable = false,
      path = SyntheticEvent.SHARED_EMPTY_PATH,
      target,
    }: SyntheticEventInit<T, N>,
  ) {
    this.nativeEvent = nativeEvent
    this.bubbles = bubbles
    this.cancelable = cancelable
    this.path = path
    this.target = target ?? null
  }

  readonly nativeEvent?: N

  readonly bubbles: boolean

  readonly cancelable: boolean

  target: T | null = null

  currentTarget: T | null = null

  eventPhase = SyntheticEvent.NONE

  path: T[]

  composedPath() {
    return this.path
  }

  /**
   * 返回 nativeEvent.isTrusted
   */
  get isTrusted() {
    return this.nativeEvent?.isTrusted ?? false
  }

  /**
   * 返回 nativeEvent.timeStamp
   */
  get timeStamp() {
    return this.nativeEvent?.timeStamp ?? this._timeStamp
  }
  private readonly _timeStamp = Date.now()

  isDefaultPrevented() {
    return this.preventDefaultFlag
  }

  preventDefault(): void {
    // 分开处理原生和合成事件的 preventDefault
    if (this.nativeEvent?.cancelable) {
      this.nativeEvent.preventDefault()
    }

    if (this.cancelable) {
      this.preventDefaultFlag = true
    }
  }
  private preventDefaultFlag = false

  isImmediatePropagationStopped() {
    return this.stopImmediatePropagationFlag
  }
  stopImmediatePropagation(): void {
    this.stopImmediatePropagationFlag = true
  }
  private stopImmediatePropagationFlag = false

  isPropagationStopped() {
    return this.stopPropagationFlag
  }
  stopPropagation(): void {
    this.stopPropagationFlag = true
  }
  private stopPropagationFlag = false

  static NONE = 0

  static CAPTURING_PHASE = 1

  static AT_TARGET = 2

  static BUBBLING_PHASE = 3

  private static readonly SHARED_EMPTY_PATH: any[] = []

}

export interface SyntheticMouseEventInit<T extends SyntheticEventTarget, N extends MouseEvent = MouseEvent> extends SyntheticEventInit<T, N> {
  clientX?: number
  clientY?: number
  movementX?: number
  movementY?: number
  relatedTarget?: SyntheticEventTarget | null
  screenX?: number
  screenY?: number
  offsetX?: number
  offsetY?: number
}

export class SyntheticMouseEvent<T extends SyntheticEventTarget, N extends MouseEvent = MouseEvent>
  extends SyntheticEvent<T, N> {

  readonly clientX: number
  readonly clientY: number
  readonly movementX: number
  readonly movementY: number
  readonly offsetX: number
  readonly offsetY: number
  readonly relatedTarget: SyntheticEventTarget | null
  readonly screenX: number
  readonly screenY: number

  constructor(type: string, init: SyntheticMouseEventInit<T, N>) {
    super(type, init)
    this.clientX = init.clientX ?? 0
    this.clientY = init.clientY ?? 0
    this.movementX = init.movementX ?? 0
    this.movementY = init.movementY ?? 0
    this.relatedTarget = init.relatedTarget ?? null
    this.screenX = init.screenX ?? 0
    this.screenY = init.screenY ?? 0
    this.offsetX = init.offsetX ?? 0
    this.offsetY = init.offsetY ?? 0
  }

  get altKey() {
    assert(this.nativeEvent)
    return this.nativeEvent.altKey
  }

  get button() {
    assert(this.nativeEvent)
    return this.nativeEvent.button
  }

  get buttons() {
    assert(this.nativeEvent)
    return this.nativeEvent.buttons
  }

  get ctrlKey() {
    assert(this.nativeEvent)
    return this.nativeEvent.ctrlKey
  }

  get metaKey() {
    assert(this.nativeEvent)
    return this.nativeEvent.metaKey
  }

  get shiftKey() {
    assert(this.nativeEvent)
    return this.nativeEvent.shiftKey
  }

  getModifierState(keyArg: string) {
    assert(this.nativeEvent)
    return this.nativeEvent.getModifierState(keyArg)
  }

  get x() {
    return this.clientX
  }

  get y() {
    return this.clientY
  }

  get pageX() {
    assert(this.nativeEvent)
    return this.nativeEvent.pageX
  }

  get pageY() {
    assert(this.nativeEvent)
    return this.nativeEvent.pageY
  }

}

export class SyntheticPointerEvent<T extends SyntheticEventTarget>
  extends SyntheticMouseEvent<T, PointerEvent> {
  // todo(haocong): PointerEventInit

}

export interface SyntheticWheelEventInit<T extends SyntheticEventTarget> extends SyntheticMouseEventInit<T, WheelEvent> {
  deltaMode?: number
  deltaX?: number
  deltaY?: number
  deltaZ?: number
}

export class SyntheticWheelEvent<T extends SyntheticEventTarget>
  extends SyntheticMouseEvent<T, WheelEvent> {

  readonly deltaMode: number
  readonly deltaX: number
  readonly deltaY: number
  readonly deltaZ: number

  constructor(type: string, init: SyntheticWheelEventInit<T>) {
    super(type, init)
    this.deltaMode = init.deltaMode ?? 0
    this.deltaX = init.deltaX ?? 0
    this.deltaY = init.deltaY ?? 0
    this.deltaZ = init.deltaZ ?? 0
  }

  get DOM_DELTA_LINE() {
    return WheelEvent.DOM_DELTA_LINE
  }

  get DOM_DELTA_PAGE() {
    return WheelEvent.DOM_DELTA_PAGE
  }

  get DOM_DELTA_PIXEL() {
    return WheelEvent.DOM_DELTA_PIXEL
  }
}
