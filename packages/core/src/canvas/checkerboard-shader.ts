import { assert } from '@canvas-ui/assert'
import { PlatformAdapter } from '../platform'
import { Shader } from './shader'

let checkerboardImageData: ImageData | undefined

const makeCheckerboardImageData = (alpha = 0.1) => {
  const alphaBit = Math.round(alpha * 255)
  return checkerboardImageData ??= new ImageData(
    new Uint8ClampedArray([
      255, 255, 255, alphaBit,
      0, 0, 0, alphaBit,
      0, 0, 0, alphaBit,
      255, 255, 255, alphaBit,
    ]),
    2,
    2,
  )
}

let shader: Shader | undefined

export const makeCheckerboardShader = () => {
  if (!shader) {
    const size = 24
    const w = 2
    const el = PlatformAdapter.supportOffscreenCanvas
      ? PlatformAdapter.createOffscreenCanvas(w, w)
      : PlatformAdapter.createCanvas(w, w)
    const context = el.getContext('2d')
    assert(context)
    context.putImageData(makeCheckerboardImageData(), 0, 0)
    const pattern = context.createPattern(el, 'repeat')
    assert(pattern)
    pattern.setTransform(
      new DOMMatrix([
        size, // sx
        0,
        0,
        size, // sy
        0,
        0,
      ])
    )
    shader = Shader.fromPattern(pattern)
  }
  assert(shader)
  return shader
}
