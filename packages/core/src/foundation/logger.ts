import { resolveClassName } from './reflect'

export interface Logger {
  log(...args: any[]): void
  info(...args: any[]): void
  error(...args: any[]): void
  warn(...args: any[]): void
  group(...label: any[]): void
  groupEnd(): void
}

export type LoggerCtor = { new(): Logger }

class ConsoleLogger implements Logger {
  log(...args: any[]) {
    console.log(...args)
  }

  info(...args: any[]) {
    console.info(...args)
  }

  error(...args: any[]) {
    console.error(...args)
  }

  warn(...args: any[]) {
    console.warn(...args)
  }

  group(...label: any[]) {
    console.group(...label)
  }

  groupEnd() {
    console.groupEnd()
  }
}

class NullLogger implements Logger {
  info() { }
  log() { }
  error() { }
  warn() { }
  group() { }
  groupEnd() { }
}

export class LoggerFactory {

  private static instances: Record<string, Logger> = {}

  private static get defaultLogger() {
    return !Log.disableAll && testEnv('development') ? ConsoleLogger : NullLogger
  }

  static getLogger(ctor: { new(): Logger } = LoggerFactory.defaultLogger): Logger {
    return LoggerFactory.instances[ctor.name] ??= new ctor()
  }
}

type LogOptions = {
  message?: string

  /**
   * 指示在哪些环境下有效，默认 development
   */
  env?: string | string[]

  /**
   * 当前 Log 是否已经禁用
   */
  disabled?: boolean
}

/**
 * 全局关闭接下来的所有 Log 输出
 */
Log.disableAll = false

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace Log {
  function info(...args: any[]): void
}

Object.defineProperties(Log, {
  info: {
    get() {
      return LoggerFactory.getLogger().info
    }
  }
})

export function Log({
  message,
  env = 'development',
  disabled,
}: LogOptions = {}) {
  return function (_target: any, propertyKey: PropertyKey, descriptor: PropertyDescriptor) {

    if (!testEnv(env) || disabled) {
      return
    }

    const { value: fn } = descriptor
    descriptor.value = function (...args: any[]) {
      const label = message ?? `${resolveClassName(this)}.${propertyKey.toString()}`
      const logger = LoggerFactory.getLogger()
      let res: any // later
      let cost: number // later
      let err: any
      logger.group(label, args)
      const start = performance.now()

      try {
        res = fn.apply(this, args)
        cost = performance.now() - start
      } catch (error) {
        cost = performance.now() - start
        err = error
      }

      logger.log(`${res} in ${cost.toFixed(3)}ms`)
      logger.groupEnd()
      if (err) {
        throw err
      }
      return res
    }
  }
}

function testEnv(env?: string | string[]) {
  if (!env || !process.env.NODE_ENV) {
    return false
  }
  if (typeof env === 'string') {
    return process.env.NODE_ENV === env
  }
  return env.indexOf(process.env.NODE_ENV) !== -1
}
