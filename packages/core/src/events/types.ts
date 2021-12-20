import type { Point } from '../math'
import type { HitTestResult } from '../rendering'
import type { SyntheticEvent } from './synthetic-event'
import type { SyntheticEventDispatcher } from './synthetic-event-dispatcher'

export type SyntheticEventListener<E extends SyntheticEvent<SyntheticEventTarget, Event> = SyntheticEvent<SyntheticEventTarget, Event>> = { bivarianceHack(event: E): void }['bivarianceHack']

export interface SyntheticEventTarget {
  addEventListener(type: string, listener: SyntheticEventListener, options?: boolean | AddEventListenerOptions): void
  dispatchEvent(event: SyntheticEvent<SyntheticEventTarget, UIEvent>): boolean
  removeEventListener(type: string, listener: SyntheticEventListener, options?: boolean | EventListenerOptions): void
  getDispatcher(): SyntheticEventDispatcher | undefined
}

export type NativePointerEvents = Record<number, {
  pointermove?: PointerEvent
  pointerenter?: PointerEvent
  pointerdown?: PointerEvent
  pointerup?: PointerEvent
  pointerleave?: PointerEvent
} & Record<string, PointerEvent>>

export interface NativeEventBinding {

  /**
   * 缓冲区有事件时调用该方法
   */
  onEvents?: () => void

  /**
   * 提取缓冲区的 PointerEvents 并清空缓冲区
   */
  flushPointerEvents(): NativePointerEvents

  /**
   * 提取缓冲区的 WheelEvent 并清空缓冲区
   */
  flushWheelEvent(): WheelEvent | undefined

  /**
   * 检查缓冲区是否有 WheelEvent
   */
  readonly hasWheelEvent: boolean

  /**
   * 检查当前绑定是否已绑定
   */
  readonly bound: boolean
}

/**
 * 命中检测对象的根节点
 */
export interface HitTestRoot {
  hitTestFromRoot(position: Point): HitTestResult
}
