import { ParagraphBuilder, TextWrapper, Tokenizer } from '..'

const LONG_WORD = `Honorificabilitudinitatibus califragilisticexpialidocious Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu 次の単語グレートブリテンおよび北アイルランド連合王国で本当に大きな言葉。`

const SHORT_WORD = `任务 0-0`.repeat(11)

describe('TextWrapper', () => {

  it('不限行数', () => {
    const builder = new ParagraphBuilder()
    builder.addText(LONG_WORD)
    const paragraph = builder.build()
    const textWrapper = new TextWrapper(paragraph)
    const maxWidth = 100
    textWrapper.breakTextIntoLines(
      Tokenizer.parse(paragraph.text),
      maxWidth,
      ({
        width,
        hasEllipsis,
      }) => {
        expect(width).toBeLessThanOrEqual(maxWidth)
        expect(hasEllipsis).toBe(false)
      })
  })

  it('限制 1 行', () => {
    const builder = new ParagraphBuilder()
    builder.addText(SHORT_WORD)
    builder.style.maxLines = 1
    const paragraph = builder.build()
    const textWrapper = new TextWrapper(paragraph)
    const maxWidth = 192
    textWrapper.breakTextIntoLines(
      Tokenizer.parse(paragraph.text),
      maxWidth,
      ({
        seq,
        width,
        hasEllipsis,
      }) => {
        expect(width).toBeLessThanOrEqual(maxWidth)
        expect(hasEllipsis).toBe(seq === 0)
        expect(seq).toBeLessThan(builder.style.maxLines!)
      })
  })

  it('限制 2 行', () => {
    const builder = new ParagraphBuilder()
    builder.addText(SHORT_WORD)
    builder.style.maxLines = 2
    const paragraph = builder.build()
    const textWrapper = new TextWrapper(paragraph)
    const maxWidth = 192
    textWrapper.breakTextIntoLines(
      Tokenizer.parse(paragraph.text),
      maxWidth,
      ({
        seq,
        width,
        hasEllipsis,
      }) => {
        expect(width).toBeLessThanOrEqual(maxWidth)
        expect(hasEllipsis).toBe(seq === 1)
        expect(seq).toBeLessThan(builder.style.maxLines!)
      })
  })

  it('最小宽度', () => {
    const builder = new ParagraphBuilder()
    builder.addText(LONG_WORD)
    const paragraph = builder.build()
    const tokens = Tokenizer.parse(paragraph.text)
    const textWrapper = new TextWrapper(paragraph)
    const lines: string[] = []
    textWrapper.breakTextIntoLines(
      tokens,
      0.001,
      ({
        hasEllipsis,
        text,
      }) => {
        lines.push(text)
        expect(hasEllipsis).toBe(false)
      })
    expect(lines.join('')).toEqual(LONG_WORD.replace(/\s*/ig, ''))
  })

  it('无限宽度', () => {
    const builder = new ParagraphBuilder()
    builder.addText(LONG_WORD)
    const paragraph = builder.build()
    const lines: string[] = []
    const tokens = Tokenizer.parse(paragraph.text)
    const textWrapper = new TextWrapper(paragraph)
    textWrapper.breakTextIntoLines(tokens, Number.MAX_SAFE_INTEGER, ({
      hasEllipsis,
      text,
    }) => {
      lines.push(text)
      expect(hasEllipsis).toBe(false)
    })
    expect(lines[0]).toEqual(LONG_WORD)
    expect(lines).toHaveLength(1)
  })

  describe('breakWord', () => {

    function makeParagraph(text = 'Test') {
      const builder = new ParagraphBuilder()
      builder.addText(text)
      const paragraph = builder.build()
      return paragraph
    }

    it('宽度不足时，保留 0 个字符', () => {
      const paragraph = makeParagraph()
      const textWrapper = new TextWrapper(paragraph)
      const pos = textWrapper.breakWord(paragraph.text, paragraph.computedStyle.font, 0, 0)
      expect(pos).toBe(0)
    })

    it('宽度不足时，至少保留 1 字符', () => {
      const paragraph = makeParagraph()
      const textWrapper = new TextWrapper(paragraph)
      const pos = textWrapper.breakWord(paragraph.text, paragraph.computedStyle.font, 0, 1)
      expect(pos).toBe(1)
    })

    it('宽度足以容纳时，报错', () => {
      const paragraph = makeParagraph()
      const textWrapper = new TextWrapper(paragraph)
      expect(() => {
        textWrapper.breakWord(paragraph.text, paragraph.computedStyle.font, 100000, 1)
      }).toThrow()
    })

  })

})
