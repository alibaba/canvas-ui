import {
  ClipRRectLayer,
  LayerTree,
  Matrix,
  OffsetLayer,
  PaintStyle,
  PictureLayer,
  PictureRecoder,
  Point,
  Rasterizer,
  RRect,
  Size,
  Surface,
  TransformLayer
} from '@canvas-ui/core'
import type { StoryObj } from '@storybook/react'
import React, { useEffect, useRef } from 'react'

export const ClipRRectLayerTest: StoryObj<React.FC> = () => {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null)
  const prevFrameButtonRef = useRef<HTMLButtonElement | null>(null)
  const nextFrameButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    // 等待布局稳定
    setTimeout(() => {
      if (!canvasElRef.current) {
        return
      }

      const makeShapes = () => {
        // 矩形
        const recorder = new PictureRecoder()
        const canvas = recorder.begin()
        canvas.drawRect(0, 0, 100, 100, {
          style: PaintStyle.fill,
          color: '#CCCCCC',
        })
        canvas.drawRect(0, 0, 100, 100, {
          style: PaintStyle.stroke,
          color: '#FF00FF',
        })

        const rect = recorder.end()
        return {
          rect,
        }
      }

      const shapes = makeShapes()
      const canvasRect = canvasElRef.current.getBoundingClientRect()
      const surfaceSize = Size.scale(Size.fromWH(canvasRect.width, canvasRect.height), devicePixelRatio)
      const surface = Surface.makeCanvasSurface({ el: canvasElRef.current })
      const rasterizer = new Rasterizer({
        surface,
      })

      // 构建图层
      // 稍后，我们会复用这些图层
      const rootLayer = new TransformLayer(Matrix.fromScale(devicePixelRatio))
      const offsetLayer = new OffsetLayer(Point.fromXY(0, 0))
      rootLayer.appendChild(offsetLayer)
      const CLIP_PADDING = 10
      const clipRRectLayer = new ClipRRectLayer(RRect.fromLTWHXY(CLIP_PADDING, CLIP_PADDING, shapes.rect.cullRect.width - CLIP_PADDING * 2, shapes.rect.cullRect.height - CLIP_PADDING * 2, 10, 10))
      offsetLayer.appendChild(clipRRectLayer)
      const pictureLayer = new PictureLayer(Point.fromXY(0, 0))
      pictureLayer.picture = shapes.rect
      clipRRectLayer.appendChild(pictureLayer)
      type FrameCallback = () => void
      const frameCallbacks: readonly FrameCallback[] = [
        // 0: initial frame
        () => {
          // 更新 dpr
          rootLayer.transform = Matrix.fromScale(devicePixelRatio)
          offsetLayer.offset = Point.fromXY(0, 0)
          const layerTree = new LayerTree({ rootLayer })
          rasterizer.draw(layerTree, surfaceSize)
        },
        // 1
        () => {
          // 更新 dpr
          rootLayer.transform = Matrix.fromScale(devicePixelRatio)
          // 修改了 OffsetLayer，造成位移
          offsetLayer.offset = Point.fromXY(10, 10)
          const layerTree = new LayerTree({ rootLayer })
          rasterizer.draw(layerTree, surfaceSize)
        },
        // 2
        () => {
          // 更新 dpr
          rootLayer.transform = Matrix.fromScale(devicePixelRatio)
          // 修改了 OffsetLayer，造成位移
          offsetLayer.offset = Point.fromXY(20, 20)
          const layerTree = new LayerTree({ rootLayer })
          rasterizer.draw(layerTree, surfaceSize)
        },
        // 3
        () => {
          // 更新 dpr
          rootLayer.transform = Matrix.fromScale(devicePixelRatio)
          // 修改了 OffsetLayer，造成位移
          offsetLayer.offset = Point.fromXY(10, 10)
          const layerTree = new LayerTree({ rootLayer })
          rasterizer.draw(layerTree, surfaceSize)
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

ClipRRectLayerTest.storyName = 'ClipRRectLayer'

export default {
  title: 'core/compositing',
  component: ClipRRectLayerTest,
  decorators: [(Story: React.ComponentType) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
