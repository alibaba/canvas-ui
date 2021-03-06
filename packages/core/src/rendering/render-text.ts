import { assert } from '@canvas-ui/assert'
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
    this.style.on('maxWidth', this.handleMaxWidthChange, this) // ??????????????? Flex ????????????????????? maxWidth
  }

  handleTextAlignChange() {
    // todo(haocong): ??????????????????????????????????????????????????????
    this._paragraph = undefined
    this.markLayoutDirty()
    this.markPaintDirty()
  }

  handleTextStyleChange() {
    this._paragraph = undefined
    this.markLayoutDirty()
    // ?????????????????? size ??????????????????????????????????????? (??????????????????)
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
      // ????????? width ??? height
      this.paragraph.layout(width)
      return Size.fromWH(width, height)
    }

    if (widthMode === Yoga.MEASURE_MODE_EXACTLY) {

      if (heightMode === Yoga.MEASURE_MODE_AT_MOST) {
        // ????????? width ???????????????
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
      // ????????? height ??? maxWidth
      this.paragraph.layout(width)
      return {
        width: this.paragraph.size.width,
        height: this.paragraph.size.height,
      }
    }

    // ????????? height ????????? width
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
    assert(this._paragraph, '_paragraph ???????????????')
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
    assert(typeof paddingLeft === 'number', 'paddingRight ????????? number')
    assert(typeof paddingTop === 'number', 'paddingTop ????????? number')
    const shiftedOffset = Point.add(offset, Point.fromXY(paddingLeft, paddingTop))

    // ??????????????? width????????? width ????????????????????????????????????
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
    // ????????????????????????????????? yogaMeasure ???????????????????????????????????????
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
    assert(typeof paddingLeft === 'number', `paddingLeft ????????? number`)
    assert(typeof paddingTop === 'number', `paddingTop ????????? number`)
    assert(typeof paddingRight === 'number', `paddingRight ????????? number`)
    assert(typeof paddingBottom === 'number', `paddingBottom ????????? number`)

    // ???????????????
    this.paragraph.layout(
      typeof width === 'number'
        ? width - paddingLeft - paddingRight
        : typeof maxWidth === 'number'
          ? maxWidth - paddingLeft - paddingRight
          : Number.MAX_SAFE_INTEGER
    )

    let size: Mut<Size>

    // ?????? size
    if (typeof width === 'number' && typeof height === 'number') {
      // ??????????????? width ??? height??????????????????????????????
      size = Size.fromWH(width, height)
    } else if (typeof width === 'number') {
      // ???????????? width????????? height ????????? height ??????
      size = Size.fromWH(width, this.paragraph.size.height)
    } else if (typeof height === 'number') {
      // ???????????? height???????????? width ????????? width ??????
      size = Size.fromWH(this.paragraph.size.width, height)
    } else {
      // ??????????????????????????? size
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
    // RenderText ????????????????????????????????????????????????
    return true
  }

}
