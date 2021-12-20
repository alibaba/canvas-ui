import { Log } from '../foundation'
import type { Matrix } from '../math'
import { hasOwn } from '../utils'
import type { Canvas } from './canvas'
import { makeCheckerboardShader } from './checkerboard-shader'
import type { Image } from './image'
import { Paint } from './paint'
import { Picture } from './picture'
import { makeWatermarkShader } from './watermark-shader'

type Context2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

type Canvas2DCanvasOptions = {
  context: Context2D
}

const enum AffineTransform {
  a = 0,
  b = 3,
  c = 1,
  d = 4,
  tx = 2,
  ty = 5,
}

const enum StrokeAlign {
  Inner = 0,
  Center = 0.5,
  Outer = 1,
}

export class Canvas2DCanvas implements Canvas {

  private readonly context: Context2D

  constructor({
    context,
  }: Canvas2DCanvasOptions) {
    this.context = context
  }

  save(): void {
    this.context.save()
  }

  restore(): void {
    this.context.restore()
  }

  translate(tx: number, ty: number): void {
    this.context.translate(tx, ty)
  }

  rotate(angle: number): void {
    this.context.rotate(angle)
  }

  transform(matrix: Matrix): void {
    this.context.transform(
      matrix.values[AffineTransform.a],
      matrix.values[AffineTransform.b],
      matrix.values[AffineTransform.c],
      matrix.values[AffineTransform.d],
      matrix.values[AffineTransform.tx],
      matrix.values[AffineTransform.ty],
    )
  }

  resetTransform(): void {
    this.context.resetTransform()
  }

  clear(color?: string): void {
    const { width, height } = this.context.canvas
    if (color !== undefined) {
      this.drawRect(0, 0, width, height, { color })
    } else {
      this.context.clearRect(0, 0, width, height)
    }
  }

  drawCircle(x: number, y: number, radius: number, paint: Paint): void {
    this.context.save()
    const style = paintToStyle(paint, this.context)
    setShadowProps(this.context, paint)
    if (Paint.isStroke(paint)) {
      const { strokeWidth = 1 } = paint // strokeWidth 默认 1

      // todo(haocong): 考虑在 Paint 上暴露该 StrokeAlign
      const align = StrokeAlign.Inner
      const radiusOffset = strokeWidth * (0.5 - (1 - align))
      drawCirclePath(this.context, x, y, radius + radiusOffset)
      if (style) {
        this.context.strokeStyle = style
      }
      this.context.lineWidth = strokeWidth
      this.context.stroke()
    } else {
      drawCirclePath(this.context, x, y, radius)
      if (style) {
        this.context.fillStyle = style
      }
      this.context.fill()
    }
    this.context.restore()
  }

  drawRect(x: number, y: number, w: number, h: number, paint: Paint): void {
    this.context.save()
    setShadowProps(this.context, paint)
    const style = paintToStyle(paint, this.context)
    if (Paint.isStroke(paint)) {
      if (style) {
        this.context.strokeStyle = style
      }
      const { strokeWidth = 1 } = paint // 笔触宽度默认值是 1
      if (hasOwn(paint, 'strokeWidth')) {
        this.context.lineWidth = paint.strokeWidth
      }
      this.context.strokeRect(
        x + strokeWidth * 0.5, y + strokeWidth * 0.5,
        w - strokeWidth,
        h - strokeWidth,
      )
    } else {
      if (style) {
        this.context.fillStyle = style
      }
      this.context.fillRect(x, y, w, h)
    }
    this.context.restore()
  }

  drawRRect(x: number, y: number, w: number, h: number, rx: number, _ry: number, paint: Paint): void {
    const { context } = this
    context.save()
    const style = paintToStyle(paint, this.context)
    const radius = rx // 暂时仅支持 rx
    setShadowProps(context, paint)
    if (Paint.isStroke(paint)) {
      const { strokeWidth = 1 } = paint // strokeWidth 默认 1

      // todo(haocong): 考虑在 Paint 上暴露该 StrokeAlign
      const align = StrokeAlign.Inner

      // 根据 StrokeAlign 计算 offset
      const alignOffset = strokeWidth * (0.5 - (1 - align))

      // 修正后的 xywh
      const alignedX = x - alignOffset
      const alignedY = y - alignOffset
      const alignedW = w + (2 * alignOffset)
      const alignedH = h + (2 * alignOffset)

      // 修正后的 radius
      const radiusOffset = alignOffset * (
        align >= 1
          ? Math.min(alignedW / w, alignedH / h)
          : Math.min(w / alignedW, h / alignedH)
      )
      let alignedRadius = radius + radiusOffset
      const maxRaidus = Math.min(alignedW, alignedH) / 2

      alignedRadius = alignedRadius > maxRaidus ? maxRaidus : alignedRadius

      drawRRectPath(
        context,
        alignedX,
        alignedY,
        alignedW,
        alignedH,
        alignedRadius,
      )
      if (style) {
        this.context.strokeStyle = style
      }
      this.context.lineWidth = strokeWidth
      this.context.stroke()
    } else {
      drawRRectPath(context, x, y, w, h, radius)
      if (style) {
        this.context.fillStyle = style
      }
      context.fill()
    }
    context.restore()
  }

