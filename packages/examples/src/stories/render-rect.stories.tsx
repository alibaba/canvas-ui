import { createElement, Size } from '@canvas-ui/core'
import type { Story } from '@storybook/react'
import React, { useEffect, useRef } from 'react'

export const RenderRectTest: Story = () => {

  const canvasElRef = useRef<HTMLCanvasElement | null>(null)
  const prevFrameButtonRef = useRef<HTMLButtonElement | null>(null)
  const nextFrameButtonRef = useRef<HTMLButtonElement | null>(null)

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

      type FrameCallback = () => void
      const frameCallbacks: readonly FrameCallback[] = [
        // 0: initial frame
        () => {
          b.style.height = 100
          b.fill = '#EFEFEF'
          b.style.boxShadow = '12px 12px 2px rgba(0, 0, 255, .2)'

          c.stroke = '#B5BAD0'
          c.strokeWidth = 4
          c.style.boxShadow = '12px 12px 2px rgba(0, 0, 255, .2)'

          d.fill = '#FEFEFE'
          d.stroke = '#CCCCCC'
          d.strokeWidth = 2
          d.style.boxShadow = '4px 4px 4px rgba(0, 0, 0, .2)'
        },
        () => {
          b.style.height = undefined
        }
      ]

      let frame = -1
      const play = (direction = 1) => {
        frame += direction
        if (frame >= frameCallbacks.length) {
          frame = 0
        } else if (frame < 0) {
          frame = frameCallbacks.length - 1
        }
        frameCallbacks[frame]()
      }
      // 绘制首帧
      play()

      prevFrameButtonRef.current?.addEventListener('click', () => {
        play(-1)
      })

      nextFrameButtonRef.current?.addEventListener('click', () => {
        play(1)
      })

    }, 100)

  }, [canvasElRef])

  return (
    <>
      <div>
        <button ref={prevFrameButtonRef}>prev frame</button>
        <button ref={nextFrameButtonRef}>next frame</button>
      </div>
      <canvas style={{ backgroundColor: '#ffffff', width: '500px', height: '500px' }} ref={canvasElRef}></canvas>
    </>
  )
}

RenderRectTest.storyName = 'RenderRect'

export default {
  title: 'core/rendering',
  component: RenderRectTest,
  decorators: [(Story: Story) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
