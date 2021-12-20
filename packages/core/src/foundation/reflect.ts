export const resolveClassName = (target: any) => {
  return typeof target === 'function'
    ? target.name
    : target.constructor.name
}
