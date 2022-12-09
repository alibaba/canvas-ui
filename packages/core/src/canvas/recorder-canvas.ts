import { Matrix, Point, Rect, Size } from '../math'
import { hasOwn } from '../utils'
import type { Canvas } from './canvas'
import type { Image } from './image'
import type { Paint } from './paint'
import type { DrawOp, Picture } from './picture'

export class RecorderCanvas implements Canvas {

  readonly drawOps: DrawOp[] = []

  readonly drawBoundses: Rect[] = []

  readonly clipBoundses: Rect[] = []

  /**
   * @internal
   */
  hasDrawText = false

  save(): void {
    this.drawOps.push({
      name: 'save',
    })
  }
  restore(): void {
    this.drawOps.push({
      name: 'restore',
    })
  }
  translate(tx: number, ty: number): void {
    this.drawOps.push({
      name: 'translate',
      args: [tx, ty],
    })
  }
  rotate(angle: number): void {
    this.drawOps.push({
      name: 'rotate',
      args: [angle],
    })
  }
  transform(matrix: Matrix): void {
    this.drawOps.push({
      name: 'transform',
      args: [matrix],
    })
  }
  resetTransform(): void {
    this.drawOps.push({
      name: 'resetTransform',
    })
  }
  clear(color?: string): void {
    this.drawOps.push({
      name: 'clear',
      args: [color],
    })
  }
  drawRect(x: number, y: number, w: number, h: number, paint: Paint): void {
    this.drawOps.push({
      name: 'drawRect',
      args: [x, y, w, h, paint],
    })
    this.drawBoundses.push(
      addShadowBounds(Rect.fromLTWH(x, y, w, h), paint),
    )
  }
  drawRRect(x: number, y: number, w: number, h: number, rx: number, ry: number, paint: Paint): void {
    this.drawOps.push({
      name: 'drawRRect',
      args: [x, y, w, h, rx, ry, paint],
    })
    this.drawBoundses.push(
      addShadowBounds(Rect.fromLTWH(x, y, w, h), paint),
    )
  }
  drawCircle(x: number, y: number, radius: number, paint: Paint): void {
    this.drawOps.push({
      name: 'drawCircle',
      args: [x, y, radius, paint]
    })
    this.drawBoundses.push(
      addShadowBounds(Rect.fromLTWH(x - radius, y - radius, radius * 2, radius * 2), paint),
    )
  }
  drawImage(image: Image, dx: number, dy: number, dw: number = image.width, dh: number = image.height): void {
    this.drawOps.push({
      name: 'drawImage',
      args: [image, dx, dy, dw, dh],
    })
    this.drawBoundses.push(Rect.fromLTWH(dx, dy, dw, dh))
  }
  drawText(text: string, x: number, y: number, paint: Paint, bx: number, by: number, bw: number, bh: number): void {
    this.drawOps.push({
      name: 'drawText',
      args: [text, x, y, paint, bx, by, bw, bh],
    })
    this.drawBoundses.push(Rect.fromLTWH(bx, by, bw, bh))
    this.hasDrawText = true
  }
  drawPath(path: Path2D, x: number, y: number, paint: Paint, bx: number, by: number, bw: number, bh: number): void {
    this.drawOps.push({
      name: 'drawPath',
      args: [path, x, y, paint, bx, by, bw, bh],
    })
    this.drawBoundses.push(
      addShadowBounds(Rect.fromLTWH(bx, by, bw, bh), paint),
    )
  }
  drawPicture(picture: Picture): void {
    this.drawOps.push({
      name: 'drawPicture',
      args: [picture],
    })
    this.drawBoundses.push(picture.cullRect)
  }
  clipRect(x: number, y: number, w: number, h: number): void {
    this.drawOps.push({
      name: 'clipRect',
      args: [x, y, w, h]
    })
    this.clipBoundses.push(Rect.fromLTWH(x, y, w, h))
  }
  clipRRect(x: number, y: number, w: number, h: number, rx: number, ry: number): void {
    this.drawOps.push({
      name: 'clipRRect',
      args: [x, y, w, h, rx, ry]
    })
    // 暂时禁用 clipBoundses，用于解决 RenderImage 的裁剪绘制缓存问题
    // this.clipBoundses.push(Rect.fromLTWH(x, y, w, h))
  }
  clipCircle(x: number, y: number, radius: number): void {
    this.drawOps.push({
      name: 'clipCircle',
      args: [x, y, radius]
    })
    // 暂时禁用 clipBoundses，用于解决 RenderImage 的裁剪绘制缓存问题
    // this.clipBoundses.push(Rect.fromLTWH(x - radius, y - radius, radius * 2, radius * 2))
  }
  debugDrawCheckerboard(scale: number): void {
    this.drawOps.push({
      name: 'debugDrawCheckerboard',
      args: [scale]
    })
  }
  debugDrawText(text: string, x: number, y: number) {
    this.drawOps.push({
      name: 'debugDrawText',
      args: [text, x, y]
    })
  }
  debugDrawWaterMark(text: string): void {
    this.drawOps.push({
      name: 'debugDrawWaterMark',
      args: [text]
    })
  }
}

function addShadowBounds(bounds: Rect, paint: Paint) {
  if (!hasOwn(paint, 'shadowColor')) {
    return bounds
  }
  if (
    hasOwn(paint, 'shadowBlur')
    || hasOwn(paint, 'shadowOffsetX')
    || hasOwn(paint, 'shadowOffsetY')
  ) {
    const {
      shadowOffsetX = 0,
      shadowOffsetY = 0,
      shadowBlur = 0,
    } = paint

    return Rect.expandToInclude(
      Rect.shift(
        Rect.inflate(bounds, Size.fromWH(shadowBlur / 2, shadowBlur / 2)),
        Point.fromXY(shadowOffsetX / 2, shadowOffsetY / 2),
      ),
      bounds,
    )
  }

  return bounds
}
