# Image

Use `Image` to render images, similar to `<img>`.

Please note that since we render images into Canvas, to avoid making the Canvas "tainted", the target image URL must have [CORS enabled](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image). Canvas UI will download images by setting `crossOrigin = "Anonymous"`.

Animated GIFs are not supported.

```jsx live
function ImageDemo () {
  return (
    <div style={{ height: '200px' }}>
      <Canvas>
        <Flex style={{ flexDirection: 'row' }}>
          <Image src={ Assets.cat1 } />
          <Image style={{ width: 200, height: 151 }} src={ Assets.cat2 } />
        </Flex>
      </Canvas>
    </div>
  )
}
```

