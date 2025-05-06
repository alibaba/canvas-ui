import {
  createElement,
  ElementType,
  RenderObject,
  RenderSingleChild,
  RenderText,
  RenderView
} from '@canvas-ui/core'
import { assert } from '@canvas-ui/assert'
import type { ReactNode } from 'react'
import type { FiberRoot } from 'react-reconciler'
import { ConcurrentRoot, ContinuousEventPriority, DefaultEventPriority, DiscreteEventPriority, NoEventPriority } from 'react-reconciler/constants'
import { Reconciler } from './reconciler'
import {
  AnyProps,
  diffProps,
  setInitialProps,
  setText,
  updateProps
} from './utils'

let currentUpdatePriority = 0

const renderer = Reconciler<
  ElementType,
  AnyProps,
  RenderView, // Container
  RenderObject, // Instance
  RenderText, // TextInstance
  RenderObject, // SuspenseInstance
  never, // HydratableInstance
  never, // FormInstance
  RenderObject, // PublicInstance
  Record<string, any>, // HostContext
  unknown, // ChildSet 暂时没有用到
  number, // setTimeout 的返回值
  -1, // noTimeout 的返回值
  null // TransitionStatus
>({
  isPrimaryRenderer: false,
  noTimeout: -1,
  NotPendingTransition: null,
  HostTransitionContext: {
    $$typeof: Symbol.for('react.context'),
    Consumer: null as any,
    Provider: null as any,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  },
  supportsHydration: false,
  supportsMutation: true,
  supportsPersistence: false,
  supportsMicrotasks: true,
  warnsIfNotActing: false,

  afterActiveInstanceBlur: () => { },
  beforeActiveInstanceBlur: () => { },
  clearContainer: () => { },
  hideTextInstance: () => {
    throw new Error('Text instances are not yet supported. Please use a `<Text>` component.')
  },
  unhideTextInstance: () => {
    throw new Error('Text instances are not yet supported. Please use a `<Text>` component.')
  },
  detachDeletedInstance: () => { },

  getInstanceFromNode: () => {
    return null
  },
  getInstanceFromScope: () => {
    throw new Error('Not yet implemented.')
  },
  maySuspendCommit: () => {
    return false
  },
  preloadInstance: () => {
    return true
  },
  preparePortalMount: () => { },
  prepareScopeUpdate: () => { },
  requestPostPaintCallback: () => { },
  resetFormInstance: () => { },
  resolveEventTimeStamp: () => {
    return -1.1
  },
  resolveEventType: () => {
    return null
  },
  getCurrentUpdatePriority: () => {
    return currentUpdatePriority
  },
  resolveUpdatePriority: () => {
    if (currentUpdatePriority !== NoEventPriority) {
      return currentUpdatePriority
    }
    const globalScope = (typeof self !== 'undefined' && self) || (typeof window !== 'undefined' && window)
    if (!globalScope) {
      return DefaultEventPriority
    }
    const eventType = globalScope.event?.type
    switch (eventType) {
      case 'click':
      case 'contextmenu':
      case 'dblclick':
      case 'pointercancel':
      case 'pointerdown':
      case 'pointerup':
        return DiscreteEventPriority
      case 'pointermove':
      case 'pointerout':
      case 'pointerover':
      case 'pointerenter':
      case 'pointerleave':
      case 'wheel':
        return ContinuousEventPriority
      default:
        return DefaultEventPriority
    }
  },
  setCurrentUpdatePriority: (newPriority: number) => {
    currentUpdatePriority = newPriority
  },
  shouldAttemptEagerTransition: () => {
    return false
  },
  startSuspendingCommit: () => { },
  suspendInstance: () => { },
  trackSchedulerEvent: () => { },
  waitForCommitToBeReady: () => {
    return null
  },
  createInstance(
    type,
    props,
    _rootContainer,
    _hostContext,
    _internalHandle
  ) {
    const instance = createElement(type)
    setInitialProps(type, instance, props)
    return instance
  },

  createTextInstance(
    _text,
    _rootContainer,
    _hostContext,
    _internalHandle
  ) {
    throw new Error('Not implemented')
  },

  appendInitialChild(parentInstance, child) {
    assert(parentInstance instanceof RenderView || parentInstance instanceof RenderSingleChild)
    removeFromParentIfNeeded(child)
    parentInstance.appendChild(child)
  },

  finalizeInitialChildren(
    _instance,
    _type,
    _props,
    _rootContainer,
    _hostContext
  ) {
    return false
  },

  shouldSetTextContent(type, _props) {
    return type === 'Text'
  },

  getRootHostContext(_rootContainer) {
    return {}
  },

  getChildHostContext(parentHostContext, _type, _rootContainer) {
    return parentHostContext
  },

  getPublicInstance(instance) {
    return instance
  },

  prepareForCommit(_containerInfo) {
    return null
  },

  resetAfterCommit(_containerInfo) { },

  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,

  scheduleMicrotask: queueMicrotask,

  appendChild(parentInstance, child) {
    assert(parentInstance instanceof RenderSingleChild || parentInstance instanceof RenderView)
    removeFromParentIfNeeded(child)
    parentInstance.appendChild(child)
  },

  appendChildToContainer(container, child) {
    assert(container instanceof RenderSingleChild || container instanceof RenderView)
    removeFromParentIfNeeded(child)
    container.appendChild(child)
  },

  insertBefore(parentInstance, child, beforeChild) {
    assert(parentInstance instanceof RenderView)
    removeFromParentIfNeeded(child)
    parentInstance.insertBefore(child, beforeChild)
  },

  insertInContainerBefore(container, child, beforeChild) {
    assert(container instanceof RenderView)
    container.insertBefore(child, beforeChild)
  },

  removeChild(parentInstance, child) {
    assert(parentInstance instanceof RenderSingleChild || parentInstance instanceof RenderView)
    parentInstance.removeChild(child)
  },

  removeChildFromContainer(container, child) {
    assert(container instanceof RenderView)
    container.removeChild(child)
  },

  resetTextContent(instance) {
    setText(instance, '')
  },

  commitTextUpdate(_textInstance, _newText, _oldText) {
    throw new Error('Not implemented')
  },

  commitMount(_instance, _type, _newProps, _internalHandle) {
    // 由于我们 finalizeInitialChildren 从不返回 true
    // 所以该方法也永远不会被调用，故留空
  },

  commitUpdate(instance, _type, prevProps, nextProps, _internalHandle) {
    const updatePayload = diffProps(prevProps, nextProps)
    if (updatePayload) {
      updateProps(instance, updatePayload)
    }
  },
})

