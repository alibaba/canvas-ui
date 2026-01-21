import { RenderRoot, RenderPipeline, RenderView } from '..'
import { Rect } from '../../math'
import { TestRenderObject } from './test-render-object'

/**
 * 构造结构如下
 *
 *        a (root) - pipeline
 *       / \
 *      b   c
 *    /  \   \
 *   d    e   f (leaves)
 *
 */
const makeTestTree = (owner?: RenderPipeline) => {

  const a = new RenderView()
  a._relayoutBoundary = a
  const b = new RenderView()
  a.appendChild(b)
  const c = new RenderView()
  a.appendChild(c)
  const d = new TestRenderObject()
  b.appendChild(d)
  const e = new TestRenderObject()
  b.appendChild(e)
  const f = new TestRenderObject()
  c.appendChild(f)

  if (owner) {
    expect(owner.rootNode).toBeUndefined()
    owner.rootNode = a
  }

  return {
    a,
    b,
    c,
    d,
    e,
    f
  }
}

describe('RenderView', () => {
  test('空 RenderView', () => {
    const a = new RenderView()
    expect(a.childCount).toBe(0)
    expect(a.firstChild).toBe(undefined)
    expect(a.lastChild).toBe(undefined)
  })

  test('appendChild', () => {
    const a = new RenderView()
    const b = new RenderView()

    // 从 无到有
    a.appendChild(b)
    expect(b.parent).toBe(a)
    expect(a.firstChild).toBe(b)
    expect(a.lastChild).toBe(b)
    expect(a.childAfter(b)).toBe(undefined)
    expect(a.childBefore(b)).toBe(undefined)
    expect(a.childCount).toBe(1)

    const c = new RenderView()
    a.appendChild(c)
    expect(c.parent).toBe(a)
    expect(a.firstChild).toBe(b)
    expect(a.lastChild).toBe(c)
    expect(a.childAfter(c)).toBe(undefined)
    expect(a.childBefore(c)).toBe(b)
    expect(a.childCount).toBe(2)
  })

  test('insertAfter - head', () => {
    const a = new RenderView()
    const b = new RenderView()
    a.insertAfter(b)
    expect(a.childBefore(b)).toBe(undefined)
    expect(a.childAfter(b)).toBe(undefined)
    expect(a.firstChild).toBe(b)
    expect(a.lastChild).toBe(b)
    expect(a.debugChildren).toEqual([b])
  })

  test('insertAfter - middle', () => {
    const a = new RenderView()
    const b = new RenderView()
    const c = new RenderView()
    a.appendChild(b)
    a.appendChild(c)

    const d = new RenderView()
    a.insertAfter(d, b)
    expect(a.childAfter(b)).toBe(d)
    expect(a.childBefore(d)).toBe(b)
    expect(a.childBefore(c)).toBe(d)
    expect(a.debugChildren).toEqual([b, d, c])
  })

  test('insertAfter - last', () => {
    const a = new RenderView()
    const b = new RenderView()
    a.appendChild(b)

    const c = new RenderView()
    a.insertAfter(c, b)
    expect(a.lastChild).toBe(c)
    expect(a.childBefore(c)).toBe(b)
    expect(a.childAfter(c)).toBe(undefined)
    expect(a.childAfter(b)).toBe(c)
    expect(a.debugChildren).toEqual([b, c])
  })

  test('insertBefore - head', () => {
    const a = new RenderView()
    const b = new RenderView()
    a.insertBefore(b)
    expect(a.childBefore(b)).toBe(undefined)
    expect(a.childAfter(b)).toBe(undefined)
    expect(a.firstChild).toBe(b)
    expect(a.lastChild).toBe(b)
    expect(a.debugChildren).toEqual([b])
  })

  test('insertBefore - middle', () => {
    const a = new RenderView()
    const b = new RenderView()
    const c = new RenderView()
    a.appendChild(b)
    a.appendChild(c)

    const d = new RenderView()
    a.insertBefore(d, b)
    expect(a.childAfter(b)).toBe(c)
    expect(a.childBefore(b)).toBe(d)
    expect(a.childBefore(c)).toBe(b)
    expect(a.debugChildren).toEqual([d, b, c])
  })

  test('insertBefore - last', () => {
    const a = new RenderView()
    const b = new RenderView()
    a.appendChild(b)

    const c = new RenderView()
    a.insertBefore(c, b)
    expect(a.lastChild).toBe(b)
    expect(a.childBefore(b)).toBe(c)
    expect(a.childAfter(c)).toBe(b)
    expect(a.childAfter(b)).toBe(undefined)
    expect(a.debugChildren).toEqual([c, b])
  })

  test('removeChild - 移除唯一子节点', () => {
    const a = new RenderView()
    const b = new RenderView()
    a.appendChild(b)
    a.removeChild(b)
    expect(a.firstChild).toBe(undefined)
    expect(a.lastChild).toBe(undefined)
    expect(a.childCount).toBe(0)
    expect(b.parentData).toBe(undefined)
    expect(a.debugChildren).toEqual([])
  })

  test('removeChild - 可以移除 firstChild', () => {
    const a = new RenderView()
    const b = new RenderView()
    const c = new RenderView()
    a.appendChild(b)
    a.appendChild(c)

    a.removeChild(b)
    expect(a.debugChildren).toEqual([c])
  })

  test('removeAllChildren', () => {
    const { a } = makeTestTree()
    a.removeAllChildren()
    expect(a.firstChild).toBe(undefined)
    expect(a.lastChild).toBe(undefined)
    expect(a.childCount).toBe(0)
    expect(a.debugChildren).toEqual([])
  })

  test('visitChildren', () => {
    const { a, b, c } = makeTestTree()
    const visitor = jest.fn()
    a.visitChildren(visitor)
    expect(visitor).toHaveBeenNthCalledWith(1, b)
    expect(visitor).toHaveBeenNthCalledWith(2, c)
  })

  test('能够消费 viewport', () => {
    const root = new RenderRoot()
    root.prepareInitialFrame()
    const a = new RenderView()
    root.child = a
    const b = new TestRenderObject()
    a.appendChild(b)

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
})
