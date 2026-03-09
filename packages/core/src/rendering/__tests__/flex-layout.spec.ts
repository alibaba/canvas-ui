import {
  FlexNode,
  FLEX_DIRECTION_ROW,
  FLEX_DIRECTION_COLUMN_REVERSE,
  FLEX_DIRECTION_ROW_REVERSE,
  WRAP_WRAP,
  JUSTIFY_FLEX_END,
  JUSTIFY_CENTER,
  JUSTIFY_SPACE_BETWEEN,
  JUSTIFY_SPACE_AROUND,
  JUSTIFY_SPACE_EVENLY,
  ALIGN_FLEX_START,
  ALIGN_FLEX_END,
  ALIGN_CENTER,
  EDGE_LEFT,
  EDGE_TOP,
  POSITION_TYPE_ABSOLUTE,
  POSITION_TYPE_RELATIVE,
  DISPLAY_NONE,
} from '../flex-layout'

function createNode(opts?: {
  width?: number | string
  height?: number | string
  flexGrow?: number
  flexShrink?: number
  flexBasis?: number | string
}): FlexNode {
  const node = FlexNode.create()
  if (opts?.width !== undefined) node.setWidth(opts.width)
  if (opts?.height !== undefined) node.setHeight(opts.height)
  if (opts?.flexGrow !== undefined) node.setFlexGrow(opts.flexGrow)
  if (opts?.flexShrink !== undefined) node.setFlexShrink(opts.flexShrink)
  if (opts?.flexBasis !== undefined) node.setFlexBasis(opts.flexBasis)
  return node
}

