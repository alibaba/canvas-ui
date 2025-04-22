import { assert } from '@canvas-ui/assert'
import { NonConstructiable } from '../foundation'
import { CrossPlatformCanvasElement, CrossPlatformOffscreenCanvas, PlatformAdapter } from '../platform'
import { FontProps } from './font-props'

export interface FontMetrics {
  ascent: number
  descent: number
  fontSize: number
  cssFontProp: string
}

const fontMetricsCache: Record<FontMetrics['cssFontProp'], FontMetrics> = {}

type MeasureOptions = {
  context: CanvasFillStrokeStyles & CanvasRect & CanvasTextDrawingStyles & CanvasText & CanvasImageData
  canvas: CrossPlatformCanvasElement | CrossPlatformOffscreenCanvas
  metricsString: string
  baselineSymbol: string
  baselineMultiplier: number
  heightMultiplier: number
}

export class FontMetrics extends NonConstructiable {

  static readonly HEIGHT_MULTIPLIER = 2.0;

  private static _defaultMeasureOptions?: MeasureOptions
  static get defaultMeasureOptions() {
    if (FontMetrics._defaultMeasureOptions) {
      return FontMetrics._defaultMeasureOptions
    }
    const options = {
      width: 3,
      height: 3,
    }
    const context = PlatformAdapter.createRenderingContext(options.width, options.height)
    assert(context)
    return FontMetrics._defaultMeasureOptions = {
      canvas: context.canvas,
      context,
      metricsString: '|ÉqÅM',
      baselineSymbol: 'M',
      baselineMultiplier: 1.4,
      heightMultiplier: 2,
    }
  }

  /**
   * 获得字体的 ascent 和 descent 等信息
   * 
   * 由于字体的选择是逐字进行的，也就是说即使某个字符周围都在某个字体中可以显示，但该字符在当前的字体文件中没有适合的图形，那么会继续尝试列表中靠后的字体
   * 
   * 所以含有多个 font-family 时，测量结果可能不准确
   * 
   * @param cssFontProp CSS 的 font 属性
   */
  static measure(cssFontProp: string, options?: Partial<MeasureOptions>): FontMetrics {
    if (fontMetricsCache[cssFontProp]) {
      return fontMetricsCache[cssFontProp]
    }

    const {
      canvas,
      context,
      metricsString,
      baselineSymbol,
      baselineMultiplier,
      heightMultiplier,
    } = options
        ? { ...FontMetrics.defaultMeasureOptions, ...options }
        : FontMetrics.defaultMeasureOptions

    const fontProps = FontProps.from(cssFontProp)
    FontProps.validateLengthUnit(fontProps['font-size'], 'px')

    const fontMetrics: FontMetrics = {
      ascent: 0,
      descent: 0,
      fontSize: 0,
      cssFontProp,
    }

    // 定位 baseline, 测量画布宽高
    context.font = cssFontProp
    const baseline = Math.ceil(context.measureText(baselineSymbol).width * baselineMultiplier)
    const canvasWidth = Math.ceil(context.measureText(metricsString).width)
    const canvasHeight = Math.ceil(heightMultiplier * baseline)

    // 应用画布宽高
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // 填充背景色
    context.fillStyle = '#f00'
    context.fillRect(0, 0, canvasWidth, canvasHeight)

    // 绘制测量用文本
    context.font = cssFontProp
    context.textBaseline = 'alphabetic'
    context.fillStyle = '#000'
    context.fillText(metricsString, 0, baseline)

    // 得到像素信息
    const pixels = context.getImageData(0, 0, canvasWidth, canvasHeight).data
    const totalPixelCount = pixels.length
    const rowPixelCount = canvasWidth * 4

    let i = 0
    let cursor = 0
    let stop = false

    // 探测 `ascent`: 从上到下扫描，直到遇到不是红色的色值
    for (i = 0; i < baseline; ++i) {
      for (let j = 0; j < rowPixelCount; j += 4) {
        if (pixels[cursor + j] !== 255) {
          stop = true
          break
        }
      }
      if (!stop) {
        cursor += rowPixelCount
      } else {
        break
      }
    }

    fontMetrics.ascent = baseline - i

    cursor = totalPixelCount - rowPixelCount
    stop = false

    // 探测 `descent`: 从下到上扫描，直到遇到不是红色的色值
    for (i = canvasHeight; i > baseline; --i) {
      for (let j = 0; j < rowPixelCount; j += 4) {
        if (pixels[cursor + j] !== 255) {
          stop = true
          break
        }
      }

      if (!stop) {
        cursor -= rowPixelCount
      } else {
        break
      }
    }

    fontMetrics.descent = i - baseline
    fontMetrics.fontSize = fontMetrics.ascent + fontMetrics.descent

    return fontMetricsCache[cssFontProp] = fontMetrics
  }

  static measureWidth(
    text: string,
    cssFontProp: string,
    cache: Record<string, number>,
  ): number {
    if (cache[text]) {
      return cache[text]
    }
    const { context } = FontMetrics.defaultMeasureOptions
    context.font = cssFontProp
    return cache[text] = context.measureText(text).width
  }

}
