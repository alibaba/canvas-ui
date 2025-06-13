import React, { useState, useEffect } from 'react'
import { Canvas, Text, Flex } from '@canvas-ui/react'

export const HelloWorld: React.FC = () => {
  const containerStyle = {
    width: 250,
    flexDirection: 'column'
  } as const
  const textStyle = {
    maxWidth: containerStyle.width,
    maxLines: 1,
    cursor: 'pointer',
  } as const
  const [text, setText] = useState('我能吞下玻璃而不伤身体。')
  const textRef = React.useRef(null)
  const handlePointerDown = () => {
    setText('私はガラスを食べられます。それは私を傷つけません。')
  }
  useEffect(() => {
    console.info('可以通过 ref 得到底层的 RenderText 对象', textRef.current)
  }, [])
  return (
    <div style={{ height: '100px' }}>
      <Canvas>
        <Flex style={containerStyle}>
          <Text ref={textRef} onPointerDown={handlePointerDown} style={textStyle}>{text}</Text>
        </Flex>
      </Canvas>
    </div>
  )
}
