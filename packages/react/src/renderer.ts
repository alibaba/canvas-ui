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
import {
  unstable_now as now,
  unstable_scheduleCallback as scheduleDeferredCallback,
  unstable_cancelCallback as cancelDeferredCallback,
} from 'scheduler'
import { Reconciler } from './reconciler'
import {
  AnyProps,
  diffProps,
  setInitialProps,
  setText,
  UpdatePayload,
  updateProps
} from './utils'

const renderer = Reconciler<
  ElementType,
  AnyProps,
  RenderView, // Container
  RenderObject, // Instance
  RenderText, // TextInstance
  unknown, // HydratableInstance
  RenderObject, // PublicInstance
  null, // HostContext
  UpdatePayload[], // UpdatePayload
  unknown, // ChildSet 暂时没有用到
  number, // setTimeout 的返回值
  -1 // noTimeout 的返回值
>({

  supportsMutation: true,

  supportsPersistence: false,

  createInstance(
    type,
    props,
    _rootContainer,
    _hostContext,
    _internalHandle,
  ) {
    const instance = createElement(type)
    setInitialProps(type, instance, props)
    return instance
  },

  createTextInstance(
    _text,
    _rootContainer,
    _hostContext,
    _internalHandle,
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
    _hostContext,
  ) {
    return false
  },

  prepareUpdate: (
    _instance,
    _type,
    oldProps,
    newProps,
    _rootContainer,
    _hostContext
  ) => {
    return diffProps(oldProps, newProps)
  },

  shouldSetTextContent(type, _props) {
    return type === 'Text'
  },

  getRootHostContext(_rootContainer) {
    return null
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

  now,

  setTimeout: setTimeout,

  clearTimeout: clearTimeout,

  noTimeout: -1,

  scheduleDeferredCallback,
  cancelDeferredCallback,

  isPrimaryRenderer: false,

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

  commitUpdate(instance, updatePayload, _type, _prevProps, _nextProps, _internalHandle) {
    updateProps(instance, updatePayload)
  },

  supportsHydration: false,

  shouldDeprioritizeSubtree: () => {
    return false
  }

})

renderer.injectIntoDevTools({
  bundleType: process.env.NODE_ENV === 'production' ? 0 : 1,
  version: process.env.PKG_VERSION ?? '0.0.0', // 必须是 `x.y.z` 格式的 semver，否则不起作用 
  rendererPackageName: '@canvas-ui/react',
  findHostInstanceByFiber: renderer.findHostInstance,
} as any)

const roots = new Map<RenderView, FiberRoot>()

export enum ReactRootTags {
  LegacyRoot = 0,
  BlockingRoot = 1,
  ConcurrentRoot = 2,
}

export function render(
  element: ReactNode,
  container: RenderView,
) {
  let root = roots.get(container)
  if (!root) {
    const newRoot = (root = renderer.createContainer(
      container,
      false,
      false,
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
