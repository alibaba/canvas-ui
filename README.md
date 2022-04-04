<img width="248" alt="canvas-ui-logo" src="https://user-images.githubusercontent.com/180445/147241118-4fb09f35-8bc0-449b-8ab1-045caa9eb726.png">

Canvas UI 是一个运行在 HTML Canvas 上的通用 UI 渲染器。https://alibaba.github.io/canvas-ui/

<hr>

他提供了一系列 React 组件，允许开发者利用已有知识快速构建基于 Canvas 的应用。

同时也具备类似 DOM 的场景树，开发者可以像操作 DOM 一样操作 Canvas 中绘制的元素。

```tsx
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


# 目录结构

- packages/core
渲染器的核心，提供了诸如 createElement，事件，渲染管线等能力。

- packages/react
Canvas UI 的官方 React 绑定，提供 `<View />` `<Text />` 等组件

- packages/examples
基于 Storybook 的组件开发和测试环境

- tools/
一些脚本

# 开始开发

```
# 启动 core 和 react 的开发模式
$ yarn dev

# 启动 Storybook
$ yarn dev:examples

# 运行单元测试
$ yarn test

# 构建 umd, esm 版本
$ yarn build

# 打版本
$ yarn lerna version

# 发布
$ sh ./tools/publish.sh
```
