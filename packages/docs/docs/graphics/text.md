---
group:
  title: 图形组件
order: 5
---

# Text

使用 `Text` 可以绘制文本。

如果文本超出了显示区域，则在最后一行最后一个可见字后添加 `…`

支持的 CSS 样式

| 样式 | 说明 |
|---|---|
| font | --  |
| fontFamily | --  |
| fontStyle | --  |
| fontVariant | --  |
| fontWeight | --  |
| fontStretch | --  |
| fontSize | 仅支持数字类型，单位 px  |
| lineHeight | 仅支持数字类型，单位 px  |
| color | [CSS \<color\> 类型](https://developer.mozilla.org/zh-CN/docs/Web/CSS/color_value)  |
| maxLines | 最多显示的行数 |
| textAlign | 仅支持 left \| center \| right  |


```jsx
/**
 * defaultShowCode: true
 */
import React, { useState } from 'react'
import { Canvas, Text } from '@canvas-ui/react'

export default () => {

  const [text, setText] = useState('那只敏捷的棕毛🦊跃过了那只🐶\n\nThe quick brown 🦊 jumps over the lazy 🐶')
  const [style, setStyle] = useState({
    width: 100,
    height: 50,
    maxLines: 1,
    borderWidth: 1,
    borderColor: 'red'
  })

  return (
    <div style={{ height: '100px' }}>
      <Canvas>
        <Text
          style={ style }
        >
        { text }
        </Text>
      </Canvas>
    </div>
  )
}
```

## Props

<API hideTitle exports='["Text"]' src="@canvas-ui/react/src/elements" />