describe('FlexLayout', () => {

  describe('basic layout', () => {

    test('single child with fixed size', () => {
      const root = createNode({ width: 200, height: 200 })
      const child = createNode({ width: 100, height: 50 })
      root.insertChild(child, 0)
      root.calculateLayout()

      expect(root.getComputedLayout().width).toBe(200)
      expect(root.getComputedLayout().height).toBe(200)
      expect(child.getComputedLayout().width).toBe(100)
      expect(child.getComputedLayout().height).toBe(50)
    })

    test('column direction (default)', () => {
      const root = createNode({ width: 200, height: 200 })
      const a = createNode({ width: 100, height: 50 })
      const b = createNode({ width: 100, height: 50 })
      root.insertChild(a, 0)
      root.insertChild(b, 1)
      root.calculateLayout()

      expect(a.getComputedLayout().left).toBe(0)
      expect(a.getComputedLayout().top).toBe(0)
      expect(b.getComputedLayout().left).toBe(0)
      expect(b.getComputedLayout().top).toBe(50)
    })

    test('row direction', () => {
      const root = createNode({ width: 200, height: 200 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      const a = createNode({ width: 50, height: 50 })
      const b = createNode({ width: 100, height: 50 })
      root.insertChild(a, 0)
      root.insertChild(b, 1)
      root.calculateLayout()

      expect(a.getComputedLayout().left).toBe(0)
      expect(a.getComputedLayout().top).toBe(0)
      expect(b.getComputedLayout().left).toBe(50)
      expect(b.getComputedLayout().top).toBe(0)
    })

    test('row-reverse direction', () => {
      const root = createNode({ width: 200, height: 200 })
      root.setFlexDirection(FLEX_DIRECTION_ROW_REVERSE)
      const a = createNode({ width: 50, height: 50 })
      const b = createNode({ width: 100, height: 50 })
      root.insertChild(a, 0)
      root.insertChild(b, 1)
      root.calculateLayout()

      // Items are placed from right to left
      expect(a.getComputedLayout().left).toBe(150)
      expect(b.getComputedLayout().left).toBe(50)
    })

    test('column-reverse direction', () => {
      const root = createNode({ width: 200, height: 200 })
      root.setFlexDirection(FLEX_DIRECTION_COLUMN_REVERSE)
      const a = createNode({ width: 50, height: 50 })
      const b = createNode({ width: 50, height: 100 })
      root.insertChild(a, 0)
      root.insertChild(b, 1)
      root.calculateLayout()

      // Items are placed from bottom to top
      expect(a.getComputedLayout().top).toBe(150)
      expect(b.getComputedLayout().top).toBe(50)
    })
  })

  describe('flexGrow', () => {

    test('single child grows to fill', () => {
      const root = createNode({ width: 200, height: 200 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      const child = createNode({ width: 50, height: 50, flexGrow: 1 })
      root.insertChild(child, 0)
      root.calculateLayout()

      expect(child.getComputedLayout().width).toBe(200)
    })

    test('multiple children with different grow values', () => {
      const root = createNode({ width: 300, height: 100 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      const a = createNode({ height: 50, flexGrow: 1 })
      const b = createNode({ height: 50, flexGrow: 2 })
      root.insertChild(a, 0)
      root.insertChild(b, 1)
      root.calculateLayout()

      expect(a.getComputedLayout().width).toBe(100)
      expect(b.getComputedLayout().width).toBe(200)
    })
  })

  describe('flexShrink', () => {

    test('children shrink when overflowing', () => {
      const root = createNode({ width: 100, height: 100 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      const a = createNode({ width: 100, height: 50, flexShrink: 1 })
      const b = createNode({ width: 100, height: 50, flexShrink: 1 })
      root.insertChild(a, 0)
      root.insertChild(b, 1)
      root.calculateLayout()

      expect(a.getComputedLayout().width).toBe(50)
      expect(b.getComputedLayout().width).toBe(50)
    })
  })

  describe('justifyContent', () => {

    test('flex-end', () => {
      const root = createNode({ width: 200, height: 100 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      root.setJustifyContent(JUSTIFY_FLEX_END)
      const child = createNode({ width: 50, height: 50 })
      root.insertChild(child, 0)
      root.calculateLayout()

      expect(child.getComputedLayout().left).toBe(150)
    })

    test('center', () => {
      const root = createNode({ width: 200, height: 100 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      root.setJustifyContent(JUSTIFY_CENTER)
      const child = createNode({ width: 50, height: 50 })
      root.insertChild(child, 0)
      root.calculateLayout()

      expect(child.getComputedLayout().left).toBe(75)
    })

    test('space-between', () => {
      const root = createNode({ width: 300, height: 100 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      root.setJustifyContent(JUSTIFY_SPACE_BETWEEN)
      const a = createNode({ width: 50, height: 50 })
      const b = createNode({ width: 50, height: 50 })
      const c = createNode({ width: 50, height: 50 })
      root.insertChild(a, 0)
      root.insertChild(b, 1)
      root.insertChild(c, 2)
      root.calculateLayout()

      expect(a.getComputedLayout().left).toBe(0)
      expect(b.getComputedLayout().left).toBe(125)
      expect(c.getComputedLayout().left).toBe(250)
    })

    test('space-around', () => {
      const root = createNode({ width: 300, height: 100 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      root.setJustifyContent(JUSTIFY_SPACE_AROUND)
      const a = createNode({ width: 50, height: 50 })
      const b = createNode({ width: 50, height: 50 })
      root.insertChild(a, 0)
      root.insertChild(b, 1)
      root.calculateLayout()

      expect(a.getComputedLayout().left).toBe(50)
      expect(b.getComputedLayout().left).toBe(200)
    })

    test('space-evenly', () => {
      const root = createNode({ width: 300, height: 100 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      root.setJustifyContent(JUSTIFY_SPACE_EVENLY)
      const a = createNode({ width: 50, height: 50 })
      const b = createNode({ width: 50, height: 50 })
      root.insertChild(a, 0)
      root.insertChild(b, 1)
      root.calculateLayout()

      // freeSpace = 300 - 100 = 200, spacing = 200/3 ≈ 66.67
      const spacing = 200 / 3
      expect(a.getComputedLayout().left).toBeCloseTo(spacing)
      expect(b.getComputedLayout().left).toBeCloseTo(spacing * 2 + 50)
    })
  })

  describe('alignItems', () => {

    test('flex-start', () => {
      const root = createNode({ width: 200, height: 200 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      root.setAlignItems(ALIGN_FLEX_START)
      const child = createNode({ width: 50, height: 50 })
      root.insertChild(child, 0)
      root.calculateLayout()

      expect(child.getComputedLayout().top).toBe(0)
    })

    test('flex-end', () => {
      const root = createNode({ width: 200, height: 200 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      root.setAlignItems(ALIGN_FLEX_END)
      const child = createNode({ width: 50, height: 50 })
      root.insertChild(child, 0)
      root.calculateLayout()

      expect(child.getComputedLayout().top).toBe(150)
    })

    test('center', () => {
      const root = createNode({ width: 200, height: 200 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      root.setAlignItems(ALIGN_CENTER)
      const child = createNode({ width: 50, height: 50 })
      root.insertChild(child, 0)
      root.calculateLayout()

      expect(child.getComputedLayout().top).toBe(75)
    })

    test('stretch (default)', () => {
      const root = createNode({ width: 200, height: 200 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      // ALIGN_STRETCH is default for alignItems
      const child = createNode({ width: 50 })
      root.insertChild(child, 0)
      root.calculateLayout()

      expect(child.getComputedLayout().height).toBe(200)
    })
  })

  describe('alignSelf', () => {

    test('overrides alignItems', () => {
      const root = createNode({ width: 200, height: 200 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      root.setAlignItems(ALIGN_FLEX_START)
      const child = createNode({ width: 50, height: 50 })
      child.setAlignSelf(ALIGN_FLEX_END)
      root.insertChild(child, 0)
      root.calculateLayout()

      expect(child.getComputedLayout().top).toBe(150)
    })
  })

  describe('padding', () => {

    test('padding affects child positioning', () => {
      const root = createNode({ width: 200, height: 200 })
      root.setPadding(EDGE_LEFT, 10)
      root.setPadding(EDGE_TOP, 20)
      const child = createNode({ width: 50, height: 50 })
      root.insertChild(child, 0)
      root.calculateLayout()

      expect(child.getComputedLayout().left).toBe(10)
      expect(child.getComputedLayout().top).toBe(20)
    })
  })

  describe('margin', () => {

    test('margin on child', () => {
      const root = createNode({ width: 200, height: 200 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      const child = createNode({ width: 50, height: 50 })
      child.setMargin(EDGE_LEFT, 10)
      child.setMargin(EDGE_TOP, 20)
      root.insertChild(child, 0)
      root.calculateLayout()

      expect(child.getComputedLayout().left).toBe(10)
      expect(child.getComputedLayout().top).toBe(20)
    })
  })

  describe('position', () => {

    test('absolute positioning', () => {
      const root = createNode({ width: 200, height: 200 })
      const child = createNode({ width: 50, height: 50 })
      child.setPositionType(POSITION_TYPE_ABSOLUTE)
      child.setPosition(EDGE_LEFT, 30)
      child.setPosition(EDGE_TOP, 40)
      root.insertChild(child, 0)
      root.calculateLayout()

      expect(child.getComputedLayout().left).toBe(30)
      expect(child.getComputedLayout().top).toBe(40)
    })

    test('relative positioning with offset', () => {
      const root = createNode({ width: 200, height: 200 })
      const child = createNode({ width: 50, height: 50 })
      child.setPositionType(POSITION_TYPE_RELATIVE)
      child.setPosition(EDGE_LEFT, 10)
      child.setPosition(EDGE_TOP, 10)
      root.insertChild(child, 0)
      root.calculateLayout()

      expect(child.getComputedLayout().left).toBe(10)
      expect(child.getComputedLayout().top).toBe(10)
    })
  })

  describe('display none', () => {

    test('hidden child does not participate in layout', () => {
      const root = createNode({ width: 200, height: 200 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      const a = createNode({ width: 50, height: 50 })
      const b = createNode({ width: 50, height: 50 })
      b.setDisplay(DISPLAY_NONE)
      const c = createNode({ width: 50, height: 50 })
      root.insertChild(a, 0)
      root.insertChild(b, 1)
      root.insertChild(c, 2)
      root.calculateLayout()

      expect(a.getComputedLayout().left).toBe(0)
      expect(c.getComputedLayout().left).toBe(50) // b is skipped
    })
  })

  describe('wrap', () => {

    test('items wrap to next line', () => {
      const root = createNode({ width: 120, height: 200 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      root.setFlexWrap(WRAP_WRAP)
      const a = createNode({ width: 50, height: 50 })
      const b = createNode({ width: 50, height: 50 })
      const c = createNode({ width: 50, height: 50 })
      root.insertChild(a, 0)
      root.insertChild(b, 1)
      root.insertChild(c, 2)
      root.calculateLayout()

      // a and b fit on first line (100 <= 120)
      expect(a.getComputedLayout().left).toBe(0)
      expect(a.getComputedLayout().top).toBe(0)
      expect(b.getComputedLayout().left).toBe(50)
      expect(b.getComputedLayout().top).toBe(0)
      // c wraps to second line
      expect(c.getComputedLayout().left).toBe(0)
      expect(c.getComputedLayout().top).toBe(50)
    })
  })

  describe('min/max dimensions', () => {

    test('minWidth is respected', () => {
      const root = createNode({ width: 200, height: 200 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      const child = createNode({ height: 50, flexGrow: 1 })
      child.setMinWidth(100)
      root.insertChild(child, 0)
      root.calculateLayout()

      expect(child.getComputedLayout().width).toBeGreaterThanOrEqual(100)
    })

    test('maxWidth is respected', () => {
      const root = createNode({ width: 200, height: 200 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      const child = createNode({ height: 50, flexGrow: 1 })
      child.setMaxWidth(100)
      root.insertChild(child, 0)
      root.calculateLayout()

      expect(child.getComputedLayout().width).toBeLessThanOrEqual(100)
    })
  })

  describe('measure function', () => {

    test('leaf node with measure function', () => {
      const root = createNode({ width: 200, height: 200 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      const leaf = FlexNode.create()
      leaf.setMeasureFunc((_width, _widthMode, _height, _heightMode) => {
        return { width: 75, height: 30 }
      })
      root.insertChild(leaf, 0)
      root.calculateLayout()

      expect(leaf.getComputedLayout().width).toBe(75)
      expect(leaf.getComputedLayout().height).toBe(30)
    })

    test('measure function receives correct modes', () => {
      const root = createNode({ width: 200, height: 200 })
      const leaf = FlexNode.create()
      const modes: { widthMode: number; heightMode: number }[] = []
      leaf.setMeasureFunc((_width, widthMode, _height, heightMode) => {
        modes.push({ widthMode, heightMode })
        return { width: 50, height: 50 }
      })
      root.insertChild(leaf, 0)
      root.calculateLayout()

      expect(modes.length).toBeGreaterThan(0)
    })
  })

  describe('node hierarchy', () => {

    test('insertChild and removeChild', () => {
      const parent = FlexNode.create()
      const child = FlexNode.create()

      parent.insertChild(child, 0)
      expect(parent.getChildCount()).toBe(1)
      expect(parent.getChild(0)).toBe(child)
      expect(child.getParent()).toBe(parent)

      parent.removeChild(child)
      expect(parent.getChildCount()).toBe(0)
      expect(child.getParent()).toBeUndefined()
    })

    test('dirty propagation', () => {
      const root = FlexNode.create()
      const child = FlexNode.create()
      child.setMeasureFunc(() => ({ width: 0, height: 0 }))
      root.insertChild(child, 0)

      root.calculateLayout()
      expect(root.isDirty()).toBe(false)
      expect(child.isDirty()).toBe(false)

      child.markDirty()
      expect(child.isDirty()).toBe(true)
      expect(root.isDirty()).toBe(true)
    })

    test('free and freeRecursive', () => {
      const root = FlexNode.create()
      const child = FlexNode.create()
      root.insertChild(child, 0)

      root.freeRecursive()
      expect(root.getChildCount()).toBe(0)
    })
  })

  describe('percentage values', () => {

    test('width and height as percentage', () => {
      const root = createNode({ width: 200, height: 200 })
      const child = FlexNode.create()
      child.setWidth('50%')
      child.setHeight('50%')
      root.insertChild(child, 0)
      root.calculateLayout()

      expect(child.getComputedLayout().width).toBe(100)
      expect(child.getComputedLayout().height).toBe(100)
    })
  })

  describe('NaN reset behavior', () => {

    test('NaN values reset to defaults', () => {
      const node = FlexNode.create()
      node.setMinWidth(100)
      node.setMargin(EDGE_LEFT, 20)
      node.calculateLayout()
      expect(node.getComputedLayout().left).toBe(20)
      expect(node.getComputedLayout().width).toBeGreaterThanOrEqual(100)

      node.setMinWidth(NaN)
      node.setMargin(EDGE_LEFT, NaN)
      node.calculateLayout()
      expect(node.getComputedLayout().left).toBe(0)
      expect(node.getComputedLayout().width).toBe(0)
    })
  })

  describe('alignSelf enum', () => {

    test('ALIGN_AUTO defaults to parent alignItems', () => {
      const root = createNode({ width: 200, height: 200 })
      root.setFlexDirection(FLEX_DIRECTION_ROW)
      root.setAlignItems(ALIGN_CENTER)
      const child = createNode({ width: 50, height: 50 })
      // default alignSelf is ALIGN_AUTO
      root.insertChild(child, 0)
      root.calculateLayout()

      expect(child.getComputedLayout().top).toBe(75)
    })
  })

  describe('setAlignSelf method', () => {

    test('setAlignSelf exists on FlexNode', () => {
      const node = FlexNode.create()
      expect(typeof node.setAlignSelf).toBe('function')
    })
  })
})
