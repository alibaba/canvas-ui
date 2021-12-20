import assert from 'assert'
import { Rect } from '../math'
import { PlatformAdapter } from '../platform'
import { Shader } from './shader'

const cache: Record<string, Shader> = {}

const WATERMARK_BOUNDS = Rect.fromLTWH(0, 0, 96, 96)

export function makeWatermarkShader(text: string, bounds = WATERMARK_BOUNDS) {
  if (cache[text]) {
    return cache[text]
  }

  const options = { width: bounds.width, height: bounds.height }

  const canvas = PlatformAdapter.supportOffscreenCanvas
    ? PlatformAdapter.createOffscreenCanvas(options.width, options.height)
    : PlatformAdapter.createCanvas(options.width, options.height)

  const context = canvas.getContext('2d')
  assert(context)
  context.beginPath()
  context.setLineDash([20, 3, 3, 3, 3, 3, 3, 3])
  context.moveTo(bounds.left, bounds.top)
  context.lineTo(bounds.width, bounds.height)
  context.moveTo(bounds.width, bounds.top)
  context.lineTo(bounds.left, bounds.height)
  context.closePath()
  context.strokeStyle = 'rgba(0, 0, 0, 0.1)'
  context.stroke()
  context.fillStyle = 'rgba(0, 0, 0, 0.2)'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '16px Monospace'
  context.fillText(text, bounds.width / 2, bounds.height / 2)
  const pattern = context.createPattern(canvas, 'repeat')
  assert(pattern)
  return cache[text] = Shader.fromPattern(pattern)
}
