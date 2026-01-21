import { RenderRoot, RenderPipeline, RenderSingleChild } from '..'
import { Rect } from '../../math'
import { TestRenderObject } from './test-render-object'

/**
 * 构造结构如下
 *
 * a (root) - pipeline
 *  \
 *   b
 *    \
 *     c (leaf)
 *
 */
const makeTree = (owner?: RenderPipeline) => {
  const a = new RenderSingleChild()
  a._relayoutBoundary = a
  const b = new RenderSingleChild()
  a.child = b
  const c = new TestRenderObject()
  b.child = c

  if (owner) {
    expect(owner.rootNode).toBeUndefined()
    owner.rootNode = a
  }

  return {
    a,
    b,
    c,
  }
}

describe('RenderSingleChild', () => {
  test('设置和清除 child', () => {
    const { a, b, c } = makeTree()

    // 父子关系
    expect(a.parent).toBe(undefined)
    expect(b.parent).toBe(a)
    expect(c.parent).toBe(b)

    expect(a._layoutDirty).toBe(true)
    expect(b._layoutDirty).toBe(true)
    expect(c._layoutDirty).toBe(true)

    expect(a._paintDirty).toBe(true)
    expect(b._paintDirty).toBe(true)
    expect(c._paintDirty).toBe(true)

    expect(a._relayoutBoundary).toBe(a)
    expect(b._relayoutBoundary).toBe(undefined)
    expect(c._relayoutBoundary).toBe(undefined)
  })

  test('layout 和 pipeline', () => {
    const { a, b, c } = makeTree()

    // 检查父子关系
    expect(a.parent).toBe(undefined)
    expect(b.parent).toBe(a)
    expect(c.parent).toBe(b)

    // pipeline attach
    const handleVisualUpdate = jest.fn(() => {
      self.requestAnimationFrame(() => {
        pipeline.flushLayout()
      })
    })
    const pipeline = new RenderPipeline(handleVisualUpdate)
    pipeline.rootNode = a
    expect(handleVisualUpdate).toHaveBeenCalledTimes(1)
    jest.runOnlyPendingTimers()

    // _relayoutBoundary 都应该是自己
    expect(a._relayoutBoundary).toBe(a)
    expect(b._relayoutBoundary).toBe(b)
    expect(c._relayoutBoundary).toBe(c)

    expect(a._layoutDirty).toBe(false)
    expect(b._layoutDirty).toBe(false)
    expect(c._layoutDirty).toBe(false)

    // pipeline detach
    pipeline.rootNode = undefined
    expect(a._relayoutBoundary).toBe(a)
    expect(b._relayoutBoundary).toBe(b)
    expect(c._relayoutBoundary).toBe(c)
    expect(a._layoutDirty).toBe(false)
    expect(b._layoutDirty).toBe(false)
    expect(c._layoutDirty).toBe(false)
  })

  test('root: a.markLayoutDirty', () => {
    const handleVisualUpdate = jest.fn(() => {
      self.requestAnimationFrame(() => {
        pipeline.flushLayout()
      })
    })
    const pipeline = new RenderPipeline(handleVisualUpdate)
    const { a, b, c } = makeTree(pipeline)

    // 令首次布局稳定
    jest.runOnlyPendingTimers()

    const a_layoutAsChild = jest.spyOn(a, 'layoutAsChild')
    const b_layoutAsChild = jest.spyOn(b, 'layoutAsChild')
    const c_layoutAsChild = jest.spyOn(c, 'layoutAsChild')

    a.markLayoutDirty()
    expect(a._layoutDirty).toBe(true)
    expect(b._layoutDirty).toBe(false)
    expect(c._layoutDirty).toBe(false)
    jest.runOnlyPendingTimers()
    expect(a._layoutDirty).toBe(false)
    expect(b._layoutDirty).toBe(false)
    expect(c._layoutDirty).toBe(false)
    expect(a_layoutAsChild).toBeCalledTimes(0)
    expect(b_layoutAsChild).toBeCalledTimes(1)
    expect(c_layoutAsChild).toBeCalledTimes(0)
    expect(a._relayoutBoundary).toBe(a)
    expect(b._relayoutBoundary).toBe(b)
    expect(c._relayoutBoundary).toBe(c)

  })

  test('branch: b.markLayoutDirty', () => {
    const handleVisualUpdate = jest.fn(() => {
      self.requestAnimationFrame(() => {
        pipeline.flushLayout()
      })
    })
    const pipeline = new RenderPipeline(handleVisualUpdate)
    const { a, b, c } = makeTree(pipeline)

    // 令首次布局稳定
    jest.runOnlyPendingTimers()

    const a_layoutAsChild = jest.spyOn(a, 'layoutAsChild')
    const b_layoutAsChild = jest.spyOn(b, 'layoutAsChild')
    const c_layoutAsChild = jest.spyOn(c, 'layoutAsChild')

    b.markLayoutDirty()
    expect(a._layoutDirty).toBe(false)
    expect(b._layoutDirty).toBe(true)
    expect(c._layoutDirty).toBe(false)
    jest.runOnlyPendingTimers()
    expect(a._layoutDirty).toBe(false)
    expect(b._layoutDirty).toBe(false)
    expect(c._layoutDirty).toBe(false)
    expect(a_layoutAsChild).toBeCalledTimes(0)
    expect(b_layoutAsChild).toBeCalledTimes(0)
    expect(c_layoutAsChild).toBeCalledTimes(1)
    expect(a._relayoutBoundary).toBe(a)
    expect(b._relayoutBoundary).toBe(b)
    expect(c._relayoutBoundary).toBe(c)

  })

  test('leaf: c.markLayoutDirty', () => {
    const handleVisualUpdate = jest.fn(() => {
      self.requestAnimationFrame(() => {
        pipeline.flushLayout()
      })
    })
    const pipeline = new RenderPipeline(handleVisualUpdate)
    const { a, b, c } = makeTree(pipeline)

    // 令首次布局稳定
    jest.runOnlyPendingTimers()

    const a_layoutAsChild = jest.spyOn(a, 'layoutAsChild')
    const b_layoutAsChild = jest.spyOn(b, 'layoutAsChild')
    const c_layoutAsChild = jest.spyOn(c, 'layoutAsChild')

    c.markLayoutDirty()
    expect(a._layoutDirty).toBe(false)
    expect(b._layoutDirty).toBe(false)
    expect(c._layoutDirty).toBe(true)
    jest.runOnlyPendingTimers()
    expect(a._layoutDirty).toBe(false)
    expect(b._layoutDirty).toBe(false)
    expect(c._layoutDirty).toBe(false)
    expect(a_layoutAsChild).toBeCalledTimes(0)
    expect(b_layoutAsChild).toBeCalledTimes(0)
    expect(c_layoutAsChild).toBeCalledTimes(0)
    expect(a._relayoutBoundary).toBe(a)
    expect(b._relayoutBoundary).toBe(b)
    expect(c._relayoutBoundary).toBe(c)

  })

  test('能够消费 viewport', () => {
    const root = new RenderRoot()
    root.prepareInitialFrame()
    const a = new RenderSingleChild()
    root.child = a
    const b = new TestRenderObject()
    a.child = b

    // 令首次布局稳定
    jest.runAllTimers()

    // 修改 a 的 viewport
    a.viewport = Rect.fromLTWH(10, 10, 10, 10)

    jest.spyOn(b, 'paint').mockImplementation((_, offset) => {
      expect(offset).toEqual({
        x: -a.viewport.left,
        y: -a.viewport.top,
      })
    })

    // 导致 a.parent 被标记
    expect(root._paintDirty).toBe(true)

    // 调度下一帧
    jest.runAllTimers()


    root.dispose()
  })

  test('RenderContainer APIs', () => {
    const a = new RenderSingleChild()
    a._relayoutBoundary = a
    const b = new RenderSingleChild()
    a.appendChild(b)
    const c = new TestRenderObject()
    b.appendChild(c)

    // 父子关系
    expect(a.parent).toBe(undefined)
    expect(b.parent).toBe(a)
    expect(c.parent).toBe(b)

    b.removeChild(c)
    expect(c.parent).toBe(undefined)
  })
})
