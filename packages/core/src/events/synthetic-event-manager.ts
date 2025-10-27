import { assert } from '@canvas-ui/assert'
import { Point } from '../math'
import {
  SyntheticEvent,
  SyntheticPointerEvent,
  SyntheticWheelEvent
} from './synthetic-event'
import { SyntheticEventDispatcher } from './synthetic-event-dispatcher'
import type {
  HitTestRoot,
  NativeEventBinding,
  NativePointerEvents,
  SyntheticEventTarget
} from './types'

class PointerState {

  /**
   * 指针位置
   */
  position = Point.zero

  /**
   * 命中路径
   */
  path?: SyntheticEventTarget[]

  /**
   * 指针位于 target (path[0]) 内的位置
   */
  offset?: Point

  /**
   * 指示是否已 pointerdown
   */
  isPointerDown = false

}

export class SyntheticEventManager {

  private _rootNode?: HitTestRoot
  get rootNode() {
    return this._rootNode
  }
  set rootNode(value) {
    if (this._rootNode !== value) {
      if (this._rootNode) {
        SyntheticEventManager.instances.delete(this._rootNode)
      }
      this._rootNode = value
      if (this._rootNode) {
        SyntheticEventManager.instances.set(this._rootNode, this)
      }
    }
  }

  binding?: NativeEventBinding

  /**
   * 主指针状态
   */
  private primaryPointerState = new PointerState()

  /**
   * 滚轮状态
   */
  private wheelState = new PointerState()

  flushNativeEvents() {
    assert(this.binding)
    const wheelEvent = this.binding.flushWheelEvent()

    // 如果有滚动事件则只处理滚动事件
    if (wheelEvent) {
      this.handleWheelEvent(wheelEvent)
    } else {
      this.handlePointerEvents(this.binding.flushPointerEvents())
    }
  }

  private handleWheelEvent(wheelEvent: WheelEvent) {
    const { offsetX, offsetY } = wheelEvent
    const { wheelState } = this
    wheelState.position = Point.fromXY(offsetX, offsetY)
    assert(this.rootNode)
    const result = this.rootNode.hitTestFromRoot(wheelState.position)
    wheelState.path = result.path.map(it => it.target)
    wheelState.offset = result.path[0].position
    assert(wheelState.path)
    assert(wheelState.offset)
    const event = new SyntheticWheelEvent('wheel', {
      nativeEvent: wheelEvent,
      bubbles: wheelEvent.bubbles,
      cancelable: wheelEvent.cancelable,
      path: wheelState.path,
      target: wheelState.path[0],
      deltaMode: wheelEvent.deltaMode,
      deltaX: wheelEvent.deltaX,
      deltaY: wheelEvent.deltaY,
      deltaZ: wheelEvent.deltaZ,
      offsetX: wheelState.offset.x,
      offsetY: wheelState.offset.y,
      screenX: wheelState.position.x,
      screenY: wheelState.position.y,
    })
    this.dispatchEvent(event)

    // Only prevent default on the native event if a Canvas UI component
    // actually handled it (called preventDefault on the synthetic event)
    const prevented = event.isDefaultPrevented()
    if (prevented) {
      wheelEvent.preventDefault()
    }
  }

  private handlePointerEvents(pointerEvents: NativePointerEvents) {
    for (const pointerId in pointerEvents) {

      const {
        pointermove,
        pointerdown,
        pointerup,
        pointerleave,
      } = pointerEvents[pointerId]

      const { primaryPointerState } = this
      if (pointerleave) {
        const lastPath = primaryPointerState.path
        // 当 pointerleave 时不需要检测，清空 path 即可
        primaryPointerState.path = undefined
        const lastState = {
          path: lastPath,
          offset: primaryPointerState.offset,
          position: primaryPointerState.position,
        }
        if (lastPath) {
          this.dispatchEvent(this.createSyntheticPointerEvent(
            'pointerout',
            pointerleave,
            lastState,
          ))
          this.dispatchEventAtTarget(this.createSyntheticPointerEvent(
            'pointerleave',
            pointerleave,
            lastState,
          ))
        }
      }

      if (pointermove) {
        primaryPointerState.position = Point.fromXY(pointermove.offsetX, pointermove.offsetY)
        assert(this.rootNode)

        const lastPath = primaryPointerState.path

        const result = this.rootNode.hitTestFromRoot(primaryPointerState.position)
        primaryPointerState.path = result.path.map(it => it.target)
        primaryPointerState.offset = result.path[0].position
        const event = this.createSyntheticPointerEvent(
          'pointermove',
          pointermove,
          primaryPointerState,
        )
        this.dispatchEvent(event)

        // 处理 out 和 leave
        // pointerout/over fires when the direct target changes
        if (lastPath && lastPath[0] !== primaryPointerState.path[0]) {
          const lastState = {
            path: lastPath,
            offset: primaryPointerState.offset,
            position: primaryPointerState.position,
          }
          this.dispatchEvent(this.createSyntheticPointerEvent(
            'pointerout',
            pointermove,
            lastState,
          ))
          this.dispatchEvent(this.createSyntheticPointerEvent(
            'pointerover',
            pointermove,
            primaryPointerState,
          ))
        }

        // pointerenter/leave should only fire when crossing element boundaries
        // Check which elements are in one path but not the other
        if (lastPath) {
          const currentPath = primaryPointerState.path

          // Find elements that were left (in lastPath but not in currentPath)
          const leftElements = lastPath.filter(el => !currentPath.includes(el))

          // Find elements that were entered (in currentPath but not in lastPath)
          const enteredElements = currentPath.filter(el => !lastPath.includes(el))

          // Fire pointerleave for each element that was left
          for (const element of leftElements) {
            const leaveState = {
              path: [element],
              offset: primaryPointerState.offset,
              position: primaryPointerState.position,
            }
            this.dispatchEventAtTarget(this.createSyntheticPointerEvent(
              'pointerleave',
              pointermove,
              leaveState,
            ))
          }

          // Fire pointerenter for each element that was entered
          for (const element of enteredElements) {
            const enterState = {
              path: [element],
              offset: primaryPointerState.offset,
              position: primaryPointerState.position,
            }
            this.dispatchEventAtTarget(this.createSyntheticPointerEvent(
              'pointerenter',
              pointermove,
              enterState,
            ))
          }
        }
      }

      if (pointerdown) {
        primaryPointerState.isPointerDown = true
        primaryPointerState.position = Point.fromXY(pointerdown.offsetX, pointerdown.offsetY)
        assert(this.rootNode)
        const result = this.rootNode.hitTestFromRoot(primaryPointerState.position)
        primaryPointerState.path = result.path.map(it => it.target)
        primaryPointerState.offset = result.path[0].position
        const event = this.createSyntheticPointerEvent(
          'pointerdown',
          pointerdown,
          primaryPointerState,
        )
        this.dispatchEvent(event)
      }

      if (pointerup) {
        primaryPointerState.isPointerDown = false
        primaryPointerState.position = Point.fromXY(pointerup.offsetX, pointerup.offsetY)
        assert(this.rootNode)
        const result = this.rootNode.hitTestFromRoot(primaryPointerState.position)
        primaryPointerState.path = result.path.map(it => it.target)
        primaryPointerState.offset = result.path[0].position
        const event = this.createSyntheticPointerEvent(
          'pointerup',
          pointerup,
          primaryPointerState,
        )
        this.dispatchEvent(event)
      }
    }
  }

