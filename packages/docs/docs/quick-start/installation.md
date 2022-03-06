---
group:
  title: 快速开始
  order: 1
order: 3
---

# 安装和使用

## 安装

Canvas UI 由两个包组成，分别是

- `@canvas-ui/core`<br>
  Canvas UI 的核心组件，绘制能力

- `@canvas-ui/react`<br>
  Canvas UI 的 React 绑定，依赖 `@canvas-ui/core`

大多数情况下只需要使用 `@canvas-ui/react`

```sh

# 也可以把 npm 换成 yarn
npm install @canvas-ui/react
```

## 使用

安装完之后可以通过 import 加载和使用

Canvas UI 支持无缝嵌入已有基于 ReactDOM 渲染的组件

你需要创建一个根结点 `<Canvas />`，他子节点都是 Canvas UI 组件，最后他们都会被渲染到 HTML Canvas 中

```tsx | pure
import { Canvas, Text } from '@canvas-ui/react'
import { render } from 'react-dom'
import React from 'react'

render(
  <div style={ {height: 500} }>
    <Canvas>
      <Text>Hello world</Text>
    </Canvas>
  </div>,
  document.getElementById('app'),
)

```

## 常见问题

### 看不见任何渲染内容

`<Canvas />` 内部会创建一个 `<canvas>` 元素作为渲染表面，其默认样式是 width: 100%, height: 100%，你需要保证外层 div 的高度不为 0

```jsx
import React, { useState } from 'react'
import { Canvas, Text, Flex } from '@canvas-ui/react'

export default () => {
  
  const [height, setHeight] = useState(100)
  
  const handleClick = () => {
    if (height === 100) {
      setHeight(undefined)
    } else {
      setHeight(100)
    }
  }

  return (
    <div>
      <button onClick={ handleClick }>切换高度</button>
      <div style={{ height, border: '1px solid red' }}>
        <Canvas>
          <Text>{ `height ${height}px` }</Text>
        </Canvas>
      </div>
    </div>
    
  )
}
```