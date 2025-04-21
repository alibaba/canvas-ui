---
group:
  title: 动画
order: 3
---

# 基本动画


```tsx
/**
 * defaultShowCode: true
 */
import React, { useState } from 'react'
import { Canvas, Path, Text, View } from '@canvas-ui/react'
import { Point, Rect, RenderView, Size, RenderPath } from '@canvas-ui/core'
import { animate, spring } from 'motion'
import { DebugFlagsUI } from '../examples/common/debug-flags-ui'

const path = `M266.24 420.0448a30.8736 30.8736 0 0 1 52.736-21.8624L512 591.0016l192.9728-192.8192a30.8736 30.8736 0 1 1 43.7248 43.7248l-214.8352 214.6304a31.0272 31.0272 0 0 1-43.776 0L275.3024 441.9072a30.8736 30.8736 0 0 1-9.0624-21.8624z`

export default () => {
  
  const viewRef = React.useRef<RenderView>()

  const handleClickLeft = () => {
    move(-100)
  }

  const handleClickRight = () => {
    move(100)
  }

  const move = (delta: number) => {
    const origin = viewRef.current!.offset
    animate(
      origin,
      { x: origin.x + delta, y: origin.y },
      {
        duration: 0.5,
        onUpdate: () => {
          viewRef.current!.offset = origin
          viewRef.current!.markPaintDirty()
        }
      }
    )

    const pathProps = { rotation: 0 }
    const pathEl = viewRef.current?.firstChild as RenderPath
    animate(pathProps, {
      rotation: 360 * Math.sign(delta),
    }, {
      duration: 0.5,
      onUpdate: () => {
        pathEl.unstable_rotation = pathProps.rotation
      }
    })
  }

  return (
    <div style={{ height: '200px' }}>
      <DebugFlagsUI />
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
            unstable_rotation={0}
            unstable_transformOrigin={Point.fromXY(0.5, 0.5)}
          />
          <Text>
            Monkey 🐒
          </Text>
        </View>
      </Canvas>
    </div>
  )
}
```

## Props
