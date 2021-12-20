import EventEmitter from 'eventemitter3'
import type { SyntheticEvent } from './synthetic-event'
import type { SyntheticEventListener, SyntheticEventTarget } from './types'

type EventListeners =
  | { fn: SyntheticEventListener, once: boolean }[]
  | {
    fn: SyntheticEventListener
    once: boolean
  }

type EventEmitterEvents = Record<string, EventListeners>

/**
 * EventKey 会根据是否 capture 决定后缀
 * 
 * 以 `click` 为例，在 capture 阶段会被转换为 `clickcapture`
 * 
 */
type EventKey = string & { tag: 'EventKey' }

export class SyntheticEventDispatcher extends EventEmitter {

  /**
   * _events 是 EventEmitter 的私有成员
   */
  declare private _events: EventEmitterEvents

  addEventListener(type: string, listener: SyntheticEventListener, options?: boolean | AddEventListenerOptions): void {
    const capture = typeof options === 'boolean'
      ? options
      : options?.capture

    this.addListener(
      SyntheticEventDispatcher.getEventKey(type, capture),
      listener,
    )
  }

  static getEventKey(type: string, capture?: boolean): EventKey {
    return (capture ? `${type}capture` : type) as EventKey
  }

  /**
   * 发射一个事件
   * 
   * 在内部会判断 isImmediatePropagationStopped() 然后停止剩余事件处理函数
   * 
   * @param key 指定事件类型，可以通过 SyntheticEventDispatcher.getEventKey 获得
   * @param event 要发射的事件
   * @returns 
   */
  emitEvent(key: EventKey, event: SyntheticEvent<SyntheticEventTarget, Event>): void {
    // 没有任何事件
    if (!this._events[key]) {
      return
    }
    const listeners = this._events[key]

    if ('fn' in listeners) {
      if (listeners.once) this.removeListener(key, listeners.fn, undefined, true)
      listeners.fn.call(this, event)
    } else {
      const n = listeners.length
      for (let i = 0; i < n && !event.isImmediatePropagationStopped(); i++) {
        if (listeners[i].once) {
          this.removeListener(key, listeners[i].fn, undefined, true)
        }
        listeners[i].fn.call(this, event)
      }
    }
  }

  removeEventListener(type: string, listener: SyntheticEventListener, options?: boolean | EventListenerOptions): void {
    const capture = typeof options === 'boolean'
      ? options
      : options?.capture

    this.removeListener(
      SyntheticEventDispatcher.getEventKey(type, capture),
      listener,
    )
  }
}
