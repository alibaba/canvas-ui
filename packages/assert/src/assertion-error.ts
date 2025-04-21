export type AssertionErrorOptions = {
  message?: string
  actual: unknown
}

export class AssertionError extends Error {
  constructor({
    message,
    actual,
  }: AssertionErrorOptions) {
    super(message ?? `Expected values to be truthy: actual=${actual}`)
  }
}
