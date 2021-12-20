import { FontProps } from '..'

// Unit tests forked from https://github.com/bramstein/css-font-FontProps.fromr/blob/master/test/FontProps.fromr-test.js

describe('FontProps', function () {
  test('returns null on invalid css font values', function () {
    expect(FontProps.from.bind(null, (''))).toThrowError()
    expect(FontProps.from.bind(null, 'Arial')).toThrowError()
    expect(FontProps.from.bind(null, '12px')).toThrowError()
    expect(FontProps.from.bind(null, '12px/16px')).toThrowError()
    expect(FontProps.from.bind(null, 'bold 12px/16px')).toThrowError()
  })

  test('ignores non-terminated strings', function () {
    expect(FontProps.from.bind(null, '12px "Comic')).toThrowError()
    expect(FontProps.from.bind(null, '12px "Comic, serif')).toThrowError()
    expect(FontProps.from.bind(null, '12px \'Comic')).toThrowError()
    expect(FontProps.from.bind(null, '12px \'Comic, serif')).toThrowError()
  })

  test('FontProps.froms a simple font specification correctly', function () {
    expect(FontProps.from('12px serif')).toEqual({ 'font-size': '12px', 'font-family': ['serif'] })
  })

  test('returns multiple font families', function () {
    expect(FontProps.from('12px Arial, Verdana, serif')).toEqual({ 'font-size': '12px', 'font-family': ['Arial', 'Verdana', 'serif'] })
  })

  test('handles quoted family names correctly', function () {
    expect(FontProps.from('12px "Times New Roman"')).toEqual({ 'font-size': '12px', 'font-family': ['"Times New Roman"'] })
    expect(FontProps.from('12px \'Times New Roman\'')).toEqual({ 'font-size': '12px', 'font-family': ['\'Times New Roman\''] })

    expect(FontProps.from('12px "Times\\\' New Roman"')).toEqual({ 'font-size': '12px', 'font-family': ['"Times\\\' New Roman"'] })
    expect(FontProps.from('12px \'Times\\" New Roman\'')).toEqual({ 'font-size': '12px', 'font-family': ['\'Times\\" New Roman\''] })

    expect(FontProps.from('12px "Times\\" New Roman"')).toEqual({ 'font-size': '12px', 'font-family': ['"Times\\" New Roman"'] })
    expect(FontProps.from('12px \'Times\\\' New Roman\'')).toEqual({ 'font-size': '12px', 'font-family': ['\'Times\\\' New Roman\''] })
  })

  test('handles unquoted identifiers correctly', function () {
    expect(FontProps.from('12px Times New Roman')).toEqual({ 'font-size': '12px', 'font-family': ['Times New Roman'] })
    expect(FontProps.from('12px Times New Roman, Comic Sans MS')).toEqual({ 'font-size': '12px', 'font-family': ['Times New Roman', 'Comic Sans MS'] })
  })

  // Examples taken from: http://mathiasbynens.be/notes/unquoted-font-family
  test('correctly returns null on invalid identifiers', function () {
    expect(FontProps.from.bind(null, '12px Red/Black')).toThrowError()
    expect(FontProps.from.bind(null, '12px \'Lucida\' Grande')).toThrowError()
    expect(FontProps.from.bind(null, '12px Ahem!')).toThrowError()
    expect(FontProps.from.bind(null, '12px Hawaii 5-0')).toThrowError()
    expect(FontProps.from.bind(null, '12px $42')).toThrowError()
  })

  test('correctly FontProps.froms escaped characters in identifiers', function () {
    expect(FontProps.from('12px Red\\/Black')).toEqual({ 'font-size': '12px', 'font-family': ['Red\\/Black'] })
    expect(FontProps.from('12px Lucida    Grande')).toEqual({ 'font-size': '12px', 'font-family': ['Lucida Grande'] })
    expect(FontProps.from('12px Ahem\\!')).toEqual({ 'font-size': '12px', 'font-family': ['Ahem\\!'] })
    expect(FontProps.from('12px \\$42')).toEqual({ 'font-size': '12px', 'font-family': ['\\$42'] })
    expect(FontProps.from('12px €42')).toEqual({ 'font-size': '12px', 'font-family': ['€42'] })
  })

  test('correctly FontProps.froms font-size', function () {
    expect(FontProps.from('12px serif')).toEqual({ 'font-size': '12px', 'font-family': ['serif'] })
    expect(FontProps.from('xx-small serif')).toEqual({ 'font-size': 'xx-small', 'font-family': ['serif'] })
    expect(FontProps.from('s-small serif')).toEqual({ 'font-size': 's-small', 'font-family': ['serif'] })
    expect(FontProps.from('small serif')).toEqual({ 'font-size': 'small', 'font-family': ['serif'] })
    expect(FontProps.from('medium serif')).toEqual({ 'font-size': 'medium', 'font-family': ['serif'] })
    expect(FontProps.from('large serif')).toEqual({ 'font-size': 'large', 'font-family': ['serif'] })
    expect(FontProps.from('x-large serif')).toEqual({ 'font-size': 'x-large', 'font-family': ['serif'] })
    expect(FontProps.from('xx-large serif')).toEqual({ 'font-size': 'xx-large', 'font-family': ['serif'] })

    expect(FontProps.from('larger serif')).toEqual({ 'font-size': 'larger', 'font-family': ['serif'] })
    expect(FontProps.from('smaller serif')).toEqual({ 'font-size': 'smaller', 'font-family': ['serif'] })
  })

  test('correctly FontProps.froms lengths', function () {
    expect(FontProps.from('1px serif')).toEqual({ 'font-size': '1px', 'font-family': ['serif'] })
    expect(FontProps.from('1em serif')).toEqual({ 'font-size': '1em', 'font-family': ['serif'] })
    expect(FontProps.from('1ex serif')).toEqual({ 'font-size': '1ex', 'font-family': ['serif'] })
    expect(FontProps.from('1ch serif')).toEqual({ 'font-size': '1ch', 'font-family': ['serif'] })
    expect(FontProps.from('1rem serif')).toEqual({ 'font-size': '1rem', 'font-family': ['serif'] })
    expect(FontProps.from('1vh serif')).toEqual({ 'font-size': '1vh', 'font-family': ['serif'] })
    expect(FontProps.from('1vw serif')).toEqual({ 'font-size': '1vw', 'font-family': ['serif'] })
    expect(FontProps.from('1vmin serif')).toEqual({ 'font-size': '1vmin', 'font-family': ['serif'] })
    expect(FontProps.from('1vmax serif')).toEqual({ 'font-size': '1vmax', 'font-family': ['serif'] })
    expect(FontProps.from('1mm serif')).toEqual({ 'font-size': '1mm', 'font-family': ['serif'] })
    expect(FontProps.from('1cm serif')).toEqual({ 'font-size': '1cm', 'font-family': ['serif'] })
    expect(FontProps.from('1in serif')).toEqual({ 'font-size': '1in', 'font-family': ['serif'] })
    expect(FontProps.from('1pt serif')).toEqual({ 'font-size': '1pt', 'font-family': ['serif'] })
    expect(FontProps.from('1pc serif')).toEqual({ 'font-size': '1pc', 'font-family': ['serif'] })
  })

  test('returns null when it fails to FontProps.from a font-size', function () {
    expect(FontProps.from.bind(null, '1 serif')).toThrowError()
    expect(FontProps.from.bind(null, 'xxx-small serif')).toThrowError()
    expect(FontProps.from.bind(null, '1bs serif')).toThrowError()
    expect(FontProps.from.bind(null, '100 % serif')).toThrowError()
  })

  test('correctly FontProps.froms percentages', function () {
    expect(FontProps.from('100% serif')).toEqual({ 'font-size': '100%', 'font-family': ['serif'] })
  })

  test('correctly FontProps.froms numbers', function () {
    expect(FontProps.from('1px serif')).toEqual({ 'font-size': '1px', 'font-family': ['serif'] })
    expect(FontProps.from('1.1px serif')).toEqual({ 'font-size': '1.1px', 'font-family': ['serif'] })
    expect(FontProps.from('-1px serif')).toEqual({ 'font-size': '-1px', 'font-family': ['serif'] })
    expect(FontProps.from('-1.1px serif')).toEqual({ 'font-size': '-1.1px', 'font-family': ['serif'] })
    expect(FontProps.from('+1px serif')).toEqual({ 'font-size': '+1px', 'font-family': ['serif'] })
    expect(FontProps.from('+1.1px serif')).toEqual({ 'font-size': '+1.1px', 'font-family': ['serif'] })
    expect(FontProps.from('.1px serif')).toEqual({ 'font-size': '.1px', 'font-family': ['serif'] })
    expect(FontProps.from('+.1px serif')).toEqual({ 'font-size': '+.1px', 'font-family': ['serif'] })
    expect(FontProps.from('-.1px serif')).toEqual({ 'font-size': '-.1px', 'font-family': ['serif'] })
  })

  test('returns null when it fails to FontProps.from a number', function () {
    expect(FontProps.from.bind(null, '12.px serif')).toThrowError()
    expect(FontProps.from.bind(null, '+---12.2px serif')).toThrowError()
    expect(FontProps.from.bind(null, '12.1.1px serif')).toThrowError()
    expect(FontProps.from.bind(null, '10e3px serif')).toThrowError()
  })

  test('correctly FontProps.froms line-height', function () {
    expect(FontProps.from('12px/16px serif')).toEqual({ 'font-size': '12px', 'line-height': '16px', 'font-family': ['serif'] })
    expect(FontProps.from('12px/1.5 serif')).toEqual({ 'font-size': '12px', 'line-height': '1.5', 'font-family': ['serif'] })
    expect(FontProps.from('12px/normal serif')).toEqual({ 'font-size': '12px', 'font-family': ['serif'] })
    expect(FontProps.from('12px/105% serif')).toEqual({ 'font-size': '12px', 'line-height': '105%', 'font-family': ['serif'] })
  })

  test('correctly FontProps.froms font-style', function () {
    expect(FontProps.from('italic 12px serif')).toEqual({ 'font-size': '12px', 'font-style': 'italic', 'font-family': ['serif'] })
    expect(FontProps.from('oblique 12px serif')).toEqual({ 'font-size': '12px', 'font-style': 'oblique', 'font-family': ['serif'] })
    expect(FontProps.from('oblique 20deg 12px serif')).toEqual({ 'font-size': '12px', 'font-style': 'oblique 20deg', 'font-family': ['serif'] })
    expect(FontProps.from('oblique 0.02turn 12px serif')).toEqual({ 'font-size': '12px', 'font-style': 'oblique 0.02turn', 'font-family': ['serif'] })
    expect(FontProps.from('oblique .04rad 12px serif')).toEqual({ 'font-size': '12px', 'font-style': 'oblique .04rad', 'font-family': ['serif'] })
  })

  test('correctly FontProps.froms font-variant', function () {
    expect(FontProps.from('small-caps 12px serif')).toEqual({ 'font-size': '12px', 'font-variant': 'small-caps', 'font-family': ['serif'] })
  })

  test('correctly FontProps.froms font-weight', function () {
    expect(FontProps.from('bold 12px serif')).toEqual({ 'font-size': '12px', 'font-weight': 'bold', 'font-family': ['serif'] })
    expect(FontProps.from('bolder 12px serif')).toEqual({ 'font-size': '12px', 'font-weight': 'bolder', 'font-family': ['serif'] })
    expect(FontProps.from('lighter 12px serif')).toEqual({ 'font-size': '12px', 'font-weight': 'lighter', 'font-family': ['serif'] })

    for (let i = 1; i <= 10; i += 1) {
      expect(FontProps.from(i * 100 + ' 12px serif')).toEqual({ 'font-size': '12px', 'font-weight': String(i * 100), 'font-family': ['serif'] })
    }

    expect(FontProps.from('1 12px serif')).toEqual({ 'font-size': '12px', 'font-weight': '1', 'font-family': ['serif'] })
    expect(FontProps.from('723 12px serif')).toEqual({ 'font-size': '12px', 'font-weight': '723', 'font-family': ['serif'] })
    expect(FontProps.from('1000 12px serif')).toEqual({ 'font-size': '12px', 'font-weight': '1000', 'font-family': ['serif'] })
    expect(FontProps.from('1000.00 12px serif')).toEqual({ 'font-size': '12px', 'font-weight': '1000.00', 'font-family': ['serif'] })
    expect(FontProps.from('1e3 12px serif')).toEqual({ 'font-size': '12px', 'font-weight': '1e3', 'font-family': ['serif'] })
    expect(FontProps.from('1e+1 12px serif')).toEqual({ 'font-size': '12px', 'font-weight': '1e+1', 'font-family': ['serif'] })
    expect(FontProps.from('200e-2 12px serif')).toEqual({ 'font-size': '12px', 'font-weight': '200e-2', 'font-family': ['serif'] })
    expect(FontProps.from('123.456 12px serif')).toEqual({ 'font-size': '12px', 'font-weight': '123.456', 'font-family': ['serif'] })
    expect(FontProps.from('+123 12px serif')).toEqual({ 'font-size': '12px', 'font-weight': '+123', 'font-family': ['serif'] })

    expect(FontProps.from('0 12px serif')).toEqual({ 'font-size': '12px', 'font-family': ['serif'] })
    expect(FontProps.from('-1 12px serif')).toEqual({ 'font-size': '12px', 'font-family': ['serif'] })
    expect(FontProps.from('1000. 12px serif')).toEqual({ 'font-size': '12px', 'font-family': ['serif'] })
    expect(FontProps.from('1000.1 12px serif')).toEqual({ 'font-size': '12px', 'font-family': ['serif'] })
    expect(FontProps.from('1001 12px serif')).toEqual({ 'font-size': '12px', 'font-family': ['serif'] })
    expect(FontProps.from('1.1e3 12px serif')).toEqual({ 'font-size': '12px', 'font-family': ['serif'] })
    expect(FontProps.from('1e-2 12px serif')).toEqual({ 'font-size': '12px', 'font-family': ['serif'] })
  })

  test('correctly FontProps.froms font-stretch', function () {
    expect(FontProps.from('ultra-condensed 12px serif')).toEqual({ 'font-size': '12px', 'font-stretch': 'ultra-condensed', 'font-family': ['serif'] })
    expect(FontProps.from('extra-condensed 12px serif')).toEqual({ 'font-size': '12px', 'font-stretch': 'extra-condensed', 'font-family': ['serif'] })
    expect(FontProps.from('condensed 12px serif')).toEqual({ 'font-size': '12px', 'font-stretch': 'condensed', 'font-family': ['serif'] })
    expect(FontProps.from('semi-condensed 12px serif')).toEqual({ 'font-size': '12px', 'font-stretch': 'semi-condensed', 'font-family': ['serif'] })
    expect(FontProps.from('semi-expanded 12px serif')).toEqual({ 'font-size': '12px', 'font-stretch': 'semi-expanded', 'font-family': ['serif'] })
    expect(FontProps.from('expanded 12px serif')).toEqual({ 'font-size': '12px', 'font-stretch': 'expanded', 'font-family': ['serif'] })
    expect(FontProps.from('extra-expanded 12px serif')).toEqual({ 'font-size': '12px', 'font-stretch': 'extra-expanded', 'font-family': ['serif'] })
    expect(FontProps.from('ultra-expanded 12px serif')).toEqual({ 'font-size': '12px', 'font-stretch': 'ultra-expanded', 'font-family': ['serif'] })
  })

  describe('getLengthValue', () => {
    test('可以测量 FontMetrics', () => {
      expect(FontProps.getLengthValue('1px', 'px')).toEqual(1)
    })

    test('不支持除了 px 的其他单位', () => {
      for (const unit of 'pt|pc|in|cm|mm|%|em|ex|ch|rem|q'.split('|')) {
        expect(FontProps.getLengthValue.bind(null, `1${unit}`, 'px')).toThrowError(new TypeError(`Support 'px' only, got '${unit}'`))
      }
    })
  })
})
