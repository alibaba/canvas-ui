import {
  createElement,
  RenderCanvas,
  RenderCircle,
  RenderFlex,
  RenderImage,
  RenderRect,
  RenderRRect,
  RenderScrollView,
  RenderText,
  RenderChunk,
  RenderView
} from '..'

describe('createElement', () => {
  test('View', () => {
    expect(createElement('View')).toBeInstanceOf(RenderView)
  })
  test('Flex', () => {
    expect(createElement('Flex')).toBeInstanceOf(RenderFlex)
  })
  test('Canvas', () => {
    expect(createElement('Canvas')).toBeInstanceOf(RenderCanvas)
  })
  test('Rect', () => {
    expect(createElement('Rect')).toBeInstanceOf(RenderRect)
  })
  test('RRect', () => {
    expect(createElement('RRect')).toBeInstanceOf(RenderRRect)
  })
  test('Circle', () => {
    expect(createElement('Circle')).toBeInstanceOf(RenderCircle)
  })
  test('ScrollView', () => {
    expect(createElement('ScrollView')).toBeInstanceOf(RenderScrollView)
  })
  test('Text', () => {
    expect(createElement('Text')).toBeInstanceOf(RenderText)
  })
  test('Image', () => {
    expect(createElement('Image')).toBeInstanceOf(RenderImage)
  })
  test('Chunk', () => {
    expect(createElement('Chunk')).toBeInstanceOf(RenderChunk)
  })
})
