import { SyntheticPointerEvent } from '@canvas-ui/core'
import { Canvas, Text } from '@canvas-ui/react'
import type { Story } from '@storybook/react'
import { assert } from '@canvas-ui/assert'
import React, { useState } from 'react'

export const TextTest: Story = () => {

  const [style, setStyle] = useState({ cursor: 'pointer', top: 100, width: 80 })

  const handlePointerDown = (_event: SyntheticPointerEvent<Text>) => {
    setStyle(prev => {
      return {
        ...prev,
        width: prev.width + 4,
      }
    })
  }

  const updateTextAlign = (event: SyntheticPointerEvent<Text>) => {
    assert(event.target)
    event.target.style.textAlign = 'right'
  }

  return (
    <Canvas>
      <Text style={{ width: 200 }}>
        The quick brown 🦊 jumps over the lazy 🐶
      </Text>
      <Text style={{ top: 60 }}>
        The quick brown 🦊 jumps over the lazy 🐶
      </Text>
      <Text style={style} onPointerDown={handlePointerDown}>
        {'那只敏捷的棕毛🦊跃过了那只🐶\n\nThe quick brown 🦊 jumps over the lazy 🐶'}
      </Text>
      <Text style={{ top: 320, width: 200, textAlign: 'center' }} onPointerDown={updateTextAlign}>
        {'textAlign: center\nThe quick brown 🦊 jumps over the lazy 🐶'}
      </Text>
    </Canvas>
  )
}

TextTest.storyName = 'Text'

export default {
  title: 'react',
  component: TextTest,
  decorators: [(Story: Story) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
