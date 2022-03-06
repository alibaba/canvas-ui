import React from 'react'
import { Canvas, Text, Flex } from '@canvas-ui/react'

export default () => {
  return (
    <div style={{ height: '200px' }}>
      <Canvas>
        <Flex style={{ width: 100 }}>
          <Text>Dog</Text>
          <Text>Cat</Text>
        </Flex>
      </Canvas>
    </div>
  )
}
