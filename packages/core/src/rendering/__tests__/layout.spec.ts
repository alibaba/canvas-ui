import { RenderFlex, RenderScrollView, RenderSingleChild, RenderView } from '..'
import { TestRenderObject } from './test-render-object'

describe('布局', () => {

  test('节点的 yogaNode 的初始值应为 undefined', () => {
    expect(new TestRenderObject().yogaNode).toBeUndefined()
    expect(new RenderSingleChild().yogaNode).toBeUndefined()
    expect(new RenderView().yogaNode).toBeUndefined()
    expect(new RenderScrollView().yogaNode).toBeUndefined()
    expect(new RenderFlex().yogaNode).toBeUndefined()
  })

  test('子节点的 yogaNode 不会被创建', () => {
    // RenderSingleChild
    {
      const child = new TestRenderObject()
      const parent = new RenderSingleChild()
      parent.appendChild(child)
      expect(child.yogaNode).toBeUndefined()
    }

    // RenderView
    {
      const child = new TestRenderObject()
      const parent = new RenderView()
      parent.appendChild(child)
      expect(child.yogaNode).toBeUndefined()
    }
  })

  test('子节点 RenderFlex 其 yogaNode 的自动创建和销毁', () => {
    const child = new RenderFlex()
    const parent1 = new RenderView()
    const parent2 = new RenderSingleChild()

    parent1.appendChild(child)
    expect(child.yogaNode).toBeDefined()
    parent1.removeChild(child)
    expect(child.yogaNode).toBeUndefined()

    parent2.appendChild(child)
    expect(child.yogaNode).toBeDefined()
    parent2.removeChild(child)
    expect(child.yogaNode).toBeUndefined()
  })

  test('RenderFlex 子树', () => {
    const subTreeRoot = new RenderFlex()
    subTreeRoot.id = 'subTreeRoot'
    const node1 = new RenderFlex()
    node1.id = 'node1'
    const node11 = new RenderFlex()
    node11.id = 'node11'
    const node12 = new RenderFlex()
    node12.id = 'node12'
    const node2 = new RenderFlex()
    node2.id = 'node2'
    const node21 = new RenderFlex()
    node21.id = 'node21'
    const node22 = new RenderFlex()
    node22.id = 'node22'

    node1.appendChild(node11)
    node1.appendChild(node12)
    subTreeRoot.appendChild(node1)
    node2.appendChild(node21)
    node2.appendChild(node22)
    subTreeRoot.appendChild(node2)

    const parent = new RenderView()
    parent.id = 'parent'
    parent.appendChild(subTreeRoot)

    // 当树根被添加为子节点时，会构造 YogaNodes
    expect(subTreeRoot.yogaNode).toBeDefined()
    assertRefEqual(subTreeRoot.yogaNode!.getChild(0), node1.yogaNode)
    assertRefEqual(node1.yogaNode!.getChild(0), node11.yogaNode)
    assertRefEqual(node1.yogaNode!.getChild(1), node12.yogaNode)
    assertRefEqual(subTreeRoot.yogaNode?.getChild(1), node2.yogaNode)
    assertRefEqual(node2.yogaNode!.getChild(0), node21.yogaNode)
    assertRefEqual(node2.yogaNode!.getChild(1), node22.yogaNode)

    // 当树根被移除时，会析构 YogaNodes
    parent.removeChild(subTreeRoot)
    expect(subTreeRoot.yogaNode).toBeUndefined()
    expect(node1.yogaNode).toBeUndefined()
    expect(node11.yogaNode).toBeUndefined()
    expect(node12.yogaNode).toBeUndefined()
    expect(node2.yogaNode).toBeUndefined()
    expect(node21.yogaNode).toBeUndefined()
    expect(node22.yogaNode).toBeUndefined()
  })

})

type Bound = {
  readonly __nbindFlags: number
  readonly __nbindPtr: number
  readonly __nbindState: number
}
function assertRefEqual(lhs: any, rhs: any) {
  const _lhs = lhs as Bound
  const _rhs = rhs as Bound
  expect(_lhs).toBeDefined()
  expect(_rhs).toBeDefined()
  expect(typeof _lhs.__nbindFlags).toBe('number')
  expect(typeof _rhs.__nbindFlags).toBe('number')
  expect(_lhs.__nbindFlags).toBe(_rhs.__nbindFlags)
  expect(typeof _lhs.__nbindPtr).toBe('number')
  expect(typeof _rhs.__nbindPtr).toBe('number')
  expect(_lhs.__nbindPtr).toBe(_rhs.__nbindPtr)
  expect(typeof _lhs.__nbindState).toBe('number')
  expect(typeof _rhs.__nbindState).toBe('number')
  expect(_lhs.__nbindState).toBe(_rhs.__nbindState)
}
