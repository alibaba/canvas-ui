import { createElement, BridgeEventBinding, IFrameScheduler } from '@canvas-ui/core'
import { ReactNode, useLayoutEffect, useState, useRef } from 'react'
import { useBinding } from './binding'

export type InjectEventFn = (
  type: 'pointermove' | 'pointerdown' | 'pointerup' | 'pointerenter' | 'pointerleave',
  x: number,
  y: number,
  button?: number,
  pointerId?: number
) => void

export type InjectWheelEventFn = (
  x: number,
  y: number,
  deltaX: number,
  deltaY: number,
  deltaMode?: number
) => void

export interface HeadlessCanvasProps {
  canvas: OffscreenCanvas  // Required - user provides
  width: number
  height: number
  dpr?: number
  frameScheduler: IFrameScheduler  // Required - custom frame scheduler
  children: ReactNode
  onReady?: (api: {
    canvas: OffscreenCanvas
    injectEvent: InjectEventFn
    injectWheelEvent: InjectWheelEventFn
  }) => void
  onFrameEnd?: () => void  // Called when Canvas UI completes rendering
}

/**
 * Headless Canvas UI component that renders to OffscreenCanvas
 *
 * Unlike <Canvas>, this:
 * - Doesn't mount to DOM
 * - Accepts an OffscreenCanvas from the user
 * - Provides event injection API via onReady callback
 * - Designed for WebXR layers, workers, or manual rendering
 *
 * @example
 * ```tsx
 * const canvas = useMemo(() => new OffscreenCanvas(900, 600), [])
 *
 * <HeadlessCanvas
 *   canvas={canvas}
 *   width={900}
 *   height={600}
 *   frameScheduler={myCustomScheduler}
 *   onReady={({ injectEvent }) => {
 *     // Use injectEvent for XR pointer events
 *   }}
 * >
 *   <YourUI />
 * </HeadlessCanvas>
 * ```
 */
export function HeadlessCanvas({
  canvas,
  width,
  height,
  dpr = 1,
  frameScheduler,
  children,
  onReady,
  onFrameEnd
}: HeadlessCanvasProps) {
  const onReadyCalledRef = useRef(false)

  // Initialize RenderCanvas and BridgeEventBinding once using useState
  const [instances] = useState(() => {
    // Create BridgeEventBinding for programmatic event injection
    const bridgeBinding = new BridgeEventBinding()

    // Create RenderCanvas with the user-provided OffscreenCanvas
    // Pass frameScheduler, binding, and canvas to constructor
    const renderCanvas = createElement('Canvas', frameScheduler, bridgeBinding, canvas)
    renderCanvas.prepareInitialFrame()
    renderCanvas.dpr = dpr
    renderCanvas.size = { width, height }

    // Create injectEvent helper function
    const injectEvent: InjectEventFn = (type, x, y, button = 0, pointerId = 0) => {
      bridgeBinding.injectPointerEvent(type, x, y, button, pointerId)
    }

    // Create injectWheelEvent helper function
    const injectWheelEvent: InjectWheelEventFn = (x, y, deltaX, deltaY, deltaMode = 0) => {
      bridgeBinding.injectWheelEvent(x, y, deltaX, deltaY, deltaMode)
    }

    return { renderCanvas, bridgeBinding, injectEvent, injectWheelEvent }
  })

  const { renderCanvas, bridgeBinding, injectEvent, injectWheelEvent } = instances
  const binding = renderCanvas

  // Set onEvents callback to schedule frame on our custom scheduler
  useLayoutEffect(() => {
    bridgeBinding.onEvents = () => {
      frameScheduler.scheduleFrame()
    }

    return () => {
      bridgeBinding.onEvents = undefined
    }
  }, [frameScheduler, bridgeBinding])

  // Forward frameEnd events to onFrameEnd prop
  useLayoutEffect(() => {
    if (!onFrameEnd) return

    const handleFrameEnd = () => {
      onFrameEnd()
    }

    renderCanvas.addEventListener('frameEnd', handleFrameEnd)
    return () => {
      renderCanvas.removeEventListener('frameEnd', handleFrameEnd)
    }
  }, [renderCanvas, onFrameEnd])

  // Update size and dpr if changed
  useLayoutEffect(() => {
    canvas.width = width * dpr
    canvas.height = height * dpr
    binding.dpr = dpr
    binding.size = { width, height }
  }, [binding, canvas, width, height, dpr])

  // Call onReady when ready
  useLayoutEffect(() => {
    if (onReady && !onReadyCalledRef.current) {
      onReady({ canvas, injectEvent, injectWheelEvent })
      onReadyCalledRef.current = true
    }
  }, [onReady, canvas, injectEvent, injectWheelEvent])

  // Use Canvas UI's binding hook for React reconciliation
  useBinding({
    binding,
    left: 0,
    top: 0,
    width,
    height,
    children
  })

  // Headless - returns null
  return null
}
