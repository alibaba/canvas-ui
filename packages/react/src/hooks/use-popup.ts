import { Point, Rect, RenderCanvas, RenderObject, SyntheticPointerEvent } from '@canvas-ui/core'
import { assert } from '@canvas-ui/assert'
import { useEffect, useState } from 'react'

class PopupState<T extends RenderObject, U extends any = any> {

  hideTriggerOnOpen?: boolean

  private set binding(value: RenderCanvas | undefined) {
    if (this._binding === value) {
      return
    }
    if (this._binding) {
      this._binding.removeEventListener('frameEnd', this.handleFrameEnd)
    }
    this._binding = value
    if (this._binding) {
      this._binding.addEventListener('frameEnd', this.handleFrameEnd)
    }
  }
  private _binding?: RenderCanvas

  private readonly handleFrameEnd = () => {
    if (this.target && this._binding?.el && this.target.attached) {
      // getBoundingClientRect only exists on HTMLCanvasElement, not OffscreenCanvas
      // Skip positioning for OffscreenCanvas (which has no DOM position)
      if (this._binding.el instanceof HTMLCanvasElement) {
        const nodeBounds = this.target.getBoundingClientRect()
        const elBounds = this._binding.el.getBoundingClientRect()
        this.bounds = Rect.shift(nodeBounds, Point.fromXY(elBounds.left, elBounds.top))
      }
    }
  }

  get visible() {
    return this._visible
  }
  set visible(value) {
    if (value === this._visible) {
      return
    }
    if (this._visible) {
      this.binding = undefined
    }
    this._visible = value
    if (this._visible) {
      this.binding = this.target?.owner?.rootNode as RenderCanvas | undefined
    }
    if (this.hideTriggerOnOpen) {
      assert(this.target)
      this.target.hidden = this._visible
    }
    this.onVisibleChange?.(this._visible)
  }
  private _visible = false
  onVisibleChange?: (visible: boolean) => void

  get bounds() {
    return this._bounds
  }
  set bounds(value) {
    if (Rect.eq(value, this._bounds)) {
      return
    }
    this._bounds = value
    this.onBoundsChange?.(this._bounds)
  }
  private _bounds = Rect.zero
  onBoundsChange?: (bounds: Rect) => void

  close = () => {
    this.visible = false
    this._target = undefined
    this._payload = undefined
  }

  open = (target: T, payload?: U) => {
    if (target === this._target) {
      return
    }
    this._target = target
    this._payload = payload
    this.visible = true
    this.handleFrameEnd()
  }

  private _target?: T
  get target() {
    return this._target
  }
  private _payload?: U
  get payload() {
    return this._payload
  }

  private _handlePointerDown?: (event: SyntheticPointerEvent<T>) => void
  get handlePointerDown() {
    return this._handlePointerDown ??= event => {
      assert(event.target)
      this.open(event.target)
    }
  }

  private _handlePointerOver?: (event: SyntheticPointerEvent<T>) => void
  get handlePointerOver() {
    return this._handlePointerOver ??= event => {
      assert(event.target)
      this.open(event.target)
    }
  }
}

export type UsePopupOptions<T extends RenderObject, U extends any> = {
  hideTriggerOnOpen?: boolean
  onOpen?(state: PopupState<T, U>): void
  onUpdate?(state: PopupState<T, U>): void
  onClose?(state: PopupState<T, U>): void
}

export function usePopup<T extends RenderObject, U extends any = unknown>(options: UsePopupOptions<T, U>) {
  const [state] = useState(() => {
    return new PopupState<T, U>()
  })

  useEffect(() => {
    state.hideTriggerOnOpen = options.hideTriggerOnOpen
    state.onVisibleChange = (visible) => {
      if (visible) {
        options.onOpen?.(state)
      } else {
        options.onClose?.(state)
      }
    }
    state.onBoundsChange = () => {
      if (state.visible) {
        options.onUpdate?.(state)
      }
    }
    return () => {
      state.onVisibleChange = undefined
      state.onBoundsChange = undefined
    }
  }, [options, state])
  return state
}
