---
group:
  title: 图形组件
order: 4
---

# Path

使用 `Path` 可以绘制 [SVG](https://developer.mozilla.org/zh-CN/docs/Web/SVG)

你需要设置正确的 `pathBounds` 和 `path` 就可以在 Canvas 中渲染 SVG

- `path` 对应了 `<path>` 的 `d` 属性

- `pathBounds` 对应了 SVG 中的 `viewBox` 属性

```jsx
/**
 * defaultShowCode: true
 */
import React, { useState } from 'react'
import { Rect } from '@canvas-ui/core'
import { Canvas, Path } from '@canvas-ui/react'

export default () => {

  const style = {
    cursor: 'pointer',
    width: 50,
    height: 50,
    fill: '#FF85B3',
  }

  const hoverStyle = {
    ...style,
    boxShadow: `12px 12px 4px rgba(0, 0, 255, .2)`,
    fill: '#9900F0',
  }

  const [currentStyle, setCurrentStyle] = useState(style)

  const handlePointerOver = () => {
    setCurrentStyle(hoverStyle)
  }

  const handlePointerOut = () => {
    setCurrentStyle(style)
  }

  const path = `M3 1.5v1c0 .068.003.135.008.2H2.5a.3.3 0 0 0-.3.3v11.5a.3.3 0 0 0 .3.3h11a.3.3 0 0 0 .3-.3V3a.3.3 0 0 0-.3-.3h-.508l.006-.1.002-.1v-1h.5A1.5 1.5 0 0 1 15 3v11.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 14.5V3a1.5 1.5 0 0 1 1.5-1.5H3zm7.826 5.076a.6.6 0 0 1 .848.848l-4 4a.6.6 0 0 1-.848 0l-2-2a.6.6 0 0 1 .848-.848L7.25 10.15zM10 0a2 2 0 1 1 0 4H6a2 2 0 1 1 0-4h4zm0 1.2H6a.8.8 0 1 0 0 1.6h4a.8.8 0 1 0 0-1.6z`
  
  // 用 Rect 生成一个矩形
  // 请注意，此处的 Rect 来自 core，而非 react 组件
  const pathBounds = Rect.fromLTWH(0, 0, 16, 16)

  return (
    <div style={{ height: '100px' }}>
      <div>
        <svg width="50" height="50" viewBox={ `${pathBounds.left} ${pathBounds.top} ${pathBounds.width} ${pathBounds.height}` }>
          <path fill={ style.fill } d={path}/>
        </svg>
      </div>
      <Canvas>
        <Path
          style={ currentStyle }
          path={ path }
          pathBounds={ pathBounds }
          onPointerOver={ handlePointerOver }
          onPointerOut= { handlePointerOut }
        />
      </Canvas>
    </div>
  )
}
```

## Props

<API hideTitle exports='["Path"]' src="@canvas-ui/react/src/elements" />
