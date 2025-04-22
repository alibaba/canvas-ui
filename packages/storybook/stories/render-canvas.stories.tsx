import { createElement, Point, Size } from '@canvas-ui/core'
import type { Story } from '@storybook/react'
import React, { useEffect, useRef } from 'react'

export const RenderCanvasTest: Story = () => {

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
      //     a - d (动态添加)
      //    / \
      //   b   c
      //

      const a = createElement('View')
      a.size = Size.fromWH(200, 200)
      const b = createElement('View')
      b.size = Size.fromWH(50, 50)
      b.offset = Point.fromXY(10, 10)
      a.appendChild(b)
      const c = createElement('View')
      c.size = Size.fromWH(50, 50)
      c.offset = Point.fromXY(30, 30)
      a.appendChild(c)

      const d = createElement('View')
      d.repaintBoundary = false
      d.size = Size.fromWH(50, 50)
      d.offset = Point.fromXY(60, 60)

      type FrameCallback = () => void
      const frameCallbacks: readonly FrameCallback[] = [
        // 0: initial frame
        () => {
          a.offset = Point.zero
          canvas.child = a
        },
        () => {
          a.offset = Point.fromXY(50, 50)
        },
        () => {
          d.repaintBoundary = true
        },
        () => {
          a.appendChild(d)
        },
        () => {
          d.repaintBoundary = false
        },
        () => {
          a.removeChild(d)
          d.repaintBoundary = true
        },
        () => {
          canvas.child = undefined
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

RenderCanvasTest.storyName = 'RenderCanvas'

export default {
  title: 'core/rendering',
  component: RenderCanvasTest,
  decorators: [(Story: Story) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
