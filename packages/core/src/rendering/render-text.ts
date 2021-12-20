import assert from 'assert'
import { Mut } from '../foundation'
import { Point, Size } from '../math'
import { Paragraph, ParagraphBuilder } from '../text'
import { PaintingContext } from './painting-context'
import { RenderBox } from './render-box'
import { StyleMap } from './style-map'
import { Yoga, YogaMeasure } from './yoga'

export class RenderText extends RenderBox {

  get paragraph() {
    if (this._paragraph) {
      return this._paragraph
    }
    const builder = new ParagraphBuilder()
    builder.addText(this._text)
    if (this.style.has('fontStyle')) {
      builder.style.fontStyle = this.style.fontStyle
    }
    if (this.style.has('fontVariant')) {
      builder.style.fontVariant = this.style.fontVariant
    }
    if (this.style.has('fontWeight')) {
      builder.style.fontWeight = this.style.fontWeight
    }
    if (this.style.has('fontStretch')) {
      builder.style.fontStretch = this.style.fontStretch
    }
    if (this.style.has('fontSize')) {
      builder.style.fontSize = this.style.fontSize
    }
    if (this.style.has('lineHeight')) {
      builder.style.lineHeight = this.style.lineHeight
    }
    if (this.style.has('fontFamily')) {
      builder.style.fontFamily = this.style.fontFamily
    }
    if (this.style.has('font')) {
      builder.style.font = this.style.font
    }
    if (this.style.has('color')) {
      builder.style.color = this.style.color
    }
    if (this.style.has('maxLines')) {
      builder.style.maxLines = this.style.maxLines
    }
    if (this.style.has('textAlign')) {
      builder.style.textAlign = this.style.textAlign
    }
    return this._paragraph = builder.build()
  }
  private _paragraph?: Paragraph

  protected override trackStyle() {
    super.trackStyle()
    this.style.on('fontStyle', this.handleTextStyleChange, this)
    this.style.on('fontVariant', this.handleTextStyleChange, this)
    this.style.on('fontWeight', this.handleTextStyleChange, this)
    this.style.on('fontStretch', this.handleTextStyleChange, this)
    this.style.on('fontSize', this.handleTextStyleChange, this)
    this.style.on('lineHeight', this.handleTextStyleChange, this)
    this.style.on('fontFamily', this.handleTextStyleChange, this)
    this.style.on('font', this.handleTextStyleChange, this)
    this.style.on('color', this.handleTextStyleChange, this)
    this.style.on('maxLines', this.handleTextStyleChange, this)
    this.style.on('textAlign', this.handleTextAlignChange, this)
    this.style.on('maxWidth', this.handleMaxWidthChange, this) // 无论是否是 Flex 子节点，都支持 maxWidth
  }

  handleTextAlignChange() {
    // todo(haocong): 可以做到修改文本对齐时，避免重新布局
    this._paragraph = undefined
    this.markLayoutDirty()
    this.markPaintDirty()
  }

  handleTextStyleChange() {
    this._paragraph = undefined
    this.markLayoutDirty()
    // 重新布局后的 size 可能没有变化，但仍要求重绘 (相关文本样式)
    this.markPaintDirty()
  }

  protected override handleMaxWidthChange(value: StyleMap['maxWidth'] = 'auto') {
    if (this._yogaNode) {
      super.handleMaxWidthChange(value)
      return
    }
    this.markLayoutDirty()
  }

  override yogaMeasure: YogaMeasure = (width, widthMode, height, heightMode) => {
    if (
      widthMode === Yoga.MEASURE_MODE_EXACTLY
      && heightMode === Yoga.MEASURE_MODE_EXACTLY
    ) {
      // 确定的 width 和 height
      this.paragraph.layout(width)
      return Size.fromWH(width, height)
    }

    if (widthMode === Yoga.MEASURE_MODE_EXACTLY) {

      if (heightMode === Yoga.MEASURE_MODE_AT_MOST) {
        // 固定的 width 和最大高度
        this.paragraph.layout(width)
        return {
          width,
          height,
        }
      }

      this.paragraph.layout(width)
      return {
        width,
        height: this.paragraph.size.height,
      }
    }

    if (heightMode === Yoga.MEASURE_MODE_EXACTLY) {
      // 固定的 height 和 maxWidth
      this.paragraph.layout(width)
      return {
        width: this.paragraph.size.width,
        height: this.paragraph.size.height,
      }
    }

    // 固定的 height 和最大 width
    this.paragraph.layout(width)
    return {
      width: this.paragraph.size.width,
      height: this.paragraph.size.height,
    }
  }

