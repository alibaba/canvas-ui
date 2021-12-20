import { BoxShadow } from '..'

describe('Shadow', () => {
  test('from', () => {
    const shadow1 = BoxShadow.fromCss('rgba(0,0,255,0.5) 10px 20px 5px')

    expect(shadow1.color).toEqual('rgba(0,0,255,0.5)')
    expect(shadow1.offsetX).toEqual(10)
    expect(shadow1.offsetY).toEqual(20)
    expect(shadow1.blur).toEqual(5)

    const shadow2 = BoxShadow.fromCss('rgb(0,0,255) 10px 20px ')

    expect(shadow2.color).toEqual('rgb(0,0,255)')
    expect(shadow2.offsetX).toEqual(10)
    expect(shadow2.offsetY).toEqual(20)
    expect(shadow2.blur).toEqual(0)

    const shadow3 = BoxShadow.fromCss('#00FF00 30 10 ')

    expect(shadow3.color).toEqual('#00FF00')
    expect(shadow3.offsetX).toEqual(30)
    expect(shadow3.offsetY).toEqual(10)
    expect(shadow3.blur).toEqual(0)

    const shadow4 = BoxShadow.fromCss(' #FF0000 10px')

    expect(shadow4.color).toEqual('#FF0000')
    expect(shadow4.offsetX).toEqual(10)
    expect(shadow4.offsetY).toEqual(0)
    expect(shadow4.blur).toEqual(0)

    const shadow5 = BoxShadow.fromCss('#000000')

    expect(shadow5.color).toEqual('#000000')
    expect(shadow5.offsetX).toEqual(0)
    expect(shadow5.offsetY).toEqual(0)
    expect(shadow5.blur).toEqual(0)


    // new text-shadow definition - offsetX offsetY blur color
    const shadow6 = BoxShadow.fromCss('10px 20px 5px rgba(0,0,255,0.5)')

    expect(shadow6.color).toEqual('rgba(0,0,255,0.5)')
    expect(shadow6.offsetX).toEqual(10)
    expect(shadow6.offsetY).toEqual(20)
    expect(shadow6.blur).toEqual(5)

    const shadow7 = BoxShadow.fromCss('10 20 5px #00FF00')

    expect(shadow7.color).toEqual('#00FF00')
    expect(shadow7.offsetX).toEqual(10)
    expect(shadow7.offsetY).toEqual(20)
    expect(shadow7.blur).toEqual(5)

    const shadow8 = BoxShadow.fromCss('10px 20px rgb(0,0,255)')

    expect(shadow8.color).toEqual('rgb(0,0,255)')
    expect(shadow8.offsetX).toEqual(10)
    expect(shadow8.offsetY).toEqual(20)
    expect(shadow8.blur).toEqual(0)

    const shadow9 = BoxShadow.fromCss(' 10px #FF0000 ')

    expect(shadow9.color).toEqual('#FF0000')
    expect(shadow9.offsetX).toEqual(10)
    expect(shadow9.offsetY).toEqual(0)
    expect(shadow9.blur).toEqual(0)

    const shadow10 = BoxShadow.fromCss('  #FF0000 ')

    expect(shadow10.color).toEqual('#FF0000')
    expect(shadow10.offsetX).toEqual(0)
    expect(shadow10.offsetY).toEqual(0)
    expect(shadow10.blur).toEqual(0)

    const shadow11 = BoxShadow.fromCss('')

    expect(shadow11.color).toEqual('rgb(0,0,0)')
    expect(shadow11.offsetX).toEqual(0)
    expect(shadow11.offsetY).toEqual(0)
    expect(shadow11.blur).toEqual(0)

    const shadow12 = BoxShadow.fromCss('#FF0000 0.1px 0.1px 0.28px')

    expect(shadow12.color).toEqual('#FF0000')
    expect(shadow12.offsetX).toEqual(0.1)
    expect(shadow12.offsetY).toEqual(0.1)
    expect(shadow12.blur).toEqual(0.28)

    const shadow13 = BoxShadow.fromCss('rgba(0,0,255,0.5) -0.1px -0.1px 0.28px')

    expect(shadow13.color).toEqual('rgba(0,0,255,0.5)')
    expect(shadow13.offsetX).toEqual(-0.1)
    expect(shadow13.offsetY).toEqual(-0.1)
    expect(shadow13.blur).toEqual(0.28)

    const shadow14 = BoxShadow.fromCss('rgba(0,0,255,0.5) -0.1 -0.1 0.77')

    expect(shadow14.color).toEqual('rgba(0,0,255,0.5)')
    expect(shadow14.offsetX).toEqual(-0.1)
    expect(shadow14.offsetY).toEqual(-0.1)
    expect(shadow14.blur).toEqual(0.77)

    const shadow15 = BoxShadow.fromCss('rgba(0,0,255,0.5) 0.1 0.1 1')

    expect(shadow15.color).toEqual('rgba(0,0,255,0.5)')
    expect(shadow15.offsetX).toEqual(0.1)
    expect(shadow15.offsetY).toEqual(0.1)
    expect(shadow15.blur).toEqual(1)
  })
})
