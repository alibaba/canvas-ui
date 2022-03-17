
import { assert } from '@canvas-ui/assert'
import { Property } from 'csstype'
import { Canvas } from '../canvas'
import { DebugFlags } from '../debug'
import { Log, Mut } from '../foundation'
import { Point, Size } from '../math'
import { FontProps } from './font-props'
import { TextLine } from './text-line'
import { AddLineOptions, TextWrapper } from './text-wrapper'
import { Tokenizer } from './tokenizer'

type ComputedParagraphStyle = {
  font: Property.Font
  lineHeight: number
  color: string
  maxLines: number
  textOverflow: string
  textShadow?: Property.TextShadow
  textAlign: Property.TextAlign
}

export class ParagraphStyle {

  static readonly defaultStyle = {
    fontFamily: 'Helvetica Neue,Arial,PingFang SC,Microsoft Yahei,Hiragino Sans GB,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
    fontSize: 16,
    fontStyle: 'normal',
    fontVariant: 'normal',
    fontWeight: 'normal',
    lineHeight: 24,
    color: '#000',
    maxLines: 0,
    textOverflow: '…',
    textAlign: 'left',
  } as const

  fontStyle?: Property.FontStyle
  fontVariant?: Property.FontVariant
  fontWeight?: Property.FontWeight
  fontStretch?: Property.FontStretch
  fontSize?: number
  lineHeight?: number
  fontFamily?: Property.FontFamily
  font?: Property.Font
  color?: Property.Color
  textShadow?: Property.TextShadow
  maxLines?: number
  textAlign?: Property.TextAlign

  get computedStyle(): ComputedParagraphStyle {

    const { defaultStyle } = ParagraphStyle

    const fontProps = this.font ? FontProps.from(this.font) : null
    const fontSize = fontProps?.['font-size'] ?? `${this.fontSize ?? defaultStyle.fontSize}px`
    const fontStyle = fontProps?.['font-style'] ?? this.fontStyle ?? defaultStyle.fontStyle
    const fontVariant = fontProps?.['font-variant'] ?? this.fontVariant ?? defaultStyle.fontVariant
    const fontWeight = fontProps?.['font-weight'] ?? this.fontWeight ?? defaultStyle.fontWeight
    const fontFamily = fontProps?.['font-family'] ?? this.fontFamily ?? defaultStyle.fontFamily

    const lineHeight = fontProps?.['line-height']
      ? FontProps.getLengthValue(String(fontProps?.['line-height']), 'px')
      : this.lineHeight ?? defaultStyle.lineHeight
    const font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize} ${fontFamily}`
    const color = this.color ?? defaultStyle.color
    const maxLines = typeof this.maxLines === 'number'
      ? this.maxLines
      : this.maxLines === 'none'
        ? 0
        : defaultStyle.maxLines

    const textAlign = this.textAlign ?? defaultStyle.textAlign

    return {
      font,
      lineHeight,
      color,
      maxLines,
      textOverflow: defaultStyle.textOverflow,
      textAlign,
    }
  }
}

export class ParagraphBuilder {

  private _style?: ParagraphStyle
  get style() {
    return this._style ??= new ParagraphStyle()
  }

  private text = ''

  addText(text: string) {
    this.text += text
  }

  build(): Paragraph {
    return new Paragraph(
      this.text,
      this.style.computedStyle,
    )
  }
}

export class Paragraph {

  size = Size.zero

  constructor(
    readonly text: string,
    readonly computedStyle: ComputedParagraphStyle,
  ) { }

  private tokens?: string[]

  private lines: TextLine[] = []

  private maxWidth = -1

  private addLine({
    seq,
    text,
    width,
    hasEllipsis,
    lineMetrics,
  }: AddLineOptions) {
    const line = new TextLine(
      this,
      seq,
      text,
      width,
      hasEllipsis,
      lineMetrics,
    )
    this.lines.push(line)
    this.size = Size.max(
      this.size,
      Size.fromWH(line.size.width, line.offset.y + line.size.height)
    )
  }

  @Log({ disabled: true })
  layout(maxWidth: number) {
    if (maxWidth === this.maxWidth) {
      return
    }
    this.maxWidth = maxWidth
    assert(maxWidth > 0, `maxWidth must greater than zero`)

    // 清空先前布局好的行，如果有
    this.lines.length = 0
    const textWrapper = new TextWrapper(this)
    textWrapper.breakTextIntoLines(
      this.tokens ??= Tokenizer.parse(this.text),
      maxWidth,
      this.addLine.bind(this),
    )
  }

  paint(canvas: Canvas, offset: Point, maxLineWidth: number) {
    const { textAlign } = this.computedStyle
    const shift: Mut<Point> = Point.clone(Point.zero)
    for (const line of this.lines) {
      if (textAlign === 'left') {
        line.paint(canvas, offset)
        if (DebugFlags.paintTextLineBounds) {
          line.debugPaintBounds(canvas, offset)
        }
      } else {
        if (textAlign === 'center') {
          shift.x = (maxLineWidth - line.width) * 0.5
        } else if (textAlign === 'right') {
          shift.x = maxLineWidth - line.width
        }
        const shiftedOffset = Point.add(shift, offset)
        line.paint(canvas, shiftedOffset)
        if (DebugFlags.paintTextLineBounds) {
          line.debugPaintBounds(canvas, shiftedOffset)
        }
      }
    }
  }


}
