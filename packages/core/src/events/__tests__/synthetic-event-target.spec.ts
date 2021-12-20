import { SyntheticEvent, SyntheticEventDispatcher } from '..'

describe('SyntheticEventTarget', () => {
  test('event.stopImmediatePropagation', () => {
    const et = new SyntheticEventDispatcher()
    const handleTest1 = jest.fn((event: SyntheticEvent<any, any>) => {
      event.stopImmediatePropagation()
    })
    const handleTest2 = jest.fn()
    et.addEventListener('test', handleTest1)
    et.addEventListener('test', handleTest2)
  })
})
