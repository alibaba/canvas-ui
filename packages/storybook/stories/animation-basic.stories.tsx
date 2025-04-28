import { DebugFlags, Point, Rect, RenderPath, RenderView, Size } from '@canvas-ui/core'
import { Canvas, Path, Text, View } from '@canvas-ui/react'
import { StoryObj } from '@storybook/react'
import { animate } from '@canvas-ui/animation'
import { spring } from 'motion'
import React from 'react'

const path = `M266.24 420.0448a30.8736 30.8736 0 0 1 52.736-21.8624L512 591.0016l192.9728-192.8192a30.8736 30.8736 0 1 1 43.7248 43.7248l-214.8352 214.6304a31.0272 31.0272 0 0 1-43.776 0L275.3024 441.9072a30.8736 30.8736 0 0 1-9.0624-21.8624z`

export const AnimationBasic: StoryObj<React.FC> = () => {

  React.useEffect(() => {

    DebugFlags.set(
      0
      | DebugFlags.NodeBounds
      | DebugFlags.LayerBounds
      | DebugFlags.RasterCacheWaterMark
      | DebugFlags.PathBounds
    )

  }, [])

  const viewRef = React.useRef<RenderView>(null)

  const handleClickLeft = () => {
    move(-100)
  }

  const handleClickRight = () => {
    move(100)
  }

  const move = (delta: number) => {

    animate(viewRef.current!, {
      offset: Point.add(viewRef.current!.offset, Point.fromXY(delta, 0)),
    }, {
      duration: 0.8,
      type: spring,
    })

    const pathEl = viewRef.current?.firstChild as RenderPath
    pathEl.rotation = 0
    animate(pathEl, {
      rotation: 360 * Math.sign(delta),
    }, {
      duration: 1.333,
      type: spring,
    })
  }

  return (
    <div style={{ height: '100px' }}>
      <div>
        <button onClick={handleClickLeft}>move left</button>
        <button onClick={handleClickRight}>move right</button>
      </div>
      <Canvas>
        <View ref={viewRef} size={Size.fromWH(200, 200)}>
          <Path
            fill={'#ff0000'}
            path={path}
            style={{ left: 0, top: 0, width: 100, height: 100 }}
            pathBounds={Rect.fromLTWH(0, 0, 1024, 1024)}
            rotation={0}
            transformOrigin={Point.fromXY(0.5, 0.5)}
          />
          <Text>
            Monkey 🐒
          </Text>
        </View>
      </Canvas>
    </div>
  )
}

AnimationBasic.storyName = 'AnimationBasic'

export default {
  title: 'animation',
  component: AnimationBasic,
  decorators: [(Story: React.ComponentType) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