  get text() {
    return this._text
  }
  set text(value) {
    if (value === this._text) {
      return
    }
    this._text = value
    this._paragraph = undefined
    this.markLayoutDirty()
  }
  private _text = ''

  paint(context: PaintingContext, offset: Point) {
    assert(this._paragraph, '_paragraph 对象不存在')
    const hasSize = !Size.isZero(this._size)
    const { _boxDecorator } = this
    if (hasSize) {
      _boxDecorator?.paintBackground(context, offset, this._size)
    }
    const {
      paddingLeft = 0,
      paddingTop = 0,
      width,
    } = this.style
    assert(typeof paddingLeft === 'number', 'paddingRight 仅支持 number')
    assert(typeof paddingTop === 'number', 'paddingTop 仅支持 number')
    const shiftedOffset = Point.add(offset, Point.fromXY(paddingLeft, paddingTop))

    // 如果设置了 width，则以 width 居中，否则以实际宽度居中
    const maxLineWidth =
      typeof width === 'number'
        ? width
        : this._paragraph.size.width
    this._paragraph.paint(context.canvas, shiftedOffset, maxLineWidth)
    if (hasSize) {
      _boxDecorator?.paintBorder(context, offset, this._size)
    }
  }

  protected override updateOffsetAndSizeFromYogaNode() {
    super.updateOffsetAndSizeFromYogaNode()
    // 最后的机会，如果没有在 yogaMeasure 中布局过，则在这里进行布局
    if (!this._paragraph && this.style.display !== 'none') {
      this.paragraph.layout(this._size.width)
    }
  }

  protected override updateOffsetAndSizeFromStyle() {
    const {
      width,
      maxWidth,
      height,
      left,
      top,
      paddingLeft = 0,
      paddingTop = 0,
      paddingRight = 0,
      paddingBottom = 0,
    } = this.style

    assert(typeof width !== 'string', 'Percent unit is not supported')
    assert(typeof height !== 'string', 'Percent unit is not supported')
    assert(typeof left !== 'string', 'Percent unit is not supported')
    assert(typeof top !== 'string', 'Percent unit is not supported')
    assert(typeof paddingLeft === 'number', `paddingLeft 仅支持 number`)
    assert(typeof paddingTop === 'number', `paddingTop 仅支持 number`)
    assert(typeof paddingRight === 'number', `paddingRight 仅支持 number`)
    assert(typeof paddingBottom === 'number', `paddingBottom 仅支持 number`)

    // 段落的布局
    this.paragraph.layout(
      typeof width === 'number'
        ? width - paddingLeft - paddingRight
        : typeof maxWidth === 'number'
          ? maxWidth - paddingLeft - paddingRight
          : Number.MAX_SAFE_INTEGER
    )

    let size: Mut<Size>

    // 更新 size
    if (typeof width === 'number' && typeof height === 'number') {
      // 同时设置了 width 和 height，则使用用户设置的值
      size = Size.fromWH(width, height)
    } else if (typeof width === 'number') {
      // 仅设置了 width，则最 height 由段落 height 决定
      size = Size.fromWH(width, this.paragraph.size.height)
    } else if (typeof height === 'number') {
      // 仅设置了 height，则最终 width 由段落 width 决定
      size = Size.fromWH(this.paragraph.size.width, height)
    } else {
      // 否则直接使用段落的 size
      size = Size.clone(this.paragraph.size)
    }

    size.width += paddingLeft + paddingRight
    size.height += paddingTop + paddingBottom
    this.size = size
    this.offset = Point.fromXY(left ?? 0, top ?? 0)
  }

  redepthChildren() {
    // noop
  }

  visitChildren() {
    // noop
  }

  override hitTestSelf() {
    // RenderText 没有子节点，所以他们总是命中自己
    return true
  }

}
