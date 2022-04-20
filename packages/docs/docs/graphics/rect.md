---
group:
  title: 图形组件
  order: 2
order: 1
---

# Rect

使用 `Rect` 可以绘制矩形。

```jsx
/**
 * defaultShowCode: true
 */
import React, { useState } from 'react'
import { Canvas, Rect } from '@canvas-ui/react'

export default () => {

  const style = {
    cursor: 'pointer',
    top: 10,
    left: 10,
    width: 100,
    height: 50,
    fill: '#FF85B3',
    stroke: '#F900BF',
    strokeWidth: 1,
  }

  const hoverStyle = {
    ...style,
    boxShadow: `12px 12px 4px rgba(0, 0, 255, .2)`,
    fill: '#9900F0',
    stroke: '#9900F0',
  }

  const [currentStyle, setCurrentStyle] = useState(style)

  const handlePointerOver = () => {
    setCurrentStyle(hoverStyle)
  }

  const handlePointerOut = () => {
    setCurrentStyle(style)
  }

  return (
    <div style={{ height: '100px' }}>
      <Canvas>
        <Rect
          style={ currentStyle }
          onPointerOver={ handlePointerOver }
          onPointerOut= { handlePointerOut }
        />
      </Canvas>
    </div>
  )
}
```

## Props

<API hideTitle exports='["Rect"]' src="@canvas-ui/react/src/elements" />
