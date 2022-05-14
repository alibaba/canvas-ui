---
group:
  title: 图形组件
order: 6
---

# Image

使用 `Image` 可以绘制图片，和 `<img>` 类似。

请注意，由于我们将图片渲染进 Canvas，为了避免 Canvas 变「脏」。这要求渲染的目标图片 URL 必须 [启用了 CORS](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image)，Canvas UI 会通过设置 `crossOrigin = "Anonymous"` 的形式去下载图片。

不支持 gif 动图。

```jsx
/**
 * defaultShowCode: true
 */
import React from 'react'
import { Canvas, Image, Flex } from '@canvas-ui/react'

export default () => {

  return (
    <div style={{ height: '200px' }}>
      <Canvas>
        <Flex style={{ flexDirection: 'row' }}>
          <Image src='https://img.mp.itc.cn/upload/20170327/7780234131884a84b4afbc3122aa7a57.gif' />
          <Image style={{ width: 200, height: 151 }} src='https://img.mp.itc.cn/upload/20170327/9d06a88619694ece89f3dc7d10ac4b53.gif' />
        </Flex>
      </Canvas>
    </div>
  )
}
```

## Props

<API hideTitle exports='["Image"]' src="@canvas-ui/react/src/elements" />
