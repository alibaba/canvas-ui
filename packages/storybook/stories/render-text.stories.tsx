import { createElement, Size } from '@canvas-ui/core'
import type { Story } from '@storybook/react'
import React, { useEffect, useRef } from 'react'

const LONG_WORD = `Honorificabilitudinitatibus califragilisticexpialidocious Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu 次の単語グレートブリテンおよび北アイルランド連合王国で本当に大きな言葉。`

const SHORT_WORD = `任务 0-0`.repeat(11)

export const RenderTextTest: Story = () => {

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
      //      root
      //       \
      //        a   (Flex)
      //      / \ \
      //     b   c d
      //
      const root = createElement('View')
      canvas.child = root
      const a = createElement('Flex')
      root.appendChild(a)
      const b = createElement('Text')
      b.style.marginTop = 10
      b.style.marginLeft = 10
      b.style.maxWidth = 200
      b.style.maxHeight = 200
      b.text = `节点 id: b`
      b.repaintBoundary = true
      a.appendChild(b)
      const c = createElement('Text')
      c.style.width = 100
      c.style.height = 200
      c.style.borderColor = '#B5BAD0'
      c.style.borderRadius = 4
      c.style.borderWidth = 1
      c.style.backgroundColor = '#FFFFFF'
      c.style.boxShadow = '12px 12px 2px rgba(0, 0, 255, .2)'
      c.text = `节点 id: c`
      a.appendChild(c)
      const d = createElement('Text')
      d.style.marginTop = 10
      d.style.width = 192
      d.style.height = 300
      d.style.maxLines = 1
      d.style.fontSize = 14
      d.text = SHORT_WORD
      d.repaintBoundary = true
      a.appendChild(d)

      const e = createElement('Text')
      e.style.borderColor = '#B5BAD0'
      e.style.borderRadius = 4
      e.style.borderWidth = 1
      e.style.backgroundColor = '#FFFFFF'
      e.style.boxShadow = '12px 12px 2px rgba(0, 0, 255, .2)'
      e.style.paddingLeft = 8
      e.style.paddingRight = 8
      e.style.paddingTop = 8
      e.style.paddingBottom = 8
      e.style.lineHeight = 16
      e.style.fontSize = 16
      e.style.maxWidth = 70
      e.style.maxLines = 1
      e.style.left = 100
      e.style.top = 100
      e.text = `节点 id: e`
      root.appendChild(e)

      const f = createElement('Text')
      f.style.borderColor = '#B5BAD0'
      f.style.borderRadius = 4
      f.style.borderWidth = 1
      f.style.backgroundColor = '#FFFFFF'
      f.style.boxShadow = '12px 12px 2px rgba(0, 0, 255, .2)'
      f.style.paddingLeft = 8
      f.style.paddingRight = 8
      f.style.paddingTop = 8
      f.style.paddingBottom = 8
      f.style.lineHeight = 16
      f.style.fontSize = 16
      f.style.width = 200
      f.style.maxLines = 1
      f.style.textAlign = 'center'
      f.text = `节点 f: 单行居中`
      root.appendChild(f)

      type FrameCallback = () => void
      const frameCallbacks: readonly FrameCallback[] = [
        // 0: initial frame
        () => {
          b.style.color = '#ff0000'
          b.style.maxWidth = 180
          b.text = `啤酒 🍺 b.style.maxHeight = 180\n${LONG_WORD}`
        },
        () => {
          b.style.color = '#000'
          b.style.maxWidth = 200
          b.text = `b.style.maxHeight = 200\n${LONG_WORD}`
        },
        () => {
          d.style.lineHeight = 16
        },
        () => {
          d.style.lineHeight = 20
        },
        () => {
          d.style.marginTop = 30
        },
        () => {
          d.style.marginTop = 0
        },
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

RenderTextTest.storyName = 'RenderText'

export default {
  title: 'core/rendering',
  component: RenderTextTest,
  decorators: [(Story: Story) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