renderer.injectIntoDevTools({
  bundleType: process.env.NODE_ENV === 'production' ? 0 : 1,
  version: process.env.PKG_VERSION ?? '0.0.0', // 必须是 `x.y.z` 格式的 semver，否则不起作用 
  rendererPackageName: '@canvas-ui/react',
  findHostInstanceByFiber: renderer.findHostInstance,
} as any)

const roots = new Map<RenderView, FiberRoot>()

export function render(
  element: ReactNode,
  container: RenderView,
) {
  let root = roots.get(container)
  if (!root) {
    const newRoot = (root = renderer.createContainer(
      container,
      ConcurrentRoot,
      null, // hydration callbacks
      false, // isStrictMode
      null, // concurrentUpdatesByDefaultOverride
      '', // identifierPrefix
      console.error, // onRecoverableError
      null, // transitionCallbacks
    ))
    roots.set(container, newRoot)
  }
  renderer.updateContainer(element, root, null, () => undefined)
  return renderer.getPublicRootInstance(root)
}

export function unmountComponentAtNode(container: RenderView, callback?: (c: RenderView) => void) {
  const root = roots.get(container)
  if (root) {
    renderer.updateContainer(null, root, null, () => {
      roots.delete(container)
      callback?.(container)
    })
    return true
  }
  return false
}

// export function createPortal(
//   children: ReactNode,
//   containerInfo?: RenderView,
//   implementation?: any,
//   key?: string,
// ) {
//   return renderer.createPortal(children, containerInfo, implementation, key)
// }

const hasSymbol = typeof Symbol === 'function' && Symbol.for
const REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca
export function createPortal(
  children: ReactNode,
  containerInfo?: RenderView,
  implementation?: any,
  key?: string,
) {
  return {
    $$typeof: REACT_PORTAL_TYPE,
    key,
    children,
    containerInfo,
    implementation,
  }
}

function removeFromParentIfNeeded(child: RenderObject) {
  const { parent } = child
  if (parent instanceof RenderView || parent instanceof RenderSingleChild) {
    parent.removeChild(child)
  }
}
