import { NonConstructiable } from '../foundation'

export interface Image {
  source: CanvasImageSource

  /**
   * Image 在 source 中的 x
   */
  sx?: number

  /**
   * Image 在 source 中的 y
   */
  sy?: number
  width: number
  height: number
}

export class Image extends NonConstructiable {
  static fromXYWH (
    source: CanvasImageSource,
    sx: number,
    sy: number,
    sw: number, 
    sh: number,
  ) {
    return {
      source,
      sx,
      sy,
      width: sw,
      height: sh,
    }
  }

  static from(
    source: CanvasImageSource,
    width?: number,
    height?: number,
  ): Image {
    if (source instanceof SVGImageElement) {
      if (typeof width !== 'number') {
        throw new TypeError('SVG Element requires width in pixels.')
      }
      if (typeof height !== 'number') {
        throw new TypeError('SVG Element requires height in pixels.')
      }
      return {
        source,
        width,
        height,
      }
    }

    return {
      source,
      width: width ?? source.width,
      height: height ?? source.height,
    }
  }
}

