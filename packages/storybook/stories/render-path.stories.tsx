import { createElement, DebugFlags, RenderPath, Size, SyntheticPointerEvent } from '@canvas-ui/core'
import type { StoryObj } from '@storybook/react'
import React, { useEffect, useRef } from 'react'

const PATH1 = `
M28,0.5
l-25.5,0
c-0.41421,0 -0.78921,0.16789 -1.06066,0.43934
c-0.27145,0.27145 -0.43934,0.64645 -0.43934,1.06066
l0,5.3
l0,8.35
l6,-7
l18,0
l6,7
l0,-8.35
l0,-5.3
c-0.03256,-0.38255 -0.20896,-0.724 -0.47457,-0.97045
c-0.26763,-0.24834 -0.62607,-0.40013 -1.01995,-0.40013z
`

const PATH2 = `
M10 80 Q 52.5 10, 95 80 T 180 80
`


export const RenderPathTest: StoryObj<React.FC> = () => {

  const canvasElRef = useRef<HTMLCanvasElement | null>(null)
  const prevFrameButtonRef = useRef<HTMLButtonElement | null>(null)
  const nextFrameButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    DebugFlags.set(DebugFlags.PathBounds)
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

      const originStyles = new WeakMap<RenderPath, Pick<RenderPath, 'stroke' | 'fill'>>()

      const handlePointerEvent = (event: SyntheticPointerEvent<RenderPath>) => {
        const target = event.target
        if (target instanceof RenderPath) {
          if (event.type === 'pointerover') {
            originStyles.set(target, {
              stroke: target.stroke,
              fill: target.fill,
            })
            if (target.stroke) {
              target.stroke = '#ff0000'
            }
            if (target.fill) {
              target.fill = 'rgba(255, 0, 0, 0.1)'
            }
          } else if (event.type === 'pointerout') {
            const styles = originStyles.get(target)
            if (styles) {
              target.stroke = styles.stroke
              target.fill = styles.fill
            }
          }
        }
      }

      //
      // 构造如下结构
      //        a   (Flex)
      //      / \ \
      //     b   c d
      //
      const a = createElement('Flex')
      // 否则会拉伸
      a.style.alignItems = 'flex-start'
      a.addEventListener('pointerover', handlePointerEvent)
      a.addEventListener('pointerout', handlePointerEvent)
      canvas.child = a
      const b = createElement('Path')
      b.repaintBoundary = true
      a.appendChild(b)
      const c = createElement('Path')
      a.appendChild(c)
      const d = createElement('Path')
      a.appendChild(d)

      type FrameCallback = () => void
      const frameCallbacks: readonly FrameCallback[] = [
        // 0: initial frame
        () => {
          b.fill = '#EFEFEF'
          b.style.boxShadow = '12px 12px 2px rgba(0, 0, 255, .2)'
          b.path = PATH1
          b.style.width = 200
          b.style.height = 200

          c.fill = '#FEFEFE'
          c.stroke = '#B5BAD0'
          c.strokeWidth = 1
          c.style.boxShadow = '12px 12px 2px rgba(0, 0, 255, .2)'
          c.path = PATH1

          d.stroke = '#CCCCCC'
          d.strokeWidth = 1
          d.style.boxShadow = '4px 4px 4px rgba(0, 0, 0, .2)'
          d.path = PATH2
          d.hitTestStrokeWidth = 8
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

RenderPathTest.storyName = 'RenderPath'

export default {
  title: 'core/rendering',
  component: RenderPathTest,
  decorators: [(Story: React.ComponentType) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
