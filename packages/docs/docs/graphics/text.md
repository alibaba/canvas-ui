# Text

Use `Text` to draw text.

If the text exceeds the display area, an ellipsis (`…`) is added after the last visible character in the last line.

## Supported CSS styles

| property | note |
|---|---|
| font |  |
| fontFamily |  |
| fontStyle |  |
| fontVariant |  |
| fontWeight |  |
| fontStretch |  |
| fontSize | Number type (px) only  |
| lineHeight | Number type (px) only  |
| color | [CSS \<color\> Type](https://developer.mozilla.org/docs/Web/CSS/color_value)  |
| maxLines | Maximum number of lines |
| textAlign | Only support left \| center \| right  |


```jsx live
function TextExample () {
  const { Canvas, Text } = importCanvasUIPackages()

  const [text, setText] = React.useState('The quick brown 🦊 jumps over the lazy 🐶')
  const [style, setStyle] = React.useState({
    width: 100,
    height: 50,
    maxLines: 1,
    borderWidth: 1,
    borderColor: 'red'
  })

  return (
    <div style={{ height: '100px' }}>
      <Canvas>
        <Text
          style={ style }
        >
        { text }
        </Text>
      </Canvas>
    </div>
  )
}
```
