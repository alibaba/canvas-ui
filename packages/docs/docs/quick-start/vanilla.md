---
sidebar_position: 2
---

# Vanilla JS

You can also use the low-level <code>createElement</code> to manipulate Canvas UI nodes.

```jsx live
() => {
  const { CanvasUICore } = importCanvasUIPackages()

  const {
    Size,
    createElement,
  } = CanvasUICore

  const containerStyle = {
    width: 250,
    flexDirection: 'column'
  }
  const textStyle = {
    maxWidth: containerStyle.width,
    maxLines: 1,
    cursor: 'pointer',
  }
  const text1 = 'I can eat glass and it doesn\'t hurt me.'
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
  }, [])

  return (
    <canvas style={{ backgroundColor: '#ffffff', width: '100%', height: '100%' }} ref={canvasElRef}></canvas>
  )
}
```
