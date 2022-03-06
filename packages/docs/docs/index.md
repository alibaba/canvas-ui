---

title: 首页
order: 1
---

# 介绍 Canvas UI

Canvas UI 是一个运行在 HTML Canvas 上的通用 UI 渲染器。

他提供了一系列 React 组件，允许开发者利用已有知识快速构建基于 Canvas 的应用。

同时也具备类似 DOM 的场景树，开发者可以像操作 DOM 一样操作 Canvas 中绘制的元素。

```jsx
/**
 * defaultShowCode: true
 * desc: 本例展示了 Canvas UI 一些基本能力。您也可以查看代码或跳转到 CodeSandbox.io 中进行修改。
 */
import React from 'react'
import { Canvas, Text, Flex } from '@canvas-ui/react'

export default () => {
  const containerStyle = {
    width: 250,
    flexDirection: 'column'
  }
  const textStyle = {
    maxWidth: containerStyle.width,
    maxLines: 1,
  }
  return (
    <div style={{ height: '100px' }}>
      <Canvas>
        <Flex style={ containerStyle }>
          <Text style={ textStyle }>我能吞下玻璃而不伤身体。</Text>
          <Text style={ textStyle }>私はガラスを食べられます。それは私を傷つけません。</Text>
          <Text style={ textStyle }>The quick brown fox jumps over the lazy dog.</Text>
        </Flex>
      </Canvas>
    </div>
  )
}

```

# 特性

- 像 DOM 一样操作在 Canvas 里的元素

- 支持 React，无缝接入 ReactDOM 渲染的应用

- 支持 Flex 布局

- 支持基本的文本排版能力：自动换行，对齐，文本溢出等属性

- 支持通过 style 属性写入 CSS 样式

- 支持交互事件：PointerEvents 和 WheelEvent

- 便利的分层能力

- 完全使用 TypeScript 编写，类型完备

- 在 WebWorker 中渲染 (WIP)
