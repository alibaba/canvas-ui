import { AssertionError } from './assertion-error'

interface Assert {
  (value: unknown, message?: string): asserts value
}

const noop: Assert = () => { }

const assertTruthy: Assert = (value: unknown, message?: string) => {
  if (typeof value === 'function') {
    value()
    return
  }
  if (!value) {
    throw new AssertionError({
      actual: value,
      message,
    })
  }
}

function makeAssertFunction(
  noAssert = process.env.NODE_ENV === 'production'
): Assert {
  return noAssert ? noop : assertTruthy
}

export const assert: Assert = makeAssertFunction()
