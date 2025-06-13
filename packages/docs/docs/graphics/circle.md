# Circle

Use `Circle` to draw circles.

```tsx live

function CircleDemo () {

  const style = {
    cursor: 'pointer',
    top: 16,
    left: 16,
    width: 32,
    height: 32,
    fill: '#FF85B3',
    stroke: '#F900BF',
    strokeWidth: 1,
    radius: 16,
  }

  const hoverStyle = {
    ...style,
    boxShadow: `12px 12px 4px rgba(0, 0, 255, .2)`,
    fill: '#9900F0',
    stroke: '#9900F0',
  }

  const [currentStyle, setCurrentStyle] = useState(style)

  const handlePointerOver = () => {
    setCurrentStyle(hoverStyle)
  }

  const handlePointerOut = () => {
    setCurrentStyle(style)
  }

  return (
    <div style={{ height: '100px' }}>
      <Canvas>
        <Circle
          style={ currentStyle }
          onPointerOver={ handlePointerOver }
          onPointerOut= { handlePointerOut }
        />
      </Canvas>
    </div>
  )
}
```

