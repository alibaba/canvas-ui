# RRect

Use `RRect` to draw rounded rectangles.

```tsx live

function RRectDemo () {
  const { Canvas, RRect } = importCanvasUIPackages()

  const style = {
    cursor: 'pointer',
    top: 10,
    left: 10,
    width: 100,
    height: 50,
    fill: '#FF85B3',
    stroke: '#F900BF',
    strokeWidth: 1,
    rx: 8,
    ry: 8,
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
        <RRect
          style={ currentStyle }
          onPointerOver={ handlePointerOver }
          onPointerOut= { handlePointerOut }
        />
      </Canvas>
    </div>
  )
}
```

