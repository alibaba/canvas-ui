import { DebugFlags, Point, Size, Rect } from '@canvas-ui/core'
import { Canvas, View, Path } from '@canvas-ui/react'
import type { Story } from '@storybook/react'
import React, { useEffect, useRef, useState } from 'react'

const path = `M266.24 420.0448a30.8736 30.8736 0 0 1 52.736-21.8624L512 591.0016l192.9728-192.8192a30.8736 30.8736 0 1 1 43.7248 43.7248l-214.8352 214.6304a31.0272 31.0272 0 0 1-43.776 0L275.3024 441.9072a30.8736 30.8736 0 0 1-9.0624-21.8624z`

export const CanvasTest: Story = () => {

  const prevFrameButtonRef = useRef<HTMLButtonElement | null>(null)
  const nextFrameButtonRef = useRef<HTMLButtonElement | null>(null)

  const [hide, setHide] = useState(false)
  const [offset, setOffset] = useState(Point.zero)
  const [rotation, setRotation] = useState(-10)

  type FrameCallback = () => void

  useEffect(() => {
    DebugFlags.set(DebugFlags.PathBounds)
    const frameCallbacks: readonly FrameCallback[] = [
      // 0: initial frame
      () => {
        setHide(false)
        setOffset(Point.zero)
        setRotation(prev => prev + 10)
      },
      () => {
        setRotation(prev => prev + 10)
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
  }, [])

  return (
    <>
      <div>
        <button ref={prevFrameButtonRef}>prev frame</button>
        <button ref={nextFrameButtonRef}>next frame</button>
      </div>
      <div style={{ width: '1000px', height: '1000px' }}>
        <Canvas>
          {
            !hide ? (
              <View size={Size.fromWH(200, 200)} offset={offset}>
                <Path
                  fill={'#ff0000'}
                  path={path}
                  style={{ left: 50, top: 50, width: 22, height: 22 }}
                  pathBounds={Rect.fromLTWH(0, 0, 1024, 1024)}
                  unstable_rotation={rotation}
                  unstable_transformOrigin={Point.fromXY(0.5, 0.5)}
                />
              </View>
            ) : <></>
          }
        </Canvas>
      </div>
    </>
  )
}

CanvasTest.storyName = 'Canvas'

export default {
  title: 'react/Canvas',
  component: CanvasTest,
  decorators: [(Story: Story) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
