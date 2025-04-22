import {
  createElement,
  RenderObject,
  Size,
  SyntheticWheelEvent
} from '@canvas-ui/core'
import type { StoryObj } from '@storybook/react'
import React, { useEffect, useRef } from 'react'

export const WheelEventTest: StoryObj<React.FC> = () => {

  const canvasElRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    // 等待布局稳定
    setTimeout(() => {
      if (!canvasElRef.current) {
        return
      }

      const canvasRect = canvasElRef.current.getBoundingClientRect()
      const surfaceSize = Size.fromWH(canvasRect.width, canvasRect.height)

      const canvas = createElement('Canvas')
      canvas.prepareInitialFrame()
      canvas.el = canvasElRef.current
      canvas.size = surfaceSize
      canvas.dpr = devicePixelRatio

      //
      // 构造如下结构
      //        a   (Flex)
      //      / \ \
      //     b   c d
      //
      const a = createElement('Flex')
      canvas.child = a
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

      a.addEventListener('wheel', (event: SyntheticWheelEvent<RenderObject>) => {
        console.info('a', event.eventPhase)
      })

      a.addEventListener('wheel', (event: SyntheticWheelEvent<RenderObject>) => {
        console.info('a capture', event.eventPhase)
      }, { capture: true })

      d.addEventListener('wheel', (event: SyntheticWheelEvent<RenderObject>) => {
        event.stopPropagation()
        console.info('d', event.eventPhase, 'stopPropagation called')
      }, { capture: false })

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

WheelEventTest.storyName = 'WheelEvent'

export default {
  title: 'core/events',
  component: WheelEventTest,
  decorators: [(Story: React.ComponentType) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
