export function hasOwn<T, K extends keyof T>(o: T, key: K): o is T & Record<K, NonNullable<T[K]>> {
  return Object.prototype.hasOwnProperty.call(o, key)
}
