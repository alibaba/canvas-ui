import { WebPlatformAdapter } from '../web-platform-adapter'

describe('WebPlatformAdapter', () => {
  test('可以移除 onFrame', () => {
    const callback = jest.fn()
    const adapter = new WebPlatformAdapter()
    const remove = adapter.onFrame(callback)
    adapter.scheduleFrame()
    jest.runAllTimers()
    remove()
    adapter.scheduleFrame()
    jest.runAllTimers()
    expect(callback).toBeCalledTimes(1)
  })

  test('调用 scheduleFrame 多次也只会调度一次 onFrame', () => {
    const callback = jest.fn()
    const adapter = new WebPlatformAdapter()
    adapter.onFrame(callback)
    adapter.scheduleFrame()
    adapter.scheduleFrame()
    adapter.scheduleFrame()
    adapter.scheduleFrame()
    adapter.scheduleFrame()
    adapter.scheduleFrame()
    jest.runAllTimers()
    expect(callback).toBeCalledTimes(1)
  })
})
