/**
 * 令所有属性都是可变的
 */
export type Mut<T> = {
  -readonly [P in keyof T]: T[P] extends Record<string, unknown> ? Mut<T[P]> : T[P]
}

/**
 * 可选类型
 */
export type Optional<T> = T | undefined
