```jsx live
function HelloWorld () {
  const containerStyle = {
    width: 250,
    flexDirection: 'column'
  } as const
  const textStyle = {
    maxWidth: containerStyle.width,
    maxLines: 1,
    cursor: 'pointer',
  } as const
  const [text, setText] = React.useState('我能吞下玻璃而不伤身体。')
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
```