  private dispatchEventAtTarget(event: SyntheticEvent<SyntheticEventTarget, Event>): boolean {
    event.eventPhase = SyntheticEvent.AT_TARGET
    const currentTarget = event.composedPath()[0]
    event.currentTarget = currentTarget
    currentTarget.getDispatcher()?.emitEvent(SyntheticEventDispatcher.getEventKey(event.type), event)
    return !event.isDefaultPrevented()
  }

  dispatchEvent(event: SyntheticEvent<SyntheticEventTarget, Event>): boolean {
    assert(event.target, 'event.target 不能是 null')

    // composedPath 的第一个节点等于 target，最后一个节点是根节点 (一般是 RenderCanvas)
    const composedPath = event.composedPath()
    assert(composedPath[0] === event.target, 'event.composedPath()[0] !== event.target')

    const n = composedPath.length

    // CAPTURING_PHASE: 从尾部开始遍历
    event.eventPhase = SyntheticEvent.CAPTURING_PHASE
    let key = SyntheticEventDispatcher.getEventKey(event.type, true)

    for (let i = n - 1; i > 0 && this.shouldPropagate(event); i--) {
      const currentTarget = composedPath[i]
      event.currentTarget = currentTarget
      currentTarget.getDispatcher()?.emitEvent(key, event)
    }

    // AT_TARGET
    if (this.shouldPropagate(event)) {
      event.eventPhase = SyntheticEvent.AT_TARGET
      const currentTarget = composedPath[0]
      event.currentTarget = currentTarget
      key = SyntheticEventDispatcher.getEventKey(event.type)
      currentTarget.getDispatcher()?.emitEvent(key, event)
    }

    // BUBBLING_PHASE: 从头部开始遍历
    event.eventPhase = SyntheticEvent.BUBBLING_PHASE
    for (let i = 1; i < n && this.shouldPropagate(event); i++) {
      const currentTarget = composedPath[i]
      event.currentTarget = currentTarget
      currentTarget.getDispatcher()?.emitEvent(key, event)
    }

    // 流程走完后的清理
    event.currentTarget = null

    return !event.isDefaultPrevented()
  }

  private shouldPropagate(event: Pick<SyntheticEvent<SyntheticEventTarget, Event>, 'isPropagationStopped' | 'isImmediatePropagationStopped'>) {
    return !(event.isPropagationStopped() || event.isImmediatePropagationStopped())
  }

  private createSyntheticPointerEvent(
    type: string,
    nativeEvent: PointerEvent,
    pointerState: Pick<PointerState, 'path' | 'offset' | 'position'>,
  ) {
    assert(pointerState.path)
    assert(pointerState.offset)
    const event = new SyntheticPointerEvent(type, {
      nativeEvent,
      bubbles: nativeEvent.bubbles,
      cancelable: nativeEvent.cancelable,
      path: pointerState.path,
      target: pointerState.path[0],
      clientX: nativeEvent.clientX,
      clientY: nativeEvent.clientY,
      movementX: nativeEvent.movementX,
      movementY: nativeEvent.movementY,
      relatedTarget: null,
      offsetX: pointerState.offset.x,
      offsetY: pointerState.offset.y,
      screenX: pointerState.position.x,
      screenY: pointerState.position.y,
    })
    return event
  }

  private static instances = new WeakMap<HitTestRoot, SyntheticEventManager>()
  static findInstance(root: HitTestRoot) {
    return SyntheticEventManager.instances.get(root)
  }

}
