import type { Matrix } from '../math'
import type { Image } from './image'
import type { Paint } from './paint'
import type { Picture } from './picture'
export interface Canvas {
  save(): void
  restore(): void

  translate(tx: number, ty: number): void
  rotate(angle: number): void
  transform(matrix: Matrix): void
  resetTransform(): void

  clear(color?: string): void
  drawRect(x: number, y: number, w: number, h: number, paint: Paint): void
  drawRRect(x: number, y: number, w: number, h: number, rx: number, ry: number, paint: Paint): void
  drawCircle(x: number, y: number, radius: number, paint: Paint): void
  drawImage(image: Image, dx: number, dy: number, dw?: number, dh?: number): void
  drawText(text: string, x: number, y: number, paint: Paint, bx: number, by: number, bw: number, bh: number): void
  drawPath(path: Path2D, x: number, y: number, paint: Paint, bx: number, by: number, bw: number, bh: number): void
  drawPicture(picture: Picture): void

  clipRect(x: number, y: number, w: number, h: number): void
  clipRRect(x: number, y: number, w: number, h: number, rx: number, ry: number): void
  clipCircle(x: number, y: number, radius: number): void

  debugDrawCheckerboard(scale: number): void
  debugDrawText(text: string, x: number, y: number): void
  debugDrawWaterMark(text: string, x: number, y: number, w: number, h: number): void
}
