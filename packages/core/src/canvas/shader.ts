import { Point } from '../math'
import { NonConstructiable } from '../foundation'

export interface Shader {
  asStyle(context: CanvasFillStrokeStyles): any
}

export class Shader extends NonConstructiable {

  static fromLinearGradient(
    p0: Point,
    p1: Point,
    colorStops: { offset: number, color: string }[],
  ): Shader {
    return new LinearGradientShader(p0, p1, colorStops)
  }

  static fromPattern(pattern: CanvasPattern): Shader {
    return new PatternShader(pattern)
  }

}

class LinearGradientShader implements Shader {
  constructor(
    private readonly p0: Point,
    private readonly p1: Point,
    private readonly colorStops: { offset: number, color: string }[],
  ) { }

  private gradient?: CanvasGradient

  asStyle(context: CanvasRenderingContext2D) {
    if (this.gradient) {
      return this.gradient
    }
    const gradient = context.createLinearGradient(
      this.p0.x,
      this.p0.y,
      this.p1.x,
      this.p1.y,
    )
    for (const { offset, color } of this.colorStops) {
      gradient.addColorStop(offset, color)
    }
    return this.gradient = gradient
  }
}

class PatternShader implements Shader {
  constructor(private readonly pattern: CanvasPattern) { }

  asStyle() {
    return this.pattern
  }
}