  drawImage(image: Image, dx: number, dy: number, dw = image.width, dh = image.height) {
    if (hasOwn(image, 'sx')) {
      this.context.drawImage(image.source, image.sx, image.sy!, image.width, image.height, dx, dy, dw, dh)
    } else {
      this.context.drawImage(image.source, dx, dy, dw, dh)
    }
  }

  @Log({ disabled: true })
  drawText(text: string, x: number, y: number, paint: Paint): void {
    this.context.save()
    const style = paintToStyle(paint, this.context)

    if (paint.font) {
      this.context.font = paint.font
    }

    if (Paint.isStroke(paint)) {
      if (style) {
        this.context.strokeStyle = style
      }
      if (hasOwn(paint, 'strokeWidth')) {
        this.context.lineWidth = paint.strokeWidth
      }
      this.context.strokeText(text, x, y)
    } else {
      if (style) {
        this.context.fillStyle = style
      }
      this.context.fillText(text, x, y)
    }
    this.context.restore()
  }

  drawPath(path: Path2D, x: number, y: number, paint: Paint): void {
    this.context.save()
    setShadowProps(this.context, paint)
    const style = paintToStyle(paint, this.context)
    if (Paint.isStroke(paint)) {
      if (style) {
        this.context.strokeStyle = style
      }
      if (hasOwn(paint, 'strokeWidth')) {
        this.context.lineWidth = paint.strokeWidth
        this.context.translate(x, y)
        this.context.stroke(path)
      }
    } else {
      if (style) {
        this.context.fillStyle = style
        this.context.translate(x, y)
        this.context.fill(path)
      }
    }
    this.context.restore()
  }

  drawPicture(picture: Picture): void {
    Picture.playback(picture, this)
  }

  clipRect(x: number, y: number, w: number, h: number): void {
    this.context.beginPath()
    this.context.rect(x, y, w, h)
    this.context.closePath()
    this.context.clip()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  clipRRect(x: number, y: number, w: number, h: number, rx: number, _ry: number): void {
    drawRRectPath(this.context, x, y, w, h, rx)
    this.context.clip()
  }

  clipCircle(x: number, y: number, radius: number): void {
    drawCirclePath(this.context, x, y, radius)
    this.context.clip()
  }

  debugDrawCheckerboard(scale: number) {
    const { width, height } = this.context.canvas
    this.context.save()
    this.context.imageSmoothingEnabled = false
    this.context.scale(scale, scale)
    this.drawRect(0, 0, width, height, { shader: makeCheckerboardShader() })
    this.context.restore()
  }

  debugDrawText(text: string, x: number, y: number) {
    this.context.save()

    this.context.font = '12px Monaco'
    const padding = 2
    const { width } = this.context.measureText(text)
    const height = 12

    // bg
    this.context.globalAlpha = 0.334
    this.drawRect(x, y, width + padding * 2, height + padding * 2, {})

    // text
    this.context.globalAlpha = 1
    this.context.textBaseline = 'middle'
    this.context.fillStyle = 'white'
    this.context.fillText(text, x + padding, y + height / 2 + padding)
    this.context.restore()
  }

  debugDrawWaterMark(text: string, x: number, y: number, w: number, h: number): void {
    this.context.save()
    this.drawRect(x, y, w, h, { shader: makeWatermarkShader(text) })
    this.context.restore()
  }

}

const paintToStyle = ({ color, shader }: Paint, context: CanvasFillStrokeStyles) => {
  if (color) {
    return color
  }
  if (shader) {
    return shader.asStyle(context)
  }
  return undefined
}

function drawRRectPath(
  context: Context2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  context.beginPath()
  context.moveTo(x, y + r)
  context.lineTo(x, y + h - r)
  context.quadraticCurveTo(x, y + h, x + r, y + h)
  context.lineTo(x + w - r, y + h)
  context.quadraticCurveTo(x + w, y + h, x + w, y + h - r)
  context.lineTo(x + w, y + r)
  context.quadraticCurveTo(x + w, y, x + w - r, y)
  context.lineTo(x + r, y)
  context.quadraticCurveTo(x, y, x, y + r)
  context.closePath()
}

function drawCirclePath(
  context: Context2D,
  x: number,
  y: number,
  radius: number,
) {
  context.beginPath()
  context.arc(x, y, radius, 0, 2 * Math.PI)
  context.closePath()
}

type ShadowProps = 'shadowColor' | 'shadowBlur' | 'shadowOffsetX' | 'shadowOffsetY'
function setShadowProps(
  context: Pick<Context2D, ShadowProps>,
  paint: Pick<Paint, ShadowProps>,
) {
  if (hasOwn(paint, 'shadowColor') /* todo(haocong): && !isTransparent(paint.shadowColor)*/) {
    let hasShadow = false
    if (hasOwn(paint, 'shadowBlur') && paint.shadowBlur >= 0) {
      context.shadowBlur = paint.shadowBlur
      hasShadow = true
    }
    if (hasOwn(paint, 'shadowOffsetX') && paint.shadowOffsetX !== 0) {
      context.shadowOffsetX = paint.shadowOffsetX
      hasShadow = true
    }
    if (hasOwn(paint, 'shadowOffsetY') && paint.shadowOffsetY !== 0) {
      context.shadowOffsetY = paint.shadowOffsetY
      hasShadow = true
    }
    if (hasShadow) {
      context.shadowColor = paint.shadowColor
    }
  }
}
