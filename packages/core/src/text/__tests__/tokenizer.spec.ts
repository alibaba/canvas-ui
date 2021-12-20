import { Tokenizer } from '..'

describe('Tokenizer', () => {
  test('isBreakingSpace', () => {
    expect(Tokenizer.isBreakingSpace(' '.codePointAt(0)!)).toBe(true)
    expect(Tokenizer.isBreakingSpace('  '.codePointAt(0)!)).toBe(true)
    expect(Tokenizer.isBreakingSpace('A'.codePointAt(0)!)).toBe(false)
  })

  test('isNewline', () => {
    expect(Tokenizer.isNewline('\r')).toBe(true)
    expect(Tokenizer.isNewline('\n')).toBe(true)
  })

  test('isDigitOrLetter', () => {
    const digits = '0123456789'
    const letters = 'abcdefghijklmnopqrstuvwxyz'
    for (const char of digits.concat(letters).concat(letters.toUpperCase())) {
      expect(Tokenizer.isDigitOrLetter(char)).toBe(true)
    }
    expect(Tokenizer.isDigitOrLetter(' ')).toBe(false)
  })

  test('isPunctuationStart', () => {
    expect(Tokenizer.isPunctuationStart('“')).toBe(true)
    expect(Tokenizer.isPunctuationStart(',')).toBe(false)
  })

  test('isPunctuationEnd', () => {
    expect(Tokenizer.isPunctuationEnd('“')).toBe(false)
    expect(Tokenizer.isPunctuationEnd(',')).toBe(true)
  })

  test('isRegionalIndicator', () => {
    expect(Tokenizer.isRegionalIndicator('🇨'.codePointAt(0)!)).toBe(true)
  })

  describe('parse', () => {

    test('基本的中英混排和后置标点', () => {
      // const str = ' 当前行首有\u0009空格。\u2003at the\u2000\n   当前行首有3个空格.\u3000行首没有空格。 And no spaces at the end. check wrapping abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz. I \u2665 text. 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2     '
      // expect(Tokenizer.parse(str)).toEqual({})
      const str = '你好，世界。Hello, World.'
      expect(Tokenizer.parse(str)).toEqual(['你', '好，', '世', '界。', 'Hello, ', 'World.'])
    })

    test('连续的空白和前置空白', () => {
      const str = '   \u0009    leading spaces, \u2003      at the end.'
      expect(Tokenizer.parse(str)).toEqual(['   \u0009    ', 'leading ', 'spaces, \u2003      ', 'at ', 'the ', 'end.'])
    })

    test('颜文字混排', () => {
      const str = '✂️     复制 and 📋📋 Paste'
      expect(Tokenizer.parse(str)).toEqual(['✂️     ', '复', '制 ', 'and ', '📋', '📋 ', 'Paste'])
    })

    test('Variation Selectors', () => {
      const str = '✂️ Copy'
      expect(Tokenizer.parse(str)).toEqual(['✂️ ', 'Copy'])
    })

    test('Emoji Modifiers', () => {
      const str = '👶🏻👦🏻'
      expect(Tokenizer.parse(str)).toEqual(['👶🏻', '👦🏻'])
    })

    test('Emoji flags', () => {
      const str = 'English🇬🇧\n汉语🇨🇳\rにほんご🇯🇵'
      expect(Tokenizer.parse(str)).toEqual([
        'English',
        '🇬🇧',
        '\n',
        '汉',
        '语',
        '🇨🇳',
        '\r',
        'に',
        'ほ',
        'ん',
        'ご',
        '🇯🇵',
      ])
    })
  })
})
