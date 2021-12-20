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
      })
    })
  })
})

describe('Paragraph', () => {
  describe('layout', () => {
    //
  })
})
