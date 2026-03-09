import { ParagraphStyle } from '..'

describe('ParagraphStyle', () => {

  describe('computedStyle', () => {
    it('defaults', () => {
      const style = new ParagraphStyle()
      expect(style.computedStyle).toEqual({
        font: 'normal normal normal 16px Helvetica Neue,Arial,PingFang SC,Microsoft Yahei,Hiragino Sans GB,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
        lineHeight: 24,
        color: '#000',
        maxLines: 0,
        textOverflow: '…',
        textAlign: 'left',
        textStrokeWidth: undefined,
        textStrokeColor: undefined,
      })
    })

    it('font', () => {
      const style = new ParagraphStyle()
      style.font = 'italic 300 12px "FB Armada"'
      expect(style.computedStyle).toEqual({
        font: 'italic normal 300 12px "FB Armada"',
        lineHeight: 24,
        color: '#000',
        maxLines: 0,
        textOverflow: '…',
        textAlign: 'left',
        textStrokeWidth: undefined,
        textStrokeColor: undefined,
      })
    })

    it('fontSize', () => {
      const style = new ParagraphStyle()
      style.fontSize = 14
      expect(style.computedStyle).toEqual({
        font: 'normal normal normal 14px Helvetica Neue,Arial,PingFang SC,Microsoft Yahei,Hiragino Sans GB,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
        lineHeight: 24,
        color: '#000',
        maxLines: 0,
        textOverflow: '…',
        textAlign: 'left',
        textStrokeWidth: undefined,
        textStrokeColor: undefined,
      })
    })

    it('fontFamily', () => {
      const style = new ParagraphStyle()
      style.fontFamily = 'Arial'
      expect(style.computedStyle).toEqual({
        font: 'normal normal normal 16px Arial',
        lineHeight: 24,
        color: '#000',
        maxLines: 0,
        textOverflow: '…',
        textAlign: 'left',
        textStrokeWidth: undefined,
        textStrokeColor: undefined,
      })
    })

    it('textStrokeWidth and textStrokeColor', () => {
      const style = new ParagraphStyle()
      style.textStrokeWidth = 2
      style.textStrokeColor = '#FF0000'
      expect(style.computedStyle).toEqual({
        font: 'normal normal normal 16px Helvetica Neue,Arial,PingFang SC,Microsoft Yahei,Hiragino Sans GB,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
        lineHeight: 24,
        color: '#000',
        maxLines: 0,
        textOverflow: '…',
        textAlign: 'left',
        textStrokeWidth: 2,
        textStrokeColor: '#FF0000',
      })
    })

    it('textStrokeWidth without textStrokeColor', () => {
      const style = new ParagraphStyle()
      style.textStrokeWidth = 1
      const computed = style.computedStyle
      expect(computed.textStrokeWidth).toBe(1)
      expect(computed.textStrokeColor).toBeUndefined()
    })

    it('textStrokeColor without textStrokeWidth', () => {
      const style = new ParagraphStyle()
      style.textStrokeColor = 'red'
      const computed = style.computedStyle
      expect(computed.textStrokeWidth).toBeUndefined()
      expect(computed.textStrokeColor).toBe('red')
    })

    it('textStroke shorthand', () => {
      const style = new ParagraphStyle()
      style.textStroke = '2px red'
      const computed = style.computedStyle
      expect(computed.textStrokeWidth).toBe(2)
      expect(computed.textStrokeColor).toBe('red')
    })

    it('textStroke shorthand with hex color', () => {
      const style = new ParagraphStyle()
      style.textStroke = '1px #FF0000'
      const computed = style.computedStyle
      expect(computed.textStrokeWidth).toBe(1)
      expect(computed.textStrokeColor).toBe('#FF0000')
    })

    it('textStroke shorthand with fractional width', () => {
      const style = new ParagraphStyle()
      style.textStroke = '0.5px blue'
      const computed = style.computedStyle
      expect(computed.textStrokeWidth).toBe(0.5)
      expect(computed.textStrokeColor).toBe('blue')
    })

    it('individual properties override textStroke shorthand', () => {
      const style = new ParagraphStyle()
      style.textStroke = '2px red'
      style.textStrokeWidth = 5
      style.textStrokeColor = 'blue'
      const computed = style.computedStyle
      expect(computed.textStrokeWidth).toBe(5)
      expect(computed.textStrokeColor).toBe('blue')
    })

    it('textStrokeWidth overrides shorthand width only', () => {
      const style = new ParagraphStyle()
      style.textStroke = '2px red'
      style.textStrokeWidth = 5
      const computed = style.computedStyle
      expect(computed.textStrokeWidth).toBe(5)
      expect(computed.textStrokeColor).toBe('red')
    })

    it('textStrokeColor overrides shorthand color only', () => {
      const style = new ParagraphStyle()
      style.textStroke = '2px red'
      style.textStrokeColor = 'blue'
      const computed = style.computedStyle
      expect(computed.textStrokeWidth).toBe(2)
      expect(computed.textStrokeColor).toBe('blue')
    })
  })
})

describe('Paragraph', () => {
  describe('layout', () => {
    //
  })
})
