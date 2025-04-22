/* eslint-disable @typescript-eslint/no-unused-vars */
import { DebugFlags, SyntheticPointerEvent } from '@canvas-ui/core'
import { Canvas, Chunk, ScrollView, Text } from '@canvas-ui/react'
import type { StoryObj } from '@storybook/react'
import React, { useEffect } from 'react'

export const RenderObjectHiddenTest: StoryObj<React.FC> = () => {

  useEffect(() => {
    DebugFlags.set(
      DebugFlags.NodeBounds
      | DebugFlags.LayerBounds
      | DebugFlags.RasterCacheWaterMark
    )
    return () => {
      DebugFlags.set(0)
    }
  }, [])

  const handlePointerDown = (event: SyntheticPointerEvent<Text>) => {
    console.info(event.target)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    event.target!.hidden = true
  }

  return (
    <Canvas>
      <ScrollView style={{ width: 250, height: 250 }}>
        <Chunk style={{ width: 500, height: 500 }}>
          <Text style={{ cursor: 'pointer' }} onPointerDown={handlePointerDown}>Click to hide</Text>
          <Text style={{ left: 450, top: 450 }}>RB</Text>
        </Chunk>
      </ScrollView>
    </Canvas>
  )
}

RenderObjectHiddenTest.storyName = 'hidden'

export default {
  title: 'react/RenderObject',
  component: RenderObjectHiddenTest,
  decorators: [(Story: React.ComponentType) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
