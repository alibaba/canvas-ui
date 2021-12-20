export function hasOwn<T, K extends keyof T>(o: T, key: K): o is T & Required<Pick<T, K>> {
  return Object.prototype.hasOwnProperty.call(o, key)
}
