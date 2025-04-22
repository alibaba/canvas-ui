import { FontMetrics } from '..'

//
// 字体渲染的结果严格取决于平台，所以字体的度量和换行行为的测试结果不能跨平台
//
describe('FontMetrics', () => {
  describe('measure', () => {
    test('支持多个 font-family', () => {
      const cssFontProp = '12px Arial, Verdana, serif'
      expect(FontMetrics.measure('12px Arial, Verdana, serif')).toEqual({
        ascent: 11,
        descent: 3,
        fontSize: 14,
        cssFontProp,
      })
    })
  })

  test('measureWidth', () => {
    const cssFontProp = '12px Arial, Verdana, serif'
    const cache = {}
    expect(Math.round(FontMetrics.measureWidth('Test', cssFontProp, cache))).toBe(22)
  })

})
