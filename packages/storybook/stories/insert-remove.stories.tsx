import { createElement, DebugFlags, Size } from '@canvas-ui/core'
import type { StoryObj } from '@storybook/react'
import React, { useEffect, useRef } from 'react'

export const InsertRemoveTest: StoryObj<React.FC> = () => {

  const canvasElRef = useRef<HTMLCanvasElement | null>(null)
  const removeButtonRef = useRef<HTMLButtonElement | null>(null)
  const addButtonRef = useRef<HTMLButtonElement | null>(null)
  const reflowButtonRef = useRef<HTMLButtonElement | null>(null)

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
      canvas.id = 'canvas'

      const container = createElement('View')
      container.id = 'a'
      container.style.width = 400
      container.style.height = 400
      container.style.borderColor = '#000000'
      container.style.borderWidth = 4

      const createRow = (id: string, y = 0) => {
        const w = 100
        const h = 30
        const row = createElement('View')
        row.id = id
        row.style.backgroundColor = '#999999'
        row.style.width = w
        row.style.height = h
        row.style.left = 0
        row.style.top = y

        const textContainer = createElement('Flex')
        textContainer.id = `${id}/textContainer`
        Object.assign(textContainer.style, {
          position: 'absolute',
          alignItems: 'center',
          width: w,
          height: h,
        })
        row.appendChild(textContainer)

        const text = createElement('Text')
        text.id = `${textContainer.id}/text`
        Object.assign(text.style, {
          top: 4,
          cursor: 'text',
          fontSize: 12,
          lineHeight: 12,
          paddingLeft: 4,
          paddingTop: 4,
          paddingRight: 4,
          paddingBottom: 4,
          maxLines: 1,
          maxWidth: w - 8,
          color: '#000000',
        })
        text.text = id
        textContainer.appendChild(text)

        const tag = createElement('Text')
        tag.id = `${textContainer.id}/tag`
        tag.text = 'tag'
        textContainer.appendChild(tag)
        return {
          row,
          text,
          tag,
          textContainer
        }
      }

      const row1 = createRow('row1')
      container.appendChild(row1.row)

      const row2 = createRow('row2', 40)
      container.appendChild(row2.row)

      canvas.appendChild(container)


      addButtonRef.current?.addEventListener('click', () => {
        container.appendChild(row1.row)
      })

      removeButtonRef.current?.addEventListener('click', () => {
        container.removeChild(row1.row)
      })

      reflowButtonRef.current?.addEventListener('click', () => {
        row1.text.text = new Date().toString()
      })

    }, 100)

  }, [canvasElRef])

  return (
    <>
      <div>
        <button ref={removeButtonRef}>remove</button>
        <button ref={addButtonRef}>add</button>
        <button ref={reflowButtonRef}>reflow</button>
      </div>
      <canvas style={{ backgroundColor: '#ffffff', width: '500px', height: '500px' }} ref={canvasElRef}></canvas>
    </>
  )
}

InsertRemoveTest.storyName = 'InsertRemove'

export default {
  title: 'core/rendering',
  component: InsertRemoveTest,
  decorators: [(Story: React.ComponentType) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
