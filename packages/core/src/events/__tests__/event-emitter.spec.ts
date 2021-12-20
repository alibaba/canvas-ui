import EventEmitter from 'eventemitter3'
import { expectType } from 'ts-expect'

describe('EventEmitter', () => {
  test('具有正确的类型定义', () => {
    type EventTypes = {
      pointerDown: (event: Event) => void
    }
    class A extends EventEmitter<EventTypes> {
    }
    new A().on('pointerDown', event => {
      // $ExpectType Event
      expectType<Event>(event)
    })
  })
})
