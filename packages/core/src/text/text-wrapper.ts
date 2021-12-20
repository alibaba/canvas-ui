import assert from 'assert'
import { FontMetrics } from './font-metrics'
import { Paragraph } from './paragraph'
import { Tokenizer } from './tokenizer'

export type LineMetrics = Pick<FontMetrics, 'ascent' | 'descent' | 'fontSize'>

export type AddLineOptions = {
  seq: number
  text: string
  width: number
  hasEllipsis: boolean
  lineMetrics: LineMetrics
}

type AddLineFunction = (options: AddLineOptions) => void

export class TextWrapper {

  constructor(
    private readonly paragraph: Paragraph
  ) {
    this.maxLines = paragraph.computedStyle.maxLines
  }

  /**
   * 当前行序号
   */
  private seq = 0

  /**
   * 当前行 text
   */
  private text = ''

  /**
   * 当前行 width
   */
  private width = 0

  /**
   * 最大行数
   */
  private maxLines = 0

  breakTextIntoLines(
    tokens: string[],
    maxWidth: number,
    callback: AddLineFunction
  ) {

    const {
      computedStyle: {
        font,
        textOverflow,
      }
    } = this.paragraph

    // 共享的 LineMetrics
    const lineMetrics: LineMetrics = FontMetrics.measure(font)

    const iterator = tokens[Symbol.iterator]()
    let ptr = iterator.next()

    while (!ptr.done) {

      const text = ptr.value

      // 硬换行
      if (Tokenizer.isNewline(text)) {

        // 在行尾追加换行符
        this.text += text

        // 另起一行
        this.endLine(
          callback,
          false,
          lineMetrics,
        )

        if (this.canCommit) {
          ptr = iterator.next()
          continue
        } else {
          break
        }
      }

      const textWidth = this.measureWidth(text, font)
      const lineMaxWidth = this.getLineMaxWidth(maxWidth)

      if (this.width + textWidth > lineMaxWidth) {
        // 剩余宽度不足时
        const trimmedText = text.trimEnd()
        const trimmedTextWidth = this.measureWidth(trimmedText, font)
        if (this.width + trimmedTextWidth > lineMaxWidth) {
          // 去除尾部空格，仍然不足的

          // 当前是最后一行，想办法填满剩余空间
          if (this.isLastLine) {

            const textOverflowWidth = this.measureWidth(textOverflow, font)
            const pos = this.breakWord(
              text,
              font,
              lineMaxWidth - this.width,
              0,
            )
            if (pos > 0) {
              this.text += text.substr(0, pos)
              this.width += this.measureWidth(text.substr(0, pos), font)
            }
            this.text += textOverflow
            this.width += textOverflowWidth
            ptr = iterator.next()
          } else if (this.width === 0) {
            // 超长 token 断词
            const pos = this.breakWord(
              text,
              font,
              maxWidth,
            )
            this.text += text.substr(0, pos)
            this.width += this.measureWidth(text.substr(0, pos), font)
            ptr = {
              value: text.substr(pos)
            }
          }

          this.endLine(
            callback,
            this.isLastLine,
            lineMetrics,
          )

        } else {
          this.width += trimmedTextWidth
          this.text += trimmedText
          ptr = iterator.next()
        }
      } else {
        this.width += textWidth
        this.text += text
        ptr = iterator.next()
      }

      // 所有行已经处理完
      if (!this.canCommit) {
        break
      }
    }

    // 不要忘记最后一行
    if (this.text) {
      this.endLine(
        callback,
        this.isLastLine,
        lineMetrics,
      )
    }
  }

  breakWord(
    text: string,
    font: string,
    breakWidth: number,
    atLeast: 0 | 1 = 1,
  ) {
    const n = text.length
    assert(n > 0, `text 不能是空字符串`)
    for (let i = 0; i < n; i++) {
      const subTextWidth = this.measureWidth(text.substr(0, i + 1), font)
      if (subTextWidth > breakWidth) {
        return Math.max(i, atLeast)
      }
    }
    assert.doesNotThrow(() => {
      assert(false, `剩余空间足够容纳整个文本，不需要断词。subTextWidth: ${this.measureWidth(text, font)}, breakWidth: ${breakWidth}`)
    })
    return -1
  }

  private measureWidthCache = {}

  private measureWidth(text: string, font: string) {
    return FontMetrics.measureWidth(text, font, this.measureWidthCache)
  }

  get isLastLine() {
    return this.maxLines !== 0 && this.seq >= this.maxLines - 1
  }

  getLineMaxWidth(maxWidth: number) {
    if (this.isLastLine) {
      return maxWidth - this.textOverflowWidth
    }
    return maxWidth
  }

  /**
   * 结束当前行
   */
  private endLine(
    callback: AddLineFunction,
    hasEllipsis: boolean,
    lineMetrics: LineMetrics,
  ) {
    assert(this.canCommit)
    callback({
      seq: this.seq,
      text: this.text,
      width: this.width,
      hasEllipsis,
      lineMetrics,
    })
    this.seq++
    this.width = 0
    this.text = ''
  }


  /**
   * 当前行是否可以 commit
   */
  get canCommit() {
    return this.maxLines === 0 || this.seq < this.maxLines
  }

  get textOverflow() {
    return this.paragraph.computedStyle.textOverflow
  }

  private _textOverflowWidth = -1
  get textOverflowWidth() {
    if (this._textOverflowWidth >= 0) {
      return this._textOverflowWidth
    }
    return this._textOverflowWidth = this.measureWidth(this.textOverflow, this.paragraph.computedStyle.font)
  }

}
