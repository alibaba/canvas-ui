import { DOMEventBinding, NativePointerEvents } from '..'

describe('DOMEventBinding', () => {
  test('flushPointerEvents', () => {
    const el = document.createElement('div')
    const binding = new DOMEventBinding()
    binding.el = el

    const pointerId = 0
    const eventInit = {
      pointerId,
      bubbles: true,
    }
    const testEvents = [
      [el, new PointerEvent('pointermove', eventInit)],
      [el, new PointerEvent('pointerenter', eventInit)],
      [el, new PointerEvent('pointerdown', eventInit)],
      [window, new PointerEvent('pointerup', eventInit), 'pointerupoutside'],
      [el, new PointerEvent('pointerleave', eventInit)],
    ] as const

    // 单个事件
    for (const [dispatcher, event, type] of testEvents) {
      dispatcher.dispatchEvent(event)
      expect(binding.flushPointerEvents()).toEqual({
        [pointerId]: { [type ?? event.type]: event }
      })
      // 第二次 flush 不会得到任何事件
      expect(binding.flushPointerEvents()).toEqual({})
    }

    // 多个事件
    for (const [dispatcher, event] of testEvents) {
      dispatcher.dispatchEvent(event)
    }
    expect(binding.flushPointerEvents()).toEqual(testEvents.reduce((acc, [, event, type]) => {
      acc[pointerId][type ?? event.type] = event
      return acc
    }, { [pointerId]: {} } as NativePointerEvents))
    expect(binding.flushPointerEvents()).toEqual({})

  })

})
