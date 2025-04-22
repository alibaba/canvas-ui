import {
  createElement,
  DebugFlags,
  RenderObject,
  RenderShape,
  Size,
  SyntheticPointerEvent
} from '@canvas-ui/core'
import type { StoryObj } from '@storybook/react'
import React, { useEffect, useRef } from 'react'

export const PointerEventsTest: StoryObj<React.FC> = () => {

  const canvasElRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    // 等待布局稳定
    setTimeout(() => {
      if (!canvasElRef.current) {
        return
      }

      DebugFlags.set(DebugFlags.NodeBounds)

      const canvasRect = canvasElRef.current.getBoundingClientRect()
      const surfaceSize = Size.fromWH(canvasRect.width, canvasRect.height)

      const canvas = createElement('Canvas')
      canvas.prepareInitialFrame()
      canvas.el = canvasElRef.current
      canvas.size = surfaceSize
      canvas.dpr = devicePixelRatio

      //
      // 构造如下结构
      //        r    (View)
      //        a   (Flex)
      //      / \ \
      //     b   c d
      //
      const r = createElement('View')
      r.style.left = 100
      r.style.width = 280
      r.style.height = 250
      canvas.child = r
      const a = createElement('Flex')
      r.appendChild(a)
      a.style.left = -100
      const b = createElement('Rect')
      b.style.width = 100
      b.style.height = 100
      b.repaintBoundary = true
      a.appendChild(b)
      const c = createElement('Rect')
      c.style.width = 100
      c.style.height = 200
      a.appendChild(c)
      const d = createElement('Rect')
      d.style.width = 200
      d.style.height = 300
      a.appendChild(d)

      b.style.height = 100
      b.fill = '#FF0000'
      c.stroke = '#00FF00'
      c.strokeWidth = 4
      d.fill = '#CCCCCC'
      d.stroke = '#333333'
      d.strokeWidth = 2

      const originFillMap = new WeakMap<RenderShape, string | undefined>()

      const aHandleEvent = (event: SyntheticPointerEvent<RenderObject>) => {
        const { target, type } = event
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.info('a', type, (event.target as any).constructor.name)
        if (target instanceof RenderShape) {
          if (type === 'pointerover') {
            originFillMap.set(target, target.fill)
            target.fill = '#FFFF00'
          } else if (type === 'pointerout') {
            target.fill = originFillMap.get(target)
          }
        }
      }
      a.addEventListener('pointermove', aHandleEvent)
      a.addEventListener('pointerover', aHandleEvent)
      a.addEventListener('pointerenter', aHandleEvent)
      a.addEventListener('pointerdown', aHandleEvent)
      a.addEventListener('pointerup', aHandleEvent)
      a.addEventListener('pointerout', aHandleEvent)
      a.addEventListener('pointerleave', aHandleEvent)
      return () => {
        a.removeEventListener('pointermove', aHandleEvent)
        a.removeEventListener('pointerover', aHandleEvent)
        a.removeEventListener('pointerenter', aHandleEvent)
        a.removeEventListener('pointerdown', aHandleEvent)
        a.removeEventListener('pointerup', aHandleEvent)
        a.removeEventListener('pointerout', aHandleEvent)
        a.removeEventListener('pointerleave', aHandleEvent)
      }
    }, 100)

  }, [canvasElRef])

  return (
    <>
      <div>
        See console outputs.
      </div>
      <canvas style={{ backgroundColor: '#ffffff', width: '500px', height: '500px' }} ref={canvasElRef}></canvas>
    </>
  )
}

PointerEventsTest.storyName = 'PointerEvents'

export default {
  title: 'core/events',
  component: PointerEventsTest,
  decorators: [(Story: React.ComponentType) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
