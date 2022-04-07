import { createElement, DebugFlags, Point, Shader, Size } from '@canvas-ui/core'
import type { Story } from '@storybook/react'
import React, { useEffect, useRef } from 'react'

export const RenderFlexTest: Story = () => {

  const canvasElRef = useRef<HTMLCanvasElement | null>(null)
  const prevFrameButtonRef = useRef<HTMLButtonElement | null>(null)
  const nextFrameButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    DebugFlags.set(
      DebugFlags.NodeBounds
      | DebugFlags.LayerBounds
      | DebugFlags.RasterCacheWaterMark
    )
    return () => {
      DebugFlags.set(0)
    }
  }, [])

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
      //       a (View)
      //      / \
      //     b   c
      //    / \  \
      //   d   e  f
      //  / \
      // g   h (动态添加)
      const a = createElement('View')
      a.id = 'a'
      a.size = Size.fromWH(400, 400) // size 不对子节点造成约束
      a.style.borderRadius = 32
      a.style.borderImage = Shader.fromLinearGradient(
        Point.fromSize(a.size),
        Point.fromXY(0, 0),
        [{
          offset: 0,
          color: '#83a4d4',
        }, {
          offset: 1,
          color: '#b6fbff',
        }]
      )
      a.style.borderWidth = 4
      a.style.boxShadow = '12px 12px 2px rgba(0, 0, 255, .2)'
      a.style.backgroundImage = Shader.fromLinearGradient(
        Point.fromXY(0, 0),
        Point.fromSize(a.size),
        [{
          offset: 0,
          color: '#83a4d4',
        }, {
          offset: 1,
          color: '#b6fbff',
        }]
      )
      const b = createElement('Flex')
      b.id = 'b'
      b.style.width = 490 // 允许超出父节点
      b.style.height = 200
      a.appendChild(b)
      const c = createElement('Flex')
      c.id = 'c'
      c.style.width = 450 // 允许超出父节点
      c.style.height = 200
      c.offset = Point.fromXY(0, 200)
      a.appendChild(c)

      const d = createElement('Flex')
      d.id = 'd'
      d.style.width = 50
      d.style.height = 50

      const e = createElement('Flex')
      e.id = 'e'
      e.style.width = 50
      e.style.height = 100

      const g = createElement('View')
      g.id = 'g'
      g.style.width = 25
      g.style.height = 25
      g.style.position = 'absolute'
      g.style.left = 33
      g.style.top = 33

      const h = createElement('View')
      h.id = 'h'
      h.style.width = 25
      h.style.height = 50
      h.style.position = 'absolute'
      h.style.right = 10
      h.style.top = 10

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
          b.appendChild(d)
          b.appendChild(e)
        },
        () => {
          d.appendChild(g)
          d.appendChild(h)
        },
        () => {
          b.removeChild(d)
          b.removeChild(e)
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
        console.info('frame', frame)
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

RenderFlexTest.storyName = 'RenderFlex'

export default {
  title: 'core/rendering',
  component: RenderFlexTest,
  decorators: [(Story: Story) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
