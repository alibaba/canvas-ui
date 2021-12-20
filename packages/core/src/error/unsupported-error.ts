export class UnsupportedError extends Error {
  constructor(message = 'Unsupported') {
    super(message)
  }
}
