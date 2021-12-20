import Yoga, { FLEX_DIRECTION_ROW, YogaNode } from 'yoga-layout-prebuilt-fork'

function makeNodes(...parents: (YogaNode | null)[]) {
  return parents.map(parent => {
    const node = Yoga.Node.create()
    parent?.insertChild(node, parent.getChildCount())
    return node
  })
}

describe('yoga', () => {

  test('测试属性值 auto', () => {
    const a = Yoga.Node.create()
    a.setWidth('auto')
    // a.setMinWidth('auto') // 文档支持，实际不支持，需使用 NaN
    // a.setMaxWidth('auto') // 文档支持，实际不支持，需使用 NaN
    // a.setFlexBasis('auto') // 文档支持，实际不支持
  })

  test('通过 NaN 表达值未设置', () => {
    const a = Yoga.Node.create()
    a.setMinWidth(100)
    a.setMargin(Yoga.EDGE_LEFT, 20)
    a.calculateLayout()
    expect(a.getComputedLayout().left).toBe(20)
    expect(a.getComputedLayout().width).toBe(100)
    a.setMinWidth(NaN)
    a.setMargin(Yoga.EDGE_LEFT, NaN)
    a.calculateLayout()
    expect(a.getComputedLayout().left).toBe(0)
    expect(a.getComputedLayout().width).toBe(0)
  })

  test('setMeasureFunc', () => {
    const a1 = Yoga.Node.create()
    const a11 = Yoga.Node.create()
    const measure = jest.fn(() => {
      return {
        width: 0,
        height: 0,
      }
    })
    a11.setMeasureFunc(measure)
    a1.insertChild(a11, 0)
    a1.calculateLayout(100, 100)
    expect(measure).toBeCalledTimes(1)
    a1.freeRecursive()
  })

  test('验证 markDirty 会冒泡', () => {
    const measure = jest.fn()
    const a1 = Yoga.Node.create()
    const a11 = Yoga.Node.create()
    const a12 = Yoga.Node.create()
    const a111 = Yoga.Node.create()

    a1.insertChild(a11, 0)
    a1.insertChild(a12, 0)
    a11.insertChild(a111, 0)

    // 清理所有 dirty 标记
    a1.calculateLayout()

    a111.setMeasureFunc(measure)
    a111.markDirty()
    expect(a11.isDirty()).toBe(true)
    expect(a12.isDirty()).toBe(false)
    a1.freeRecursive()
  })

  test('标记为 dirty 后应该可以调用 measureFunc', () => {
    const a1 = Yoga.Node.create()
    const a11 = Yoga.Node.create()
    const measure = jest.fn(() => {
      return {
        width: 0,
        height: 0,
      }
    })
    a11.setMeasureFunc(measure)
    a1.insertChild(a11, 0)
    a1.calculateLayout(100, 100)
    a11.markDirty()
    a1.calculateLayout(100, 100)
    expect(measure).toBeCalledTimes(2)
    a1.freeRecursive()
  })

  test('yoga nested test', () => {
    //
    // 如下结构
    //       a
    //      / \
    //     b   c
    //    / \   \
    //   d   e   f
    //

    const config = Yoga.Config.create()
    const a = Yoga.Node.createWithConfig(config)
    const b = Yoga.Node.createWithConfig(config)
    const c = Yoga.Node.createWithConfig(config)
    const d = Yoga.Node.createWithConfig(config)
    const e = Yoga.Node.createWithConfig(config)
    const f = Yoga.Node.createWithConfig(config)

    a.insertChild(b, 0)
    a.insertChild(c, 1)
    b.insertChild(d, 0)
    b.insertChild(e, 1)
    c.insertChild(f, 0)

    a.setWidth(500)
    a.setHeight(500)

    a.setFlexDirection(Yoga.FLEX_DIRECTION_ROW)
    a.setFlexWrap(Yoga.WRAP_NO_WRAP)
    a.setAlignItems(Yoga.ALIGN_FLEX_START)
    b.setFlexDirection(Yoga.FLEX_DIRECTION_ROW)
    b.setFlexWrap(Yoga.WRAP_NO_WRAP)
    c.setFlexDirection(Yoga.FLEX_DIRECTION_ROW)

    d.setWidth(50)
    d.setHeight(50)

    e.setWidth(50)
    e.setHeight(50)
    f.setWidth(50)
    f.setHeight(100)

    a.calculateLayout()
    expect(d.getComputedLayout()).toEqual({ left: 0, right: 0, top: 0, bottom: 0, width: 50, height: 50 })
    expect(e.getComputedLayout()).toEqual({ left: 50, right: 0, top: 0, bottom: 0, width: 50, height: 50 })
    expect(b.getComputedLayout()).toEqual({ left: 0, right: 0, top: 0, bottom: 0, width: 100, height: 50 })
    expect(c.getComputedLayout()).toEqual({ left: 100, right: 0, top: 0, bottom: 0, width: 50, height: 100 })
  })

  test('overflow', () => {
    //
    // 如下结构
    //       a - d
    //      / \
    //     b   c
    //

    const a = Yoga.Node.create()
    const b = Yoga.Node.create()
    a.insertChild(b, a.getChildCount())
    const c = Yoga.Node.create()
    a.insertChild(c, a.getChildCount())
    const d = Yoga.Node.create()
    a.insertChild(d, a.getChildCount())

    a.setOverflow(Yoga.OVERFLOW_SCROLL)
    a.setWidth(100)
    a.setHeight(100)

    b.setWidth(100)
    b.setHeight(50)

    c.setWidth(100)
    c.setHeight(50)

    d.setWidth(100)
    d.setHeight(50)

    a.calculateLayout()
  })

  test('single-child 模式', () => {
    //
    // 构造结构
    //        root
    //        /  \
    //       wa   wb
    //       |     |
    //       a     b
    //      / \   / \
    //     a1 a2 b1 b2
    //
    const [root] = makeNodes(null)
    const [wa, wb] = makeNodes(root, root)
    const [a, b] = makeNodes(wa, wb)
    const [a1, a2, b1, b2] = makeNodes(a, a, b, b)
    a.setMaxWidth(50)
    a.setMaxHeight(50)
    a.setFlexDirection(FLEX_DIRECTION_ROW)
    a1.setWidth(100)
    a1.setHeight(100)
    a2.setWidth(100)
    a2.setHeight(100)
    wb.setHeight(300)
    b.setMinWidth(200)
    b.setHeight('100%')
    b.setFlexDirection(FLEX_DIRECTION_ROW)
    b1.setWidth(100)
    b1.setHeight(100)
    b2.setWidth(100)
    b2.setHeight(100)
    root.calculateLayout()
    // console.info({
    //   root: root.getComputedLayout(),
    //   wa: wa.getComputedLayout(),
    //   a: a.getComputedLayout(),
    //   wb: wb.getComputedLayout(),
    //   b: b.getComputedLayout(),
    // })
  })

  xtest('many children', () => {

    const board = Yoga.Node.create()

    const makeTaskList = (taskCount = 10000) => {
      const list = Yoga.Node.create()
      for (const index of Array.from(new Array(taskCount).keys())) {
        const card = Yoga.Node.create()
        card.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN)
        card.setHeight(100)
        card.setPositionType(Yoga.POSITION_TYPE_ABSOLUTE)
        card.setMeasureFunc((width, _, height) => {
          return {
            width,
            height,
          }
        })
        list.insertChild(card, index)
      }
      return list
    }

    const taskLists = [
      makeTaskList(10000),
      makeTaskList(10000),
      makeTaskList(10000),
      makeTaskList(10000),
      makeTaskList(10000),
      makeTaskList(10000),
      makeTaskList(10000),
      makeTaskList(10000),
    ]

    taskLists.forEach((it, index) => {
      board.insertChild(it, index)
    })

    console.time('initial')
    board.calculateLayout()
    console.timeEnd('initial')

    taskLists[0].getChild(0).setPosition(Yoga.EDGE_LEFT, 10)
    console.time('update 0-0')
    board.calculateLayout()
    console.timeEnd('update 0-0')
    board.freeRecursive()
  })
})
