import ReactReconciler from 'react-reconciler'

type Primitive = boolean | number | undefined | number | string | symbol
function isPrimitive(val: unknown): val is Primitive {
  if (typeof val === 'object') {
    return val === null
  }
  return typeof val !== 'function'
}

function Log(target: any) {

  function decorate<F extends (...args: any[]) => any>(label: string, fn: F): F {
    const decoratedFn = (...args: any[]) => {
      console.group(label, args)
      const val = fn(...args)
      const primitive = isPrimitive(val)
      if (primitive) {
        console.groupCollapsed(`return ${val}`)
      } else {
        console.groupCollapsed('return')
      }
      console.info(val)
      console.groupEnd()
      console.groupEnd()
      return val
    }
    return decoratedFn as unknown as F
  }

  Object.keys(target).forEach(key => {
    const fn = target[key]
    if (typeof fn === 'function') {
      target[key] = decorate(key, fn)
    }
  })
}

export function Reconciler<
  Type,
  Props,
  Container,
  Instance,
  TextInstance,
  HydratableInstance,
  PublicInstance,
  HostContext,
  UpdatePayload,
  ChildSet,
  TimeoutHandle,
  NoTimeout
>
  (config: ReactReconciler.HostConfig<
    Type,
    Props,
    Container,
    Instance,
    TextInstance,
    HydratableInstance,
    PublicInstance,
    HostContext,
    UpdatePayload,
    ChildSet,
    TimeoutHandle,
    NoTimeout
  >) {

  if (process.env.DEBUG_RECONCILER === 'true') {
    Log(config)
  }

  // 补充必要但 @types/react-reconciler 缺少的定义
  (config as any).schedulePassiveEffects = config.scheduleDeferredCallback
    ; (config as any).cancelPassiveEffects = config.cancelDeferredCallback

  return ReactReconciler(config)
}
