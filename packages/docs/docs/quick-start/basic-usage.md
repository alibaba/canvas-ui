---
group:
  title: 快速开始
order: 4
---

# 基本用法

## React

大多数情况下推荐通过 React 方式使用 Canvas UI，因为真的非常方便。

```jsx
/**
 * defaultShowCode: true
 */
import React, { useState, useRef, useEffect } from 'react'
import { Canvas, Text, Flex } from '@canvas-ui/react'

export default () => {
  const containerStyle = {
    width: 250,
    flexDirection: 'column'
  }
  const textStyle = {
    maxWidth: containerStyle.width,
    maxLines: 1,
    cursor: 'pointer',
  }
  const [text, setText] = useState('我能吞下玻璃而不伤身体。')
  const textRef = useRef()
  const handlePointerDown = () => {
    setText('私はガラスを食べられます。それは私を傷つけません。')
  }
  useEffect(() => {
    console.info('可以通过 ref 得到底层的 RenderText 对象', textRef.current)
  }, [textRef.current])
  return (
    <div style={{ height: '100px' }}>
      <Canvas>
        <Flex style={ containerStyle }>
          <Text ref={ textRef } onPointerDown={ handlePointerDown } style={ textStyle }>{ text }</Text>
        </Flex>
      </Canvas>
    </div>
  )
}
```

## DOM-Like

你也可以使用底层的 createElement 操作 Canvas UI 节点，例如：当你觉得 React 太慢的时候。

请注意：这些 API 都在 `@canvas-ui/core` 里

```jsx
/**
 * defaultShowCode: true
 */
import React, { useRef, useEffect } from 'react'
import { createElement, Size } from '@canvas-ui/core'

export default () => {
  const containerStyle = {
    width: 250,
    flexDirection: 'column'
  }
  const textStyle = {
    maxWidth: containerStyle.width,
    maxLines: 1,
    cursor: 'pointer',
  }
  const text1 = '我能吞下玻璃而不伤身体。'
  const text2 = '私はガラスを食べられます。それは私を傷つけません。'

  const canvasElRef = useRef()

  function init (canvasEl) {
    const canvas = createElement('Canvas')
    const canvasRect = canvasEl.getBoundingClientRect()
    const surfaceSize = Size.fromWH(canvasRect.width, canvasRect.height)
    canvas.prepareInitialFrame()
    canvas.el = canvasEl
    canvas.size = surfaceSize
    canvas.dpr = devicePixelRatio
    
    const container = createElement('Flex')
    Object.assign(container.style, containerStyle)
    canvas.appendChild(container)

    const text = createElement('Text')
    Object.assign(text.style, textStyle)
    text.text = text1
    text.onPointerUp = event => {
      event.currentTarget.text = text2
    }
    container.appendChild(text)
  }

  useEffect(() => {
    setTimeout(() => {
      init(canvasElRef.current)
    }, 16)
  }, [canvasElRef.current])

  return (
    <canvas style={{ backgroundColor: '#ffffff', width: '100%', height: '100%' }} ref={canvasElRef}></canvas>
  )
}
```