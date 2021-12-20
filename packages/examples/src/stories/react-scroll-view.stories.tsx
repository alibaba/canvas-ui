import { Point, ScrollAxis, ScrollBounds, SyntheticPointerEvent } from '@canvas-ui/core'
import { Canvas, Flex, Rect, ScrollView } from '@canvas-ui/react'
import type { Story } from '@storybook/react'
import React from 'react'

const List = () => {
  const list = Array.from(new Array(3).keys())

  const pointerdown = (e: SyntheticPointerEvent<ScrollView>) => {
    console.info('down', e.target?.id)
  }
  const pointermove = (e: SyntheticPointerEvent<ScrollView>) => {
    console.info('move', e.target?.id)
  }

  const content = list.map(item => {
    return (
      <ScrollView
        style={{ width: 200, height: 400, marginTop: 20, marginLeft: 10, marginRight: 10 }}
        id={item}
        scrollBounds={ScrollBounds.Vertical}
        offset={Point.fromXY(20, 20)}
        scrollAxis={ScrollAxis.Vertical}
        key={item}
        onPointerDown={pointerdown}
        onPointerMove={pointermove}
      >
        <Flex style={{ flexDirection: 'column' }}>
          <Rect style={{ width: 100, height: 100 }} repaintBoundary={true} fill={'#FF0000'}></Rect>
          <Rect style={{ width: 100, height: 200 }} repaintBoundary={true} stroke={'#00FF00'} strokeWidth={4}></Rect>
          <Rect style={{ width: 200, height: 300 }} repaintBoundary={true} fill={'#CCCCCC'} stroke={'#333333'} strokeWidth={2}></Rect>
        </Flex>
      </ScrollView>
    )
  })

  return (
    <Flex style={{ flexDirection: 'row' }}>
      {content}
    </Flex>
  )
}

export const ScrollViewTest: Story = () => {
  return (
    <Canvas>
      <ScrollView
        style={{ width: 480, height: 480 }}
        scrollBounds={ScrollBounds.Fit}
        offset={Point.fromXY(20, 20)}
        scrollAxis={ScrollAxis.Horizontal}
      >
        <List />
      </ScrollView>
    </Canvas>
  )
}

ScrollViewTest.storyName = 'ScrollView'

export default {
  title: 'react/ScrollView',
  component: ScrollViewTest,
  decorators: [(Story: Story) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
