/**
 * 简单的分词器
 */
export class Tokenizer {

  static parse(str: string): string[] {

    if (str.length === 0) {
      return []
    }

    const tokens: string[] = []
    const chars = Array.from(str)
    const n = chars.length

    // 上一个字符
    let prevChar = chars[0]

    // 上一个字符是字母或数字
    let prevCharIsDigitOrLetter = Tokenizer.isDigitOrLetter(prevChar)

    // 上一个字符是空白字符
    let prevCharIsWhitespace = Tokenizer.isBreakingSpace(prevChar.codePointAt(0)!)

    // 上一个字符是否是 regional indicator
    let prevCharIsRegionalIndicator = Tokenizer.isRegionalIndicator(prevChar.codePointAt(0)!)

    // 当前分组
    let currentToken = prevChar

    for (let i = 1; i < n; i++) {
      const currentChar = chars[i]

      const currentCharCode = currentChar.codePointAt(0)!
      const currentCharIsDigitOrLetter = Tokenizer.isDigitOrLetter(currentChar)
      const currentCharIsWhitespace = Tokenizer.isBreakingSpace(currentCharCode)
      const currentCharIsRegionalIndicator = Tokenizer.isRegionalIndicator(currentCharCode)

      const shouldKeep =
        Tokenizer.isPunctuationStart(prevChar) // 前一个字符是前置标点
        || Tokenizer.isPunctuationEnd(currentChar) // 后置标点
        || prevCharIsDigitOrLetter && currentCharIsDigitOrLetter // 连续英数
        || !prevCharIsWhitespace && currentCharIsWhitespace // 首个空格
        || prevCharIsWhitespace && currentCharIsWhitespace // 连续的空格
        || Tokenizer.isVariationSelector(currentCharCode) // emoji variation selector
        || prevCharIsRegionalIndicator && currentCharIsRegionalIndicator // emoji flags
        || Tokenizer.isZWJ(currentCharCode) // ZWJ
        || Tokenizer.isEmojiModifier(currentCharCode) // emoji modifier

      // console.info({
      //   prevChar,
      //   currentChar,
      //   currentToken,
      //   prevCharIsWhitespace,
      //   currentCharIsWhitespace,
      //   shouldKeep,
      //   currentCharCode: currentCharCode.toString(16),
      //   currentCharIsRegionalIndicator,
      //   'currentChar.isVariationSelectors': Tokenizer.isVariationSelector(currentCharCode),
      //   'currentChar.isEmojiModifier': Tokenizer.isEmojiModifier(currentCharCode),
      // })

      prevChar = currentChar
      prevCharIsDigitOrLetter = currentCharIsDigitOrLetter
      prevCharIsWhitespace = currentCharIsWhitespace
      prevCharIsRegionalIndicator = currentCharIsRegionalIndicator

      if (shouldKeep) {
        currentToken += currentChar
      } else {
        tokens.push(currentToken)
        currentToken = currentChar
      }
    }

    if (currentToken !== '') {
      tokens.push(currentToken)
    }

    return tokens
  }

  static isPunctuationStart(char: string): boolean {
    return PUNCTUATION_START.indexOf(char) !== -1
  }

  static isPunctuationEnd(char: string): boolean {
    return PUNCTUATION_END.indexOf(char) !== -1
  }

  static isDigitOrLetter(char: string): boolean {
    return DIGIT_OR_LETTER.test(char)
  }

  static isNewline(char: string): boolean {
    return char === '\n' || char === '\r'
  }

  static isBreakingSpace(codePoint: number): boolean {
    return BREAKING_SPACES.indexOf(codePoint) !== -1
  }

  static isVariationSelector(codePoint: number) {
    // https://unicode.org/reports/tr51/#Emoji_Variation_Sequences
    return 0xFE00 <= codePoint && codePoint <= 0xFE0F
  }

  static isEmojiModifier(codePoint: number) {
    // https://unicode.org/reports/tr51/#multiperson_skintones
    return 0x1F3FB <= codePoint && codePoint <= 0x1F3FF
  }

  static isZWJ(codePoint: number) {
    // https://unicode.org/reports/tr51/#def_emoji_zwj_element
    return codePoint === 0x200D
  }

  static isRegionalIndicator(codePoint: number) {
    // https://unicode.org/reports/tr51/#Emoji_Sequences
    // https://en.wikipedia.org/wiki/Tags_(Unicode_block)
    return 0x1F1E6 <= codePoint && codePoint <= 0x1F1FF
  }

}

/**
 * 前置标点，不可出现在行尾
 */
const PUNCTUATION_START = '([{·‘“〈《「『【〔〖（．［｛￡￥'

/**
* 后置标点，不可出现在行首
*/
const PUNCTUATION_END = '!),.:;?]}¨·ˇˉ―‖’”…∶、。〃々〉》」』】〕〗！＂＇），．：；？］｀｜｝～￠'

/**
 * 换行空格
 */
const BREAKING_SPACES = [
  0x0009, // character tabulation
  0x0020, // space
  0x2000, // en quad
  0x2001, // em quad
  0x2002, // en space
  0x2003, // em space
  0x2004, // three-per-em space
  0x2005, // four-per-em space
  0x2006, // six-per-em space
  0x2008, // punctuation space
  0x2009, // thin space
  0x200A, // hair space
  0x205F, // medium mathematical space
  0x3000, // ideographic space
]

const DIGIT_OR_LETTER = /[a-z0-9]/i
