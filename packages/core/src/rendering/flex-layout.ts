/**
 * Pure TypeScript implementation of Flex layout engine.
 * Replaces Yoga (asm.js) with a native JS implementation.
 * 
 * Supports:
 * - flexDirection (row, row-reverse, column, column-reverse)
 * - flexWrap (nowrap, wrap, wrap-reverse)
 * - justifyContent (flex-start, flex-end, center, space-between, space-around, space-evenly)
 * - alignItems (stretch, flex-start, flex-end, center, baseline)
 * - alignContent (flex-start, flex-end, center, stretch, space-between, space-around)
 * - alignSelf (auto, stretch, flex-start, flex-end, center, baseline)
 * - flexGrow, flexShrink, flexBasis
 * - width, height, minWidth, minHeight, maxWidth, maxHeight (number, percentage, auto)
 * - padding, margin, position per edge
 * - position type (relative, absolute)
 * - display (flex, none)
 * - measure functions for leaf nodes
 */

// ---- Constants (matching Yoga's enum values) ----

export const FLEX_DIRECTION_COLUMN = 0
export const FLEX_DIRECTION_COLUMN_REVERSE = 1
export const FLEX_DIRECTION_ROW = 2
export const FLEX_DIRECTION_ROW_REVERSE = 3

export const ALIGN_AUTO = 0
export const ALIGN_FLEX_START = 1
export const ALIGN_CENTER = 2
export const ALIGN_FLEX_END = 3
export const ALIGN_STRETCH = 4
export const ALIGN_BASELINE = 5
export const ALIGN_SPACE_BETWEEN = 6
export const ALIGN_SPACE_AROUND = 7

export const JUSTIFY_FLEX_START = 0
export const JUSTIFY_CENTER = 1
export const JUSTIFY_FLEX_END = 2
export const JUSTIFY_SPACE_BETWEEN = 3
export const JUSTIFY_SPACE_AROUND = 4
export const JUSTIFY_SPACE_EVENLY = 5

export const WRAP_NO_WRAP = 0
export const WRAP_WRAP = 1
export const WRAP_WRAP_REVERSE = 2

export const EDGE_LEFT = 0
export const EDGE_TOP = 1
export const EDGE_RIGHT = 2
export const EDGE_BOTTOM = 3

export const POSITION_TYPE_RELATIVE = 0
export const POSITION_TYPE_ABSOLUTE = 1

export const DISPLAY_FLEX = 0
export const DISPLAY_NONE = 1

export const OVERFLOW_VISIBLE = 0
export const OVERFLOW_HIDDEN = 1
export const OVERFLOW_SCROLL = 2

export const MEASURE_MODE_UNDEFINED = 0
export const MEASURE_MODE_EXACTLY = 1
export const MEASURE_MODE_AT_MOST = 2

// ---- Types ----

export type FlexDirection = typeof FLEX_DIRECTION_COLUMN | typeof FLEX_DIRECTION_COLUMN_REVERSE | typeof FLEX_DIRECTION_ROW | typeof FLEX_DIRECTION_ROW_REVERSE
export type FlexAlign = typeof ALIGN_AUTO | typeof ALIGN_FLEX_START | typeof ALIGN_CENTER | typeof ALIGN_FLEX_END | typeof ALIGN_STRETCH | typeof ALIGN_BASELINE | typeof ALIGN_SPACE_BETWEEN | typeof ALIGN_SPACE_AROUND
export type FlexJustify = typeof JUSTIFY_FLEX_START | typeof JUSTIFY_CENTER | typeof JUSTIFY_FLEX_END | typeof JUSTIFY_SPACE_BETWEEN | typeof JUSTIFY_SPACE_AROUND | typeof JUSTIFY_SPACE_EVENLY
export type FlexWrap = typeof WRAP_NO_WRAP | typeof WRAP_WRAP | typeof WRAP_WRAP_REVERSE
export type Edge = typeof EDGE_LEFT | typeof EDGE_TOP | typeof EDGE_RIGHT | typeof EDGE_BOTTOM
export type PositionType = typeof POSITION_TYPE_RELATIVE | typeof POSITION_TYPE_ABSOLUTE
export type Display = typeof DISPLAY_FLEX | typeof DISPLAY_NONE
export type Overflow = typeof OVERFLOW_VISIBLE | typeof OVERFLOW_HIDDEN | typeof OVERFLOW_SCROLL
export type MeasureMode = typeof MEASURE_MODE_UNDEFINED | typeof MEASURE_MODE_EXACTLY | typeof MEASURE_MODE_AT_MOST

export type MeasureFunction = (
  width: number,
  widthMode: MeasureMode,
  height: number,
  heightMode: MeasureMode,
) => { width: number; height: number }

export interface ComputedLayout {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

// ---- Helper: value can be number, percentage string, or 'auto' ----

type DimensionValue = number | string | 'auto'

function isDefinedNumber(val: DimensionValue | undefined): val is number {
  return typeof val === 'number' && !isNaN(val)
}

function resolveValue(val: DimensionValue | undefined, parentSize: number): number | undefined {
  if (val === undefined || val === 'auto') return undefined
  if (typeof val === 'number') {
    if (isNaN(val)) return undefined
    return val
  }
  if (typeof val === 'string' && val.endsWith('%')) {
    const pct = parseFloat(val)
    if (!isNaN(pct) && isDefinedNumber(parentSize)) {
      return (pct / 100) * parentSize
    }
  }
  return undefined
}

// ---- FlexConfig (stub for API compatibility) ----

export class FlexConfig {
  static create(): FlexConfig {
    return new FlexConfig()
  }
}

// ---- FlexNode ----

export class FlexNode {

  // ---- Static factory ----

  static create(): FlexNode {
    return new FlexNode()
  }

  static createWithConfig(_config: FlexConfig): FlexNode {
    return new FlexNode()
  }

  // ---- Hierarchy ----

  private _children: FlexNode[] = []
  private _parent: FlexNode | undefined = undefined

  getChildCount(): number {
    return this._children.length
  }

  getChild(index: number): FlexNode {
    return this._children[index]
  }

  getParent(): FlexNode | undefined {
    return this._parent
  }

  insertChild(child: FlexNode, index: number): void {
    if (child._parent) {
      child._parent.removeChild(child)
    }
    child._parent = this
    this._children.splice(index, 0, child)
    this._dirty = true
  }

  removeChild(child: FlexNode): void {
    const idx = this._children.indexOf(child)
    if (idx !== -1) {
      this._children.splice(idx, 1)
      child._parent = undefined
      this._dirty = true
    }
  }

  // ---- Style properties ----

  private _flexDirection: FlexDirection = FLEX_DIRECTION_COLUMN
  private _flexWrap: FlexWrap = WRAP_NO_WRAP
  private _justifyContent: FlexJustify = JUSTIFY_FLEX_START
  private _alignItems: FlexAlign = ALIGN_STRETCH
  private _alignContent: FlexAlign = ALIGN_FLEX_START
  private _alignSelf: FlexAlign = ALIGN_AUTO
  private _display: Display = DISPLAY_FLEX
  // @ts-expect-error Property is set by setOverflow() but not yet read by the layout engine.
  // Kept for API compatibility with Yoga; overflow behavior may be implemented in the future.
  private _overflow: Overflow = OVERFLOW_VISIBLE
  private _positionType: PositionType = POSITION_TYPE_RELATIVE

  private _flexGrow = 0
  private _flexShrink = 1
  private _flexBasis: DimensionValue = 'auto'

  private _width: DimensionValue = 'auto'
  private _height: DimensionValue = 'auto'
  private _minWidth: DimensionValue = 'auto'
  private _minHeight: DimensionValue = 'auto'
  private _maxWidth: DimensionValue = 'auto'
  private _maxHeight: DimensionValue = 'auto'

  private _padding = [0, 0, 0, 0]  // left, top, right, bottom
  private _margin = [0, 0, 0, 0]   // left, top, right, bottom
  private _position: (number | undefined)[] = [undefined, undefined, undefined, undefined] // left, top, right, bottom

  // ---- Setters ----

  setFlexDirection(value: FlexDirection): void { this._flexDirection = value; this._dirty = true }
  setFlexWrap(value: FlexWrap): void { this._flexWrap = value; this._dirty = true }
  setJustifyContent(value: FlexJustify): void { this._justifyContent = value; this._dirty = true }
  setAlignItems(value: FlexAlign): void { this._alignItems = value; this._dirty = true }
  setAlignContent(value: FlexAlign): void { this._alignContent = value; this._dirty = true }
  setAlignSelf(value: FlexAlign): void { this._alignSelf = value; this._dirty = true }
  setDisplay(value: Display): void { this._display = value; this._dirty = true }
  setOverflow(value: Overflow): void { this._overflow = value; this._dirty = true }
  setPositionType(value: PositionType): void { this._positionType = value; this._dirty = true }

  setFlexGrow(value: number): void { this._flexGrow = value; this._dirty = true }
  setFlexShrink(value: number): void { this._flexShrink = value; this._dirty = true }
  setFlexBasis(value: DimensionValue): void { this._flexBasis = value; this._dirty = true }

  setWidth(value: DimensionValue): void { this._width = value; this._dirty = true }
  setHeight(value: DimensionValue): void { this._height = value; this._dirty = true }
  setMinWidth(value: number | string): void { this._minWidth = typeof value === 'number' && isNaN(value) ? 'auto' : value; this._dirty = true }
  setMinHeight(value: number | string): void { this._minHeight = typeof value === 'number' && isNaN(value) ? 'auto' : value; this._dirty = true }
  setMaxWidth(value: number | string): void { this._maxWidth = typeof value === 'number' && isNaN(value) ? 'auto' : value; this._dirty = true }
  setMaxHeight(value: number | string): void { this._maxHeight = typeof value === 'number' && isNaN(value) ? 'auto' : value; this._dirty = true }

  setPadding(edge: Edge, value: number | string): void {
    this._padding[edge] = typeof value === 'number' ? (isNaN(value) ? 0 : value) : 0
    this._dirty = true
  }

  setMargin(edge: Edge, value: number | string): void {
    this._margin[edge] = typeof value === 'number' ? (isNaN(value) ? 0 : value) : 0
    this._dirty = true
  }

  setPosition(edge: Edge, value: number): void {
    this._position[edge] = isNaN(value) ? undefined : value
    this._dirty = true
  }

  getPositionType(): PositionType {
    return this._positionType
  }

  // ---- Measure function ----

  private _measureFunc?: MeasureFunction

  setMeasureFunc(func: MeasureFunction): void {
    this._measureFunc = func
    this._dirty = true
  }

  unsetMeasureFunc(): void {
    this._measureFunc = undefined
  }

  // ---- Dirty tracking ----

  private _dirty = true

  isDirty(): boolean {
    return this._dirty
  }

  markDirty(): void {
    this._dirty = true
    this._lastLayoutInput = undefined
    // Propagate dirty upward
    if (this._parent) {
      this._parent.markDirty()
    }
  }

  // ---- Computed layout ----

  private _layout: ComputedLayout = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }

  // Cache to avoid redundant measure calls
  private _lastLayoutInput?: { availWidth: number; availHeight: number; ownerWidth: number; ownerHeight: number }

  getComputedLayout(): ComputedLayout {
    return { ...this._layout }
  }

  // ---- Memory management (no-op in JS) ----

  free(): void {
    this._parent = undefined
  }

  freeRecursive(): void {
    for (const child of this._children) {
      child.freeRecursive()
    }
    this._children = []
    this._parent = undefined
  }

  // ---- Layout calculation ----

  calculateLayout(parentWidth?: number, parentHeight?: number): void {
    const availWidth = parentWidth ?? NaN
    const availHeight = parentHeight ?? NaN
    this._computeLayout(availWidth, availHeight, availWidth, availHeight)
    // Apply own margin to root position (matching Yoga behavior)
    this._layout.left = this._margin[EDGE_LEFT]
    this._layout.top = this._margin[EDGE_TOP]
    this._clearDirtyRecursive()
  }

  private _clearDirtyRecursive(): void {
    this._dirty = false
    for (const child of this._children) {
      child._clearDirtyRecursive()
    }
  }

  /**
   * Core layout algorithm. Computes size and positions for this node and all children.
   */
  private _computeLayout(
    availWidth: number,
    availHeight: number,
    ownerWidth: number,
    ownerHeight: number,
  ): void {
    // Skip recomputation if not dirty and inputs haven't changed
    if (!this._dirty && this._lastLayoutInput) {
      const last = this._lastLayoutInput
      if (sameValue(last.availWidth, availWidth)
        && sameValue(last.availHeight, availHeight)
        && sameValue(last.ownerWidth, ownerWidth)
        && sameValue(last.ownerHeight, ownerHeight)) {
        return
      }
    }

    this._lastLayoutInput = { availWidth, availHeight, ownerWidth, ownerHeight }
    if (this._display === DISPLAY_NONE) {
      this._layout = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }
      return
    }

    const isRow = this._flexDirection === FLEX_DIRECTION_ROW || this._flexDirection === FLEX_DIRECTION_ROW_REVERSE
    const isReverse = this._flexDirection === FLEX_DIRECTION_ROW_REVERSE || this._flexDirection === FLEX_DIRECTION_COLUMN_REVERSE
    const isWrap = this._flexWrap !== WRAP_NO_WRAP
    const isWrapReverse = this._flexWrap === WRAP_WRAP_REVERSE

    const paddingLeft = this._padding[EDGE_LEFT]
    const paddingTop = this._padding[EDGE_TOP]
    const paddingRight = this._padding[EDGE_RIGHT]
    const paddingBottom = this._padding[EDGE_BOTTOM]
    const paddingMainStart = isRow ? paddingLeft : paddingTop
    const paddingMainEnd = isRow ? paddingRight : paddingBottom
    const paddingCrossStart = isRow ? paddingTop : paddingLeft
    const paddingCrossEnd = isRow ? paddingBottom : paddingRight

    // Resolve own dimensions
    const resolvedWidth = resolveValue(this._width, ownerWidth)
    const resolvedHeight = resolveValue(this._height, ownerHeight)
    const resolvedMinWidth = resolveValue(this._minWidth, ownerWidth)
    const resolvedMinHeight = resolveValue(this._minHeight, ownerHeight)
    const resolvedMaxWidth = resolveValue(this._maxWidth, ownerWidth)
    const resolvedMaxHeight = resolveValue(this._maxHeight, ownerHeight)

    let containerWidth = resolvedWidth
    let containerHeight = resolvedHeight

    // Use available size if own size not set
    if (containerWidth === undefined && isDefinedNumber(availWidth)) {
      containerWidth = availWidth
    }
    if (containerHeight === undefined && isDefinedNumber(availHeight)) {
      containerHeight = availHeight
    }

    // Apply min/max constraints to container dimensions
    containerWidth = applyMinMax(containerWidth, resolvedMinWidth, resolvedMaxWidth)
    containerHeight = applyMinMax(containerHeight, resolvedMinHeight, resolvedMaxHeight)

    const innerWidth = containerWidth !== undefined ? containerWidth - paddingLeft - paddingRight : undefined
    const innerHeight = containerHeight !== undefined ? containerHeight - paddingTop - paddingBottom : undefined

    const mainSize = isRow ? innerWidth : innerHeight

    // If we have a measure function, use it (leaf node)
    if (this._measureFunc) {
      const widthMode = resolvedWidth !== undefined ? MEASURE_MODE_EXACTLY
        : resolvedMaxWidth !== undefined ? MEASURE_MODE_AT_MOST
          : MEASURE_MODE_UNDEFINED
      const heightMode = resolvedHeight !== undefined ? MEASURE_MODE_EXACTLY
        : resolvedMaxHeight !== undefined ? MEASURE_MODE_AT_MOST
          : MEASURE_MODE_UNDEFINED

      const measuredWidth = containerWidth ?? (resolvedMaxWidth ?? (isDefinedNumber(availWidth) ? availWidth : 0))
      const measuredHeight = containerHeight ?? (resolvedMaxHeight ?? (isDefinedNumber(availHeight) ? availHeight : 0))

      const measured = this._measureFunc(
        measuredWidth,
        widthMode as MeasureMode,
        measuredHeight,
        heightMode as MeasureMode,
      )

      let w = resolvedWidth ?? measured.width
      let h = resolvedHeight ?? measured.height
      w = applyMinMax(w, resolvedMinWidth, resolvedMaxWidth) ?? w
      h = applyMinMax(h, resolvedMinHeight, resolvedMaxHeight) ?? h

      this._layout.width = w + paddingLeft + paddingRight
      this._layout.height = h + paddingTop + paddingBottom
      return
    }

    // Collect children for layout (skip display:none)
    const flexChildren: FlexNode[] = []
    const absoluteChildren: FlexNode[] = []
    for (const child of this._children) {
      if (child._display === DISPLAY_NONE) {
        child._layout = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }
        continue
      }
      if (child._positionType === POSITION_TYPE_ABSOLUTE) {
        absoluteChildren.push(child)
      } else {
        flexChildren.push(child)
      }
    }

    // Phase 1: Measure all flex children to determine their hypothetical main size
    interface FlexChildInfo {
      node: FlexNode
      mainSize: number
      crossSize: number
      marginMainStart: number
      marginMainEnd: number
      marginCrossStart: number
      marginCrossEnd: number
      flexBasis: number
      flexGrow: number
      flexShrink: number
      frozen: boolean
      targetMainSize: number
      measuredCrossSize?: number  // cached from flex basis measurement
    }

    const childInfos: FlexChildInfo[] = []

    for (const child of flexChildren) {
      const childMarginLeft = child._margin[EDGE_LEFT]
      const childMarginTop = child._margin[EDGE_TOP]
      const childMarginRight = child._margin[EDGE_RIGHT]
      const childMarginBottom = child._margin[EDGE_BOTTOM]

      const marginMainStart = isRow ? childMarginLeft : childMarginTop
      const marginMainEnd = isRow ? childMarginRight : childMarginBottom
      const marginCrossStart = isRow ? childMarginTop : childMarginLeft
      const marginCrossEnd = isRow ? childMarginBottom : childMarginRight

      // Resolve child's flex basis
      let flexBasis: number | undefined
      if (child._flexBasis !== 'auto' && child._flexBasis !== undefined) {
        const resolved = resolveValue(child._flexBasis, isRow ? (containerWidth ?? 0) : (containerHeight ?? 0))
        if (resolved !== undefined) flexBasis = resolved
      }

      // If flex basis is auto, use the child's definite main size
      if (flexBasis === undefined) {
        const childMainDimValue = isRow ? child._width : child._height
        const parentMainDim = isRow ? containerWidth : containerHeight
        const resolved = resolveValue(childMainDimValue, parentMainDim ?? 0)
        if (resolved !== undefined) {
          flexBasis = resolved
        }
      }

      // If still undefined, we need to measure the child
      let measuredCrossSize: number | undefined
      if (flexBasis === undefined) {
        // Compute the child to figure out its intrinsic size
        const childAvailWidth = innerWidth !== undefined ? Math.max(0, innerWidth - childMarginLeft - childMarginRight) : NaN
        const childAvailHeight = innerHeight !== undefined ? Math.max(0, innerHeight - childMarginTop - childMarginBottom) : NaN

        child._computeLayout(
          isRow ? NaN : childAvailWidth,
          isRow ? childAvailHeight : NaN,
          containerWidth ?? NaN,
          containerHeight ?? NaN,
        )

        flexBasis = isRow ? child._layout.width : child._layout.height
        measuredCrossSize = isRow ? child._layout.height : child._layout.width
      }

      // Apply min/max to flex basis
      const childResolvedMinMain = isRow
        ? resolveValue(child._minWidth, containerWidth ?? 0)
        : resolveValue(child._minHeight, containerHeight ?? 0)
      const childResolvedMaxMain = isRow
        ? resolveValue(child._maxWidth, containerWidth ?? 0)
        : resolveValue(child._maxHeight, containerHeight ?? 0)

      flexBasis = clampValue(flexBasis, childResolvedMinMain, childResolvedMaxMain)

      childInfos.push({
        node: child,
        mainSize: flexBasis,
        crossSize: 0,
        marginMainStart,
        marginMainEnd,
        marginCrossStart,
        marginCrossEnd,
        flexBasis,
        flexGrow: child._flexGrow,
        flexShrink: child._flexShrink,
        frozen: false,
        targetMainSize: flexBasis,
        measuredCrossSize,
      })
    }

    // Phase 2: Wrap into lines
    interface FlexLine {
      items: FlexChildInfo[]
      mainSize: number
      crossSize: number
    }

    const lines: FlexLine[] = []

    if (!isWrap || mainSize === undefined) {
      // No wrap: all items on one line
      const totalMain = childInfos.reduce((sum, info) => sum + info.flexBasis + info.marginMainStart + info.marginMainEnd, 0)
      lines.push({ items: childInfos, mainSize: totalMain, crossSize: 0 })
    } else {
      // Wrap mode
      let currentLine: FlexChildInfo[] = []
      let currentLineMain = 0

      for (const info of childInfos) {
        const itemMainOuter = info.flexBasis + info.marginMainStart + info.marginMainEnd
        if (currentLine.length > 0 && currentLineMain + itemMainOuter > mainSize + 0.5) {
          lines.push({ items: currentLine, mainSize: currentLineMain, crossSize: 0 })
          currentLine = []
          currentLineMain = 0
        }
        currentLine.push(info)
        currentLineMain += itemMainOuter
      }
      if (currentLine.length > 0) {
        lines.push({ items: currentLine, mainSize: currentLineMain, crossSize: 0 })
      }
    }

    if (lines.length === 0) {
      lines.push({ items: [], mainSize: 0, crossSize: 0 })
    }

    // Phase 3: Resolve flex sizes for each line
    for (const line of lines) {
      const { items } = line
      if (items.length === 0) continue

      const usedMain = items.reduce((sum, info) => sum + info.flexBasis + info.marginMainStart + info.marginMainEnd, 0)
      const freeSpace = (mainSize ?? 0) - usedMain

      if (mainSize !== undefined && freeSpace > 0) {
        // Grow
        const totalGrow = items.reduce((sum, info) => sum + info.flexGrow, 0)
        if (totalGrow > 0) {
          for (const info of items) {
            if (info.flexGrow > 0) {
              const growAmount = (info.flexGrow / totalGrow) * freeSpace
              info.targetMainSize = info.flexBasis + growAmount

              const childResolvedMinMain = isRow
                ? resolveValue(info.node._minWidth, containerWidth ?? 0)
                : resolveValue(info.node._minHeight, containerHeight ?? 0)
              const childResolvedMaxMain = isRow
                ? resolveValue(info.node._maxWidth, containerWidth ?? 0)
                : resolveValue(info.node._maxHeight, containerHeight ?? 0)
              info.targetMainSize = clampValue(info.targetMainSize, childResolvedMinMain, childResolvedMaxMain)
            } else {
              info.targetMainSize = info.flexBasis
            }
          }
        }
      } else if (mainSize !== undefined && freeSpace < 0) {
        // Shrink
        const totalShrinkScaled = items.reduce((sum, info) => sum + info.flexShrink * info.flexBasis, 0)
        if (totalShrinkScaled > 0) {
          for (const info of items) {
            if (info.flexShrink > 0) {
              const shrinkRatio = (info.flexShrink * info.flexBasis) / totalShrinkScaled
              info.targetMainSize = info.flexBasis + shrinkRatio * freeSpace // freeSpace is negative

              const childResolvedMinMain = isRow
                ? resolveValue(info.node._minWidth, containerWidth ?? 0)
                : resolveValue(info.node._minHeight, containerHeight ?? 0)
              const childResolvedMaxMain = isRow
                ? resolveValue(info.node._maxWidth, containerWidth ?? 0)
                : resolveValue(info.node._maxHeight, containerHeight ?? 0)
              info.targetMainSize = clampValue(info.targetMainSize, childResolvedMinMain, childResolvedMaxMain)
            } else {
              info.targetMainSize = info.flexBasis
            }
          }
        }
      }

      // Ensure non-negative
      for (const info of items) {
        info.targetMainSize = Math.max(0, info.targetMainSize)
        info.mainSize = info.targetMainSize
      }
    }

    // Phase 4: Compute cross sizes for each item (layout children with resolved main size)
    for (const line of lines) {
      for (const info of line.items) {
        const child = info.node
        const childWidth = isRow ? info.mainSize : undefined
        const childHeight = isRow ? undefined : info.mainSize

        // Resolve child cross size
        const childCrossDimValue = isRow ? child._height : child._width
        const parentCrossDim = isRow ? containerHeight : containerWidth
        const resolvedCross = resolveValue(childCrossDimValue, parentCrossDim ?? 0)

        // Determine alignSelf
        const alignSelf = child._alignSelf === ALIGN_AUTO ? this._alignItems : child._alignSelf

        // If stretch and cross not set, we'll handle stretch later
        const shouldStretch = alignSelf === ALIGN_STRETCH && resolvedCross === undefined

        // If we have a cached cross size from flex basis measurement and main size unchanged, reuse it
        if (info.measuredCrossSize !== undefined && info.mainSize === info.flexBasis && resolvedCross === undefined) {
          info.crossSize = info.measuredCrossSize
        } else {
          const cWidth = childWidth !== undefined
            ? childWidth
            : (resolvedCross !== undefined && !isRow ? resolvedCross : NaN)
          const cHeight = childHeight !== undefined
            ? childHeight
            : (resolvedCross !== undefined && isRow ? resolvedCross : NaN)

          child._computeLayout(
            cWidth,
            cHeight,
            containerWidth ?? NaN,
            containerHeight ?? NaN,
          )

          // Enforce the resolved main size from flex (grow/shrink)
          if (childWidth !== undefined) {
            child._layout.width = childWidth
          }
          if (childHeight !== undefined) {
            child._layout.height = childHeight
          }

          info.mainSize = isRow ? child._layout.width : child._layout.height
          info.crossSize = isRow ? child._layout.height : child._layout.width
        }

        // Track stretch flag for Phase 6
        // Don't stretch items with measure functions - their size is definite
        if (shouldStretch && !child._measureFunc) {
          (info as any)._shouldStretch = true
        }
      }

      // Compute line cross size
      line.crossSize = 0
      for (const info of line.items) {
        const outerCross = info.crossSize + info.marginCrossStart + info.marginCrossEnd
        line.crossSize = Math.max(line.crossSize, outerCross)
      }
    }

    // Phase 5: Determine container size
    let finalWidth: number
    let finalHeight: number

    if (resolvedWidth !== undefined) {
      finalWidth = resolvedWidth
    } else {
      // Compute from content
      if (isRow) {
        let maxLineMain = 0
        for (const line of lines) {
          let lineMain = paddingMainStart + paddingMainEnd
          for (const info of line.items) {
            lineMain += info.mainSize + info.marginMainStart + info.marginMainEnd
          }
          maxLineMain = Math.max(maxLineMain, lineMain)
        }
        finalWidth = maxLineMain
      } else {
        let totalCross = paddingCrossStart + paddingCrossEnd
        for (const line of lines) {
          totalCross += line.crossSize
        }
        finalWidth = totalCross
      }
    }

    if (resolvedHeight !== undefined) {
      finalHeight = resolvedHeight
    } else {
      if (!isRow) {
        let maxLineMain = 0
        for (const line of lines) {
          let lineMain = paddingMainStart + paddingMainEnd
          for (const info of line.items) {
            lineMain += info.mainSize + info.marginMainStart + info.marginMainEnd
          }
          maxLineMain = Math.max(maxLineMain, lineMain)
        }
        finalHeight = maxLineMain
      } else {
        let totalCross = paddingCrossStart + paddingCrossEnd
        for (const line of lines) {
          totalCross += line.crossSize
        }
        finalHeight = totalCross
      }
    }

    // Apply min/max constraints
    finalWidth = applyMinMax(finalWidth, resolvedMinWidth, resolvedMaxWidth) ?? finalWidth
    finalHeight = applyMinMax(finalHeight, resolvedMinHeight, resolvedMaxHeight) ?? finalHeight

    this._layout.width = finalWidth
    this._layout.height = finalHeight

    const innerMainSize = isRow
      ? finalWidth - paddingLeft - paddingRight
      : finalHeight - paddingTop - paddingBottom
    const innerCrossSize = isRow
      ? finalHeight - paddingTop - paddingBottom
      : finalWidth - paddingLeft - paddingRight

    // Per CSS spec: if single-line and container has definite cross size,
    // the line's cross size is the container's inner cross size
    if (lines.length === 1 && innerCrossSize > 0) {
      lines[0].crossSize = Math.max(lines[0].crossSize, innerCrossSize)
    }

    // Phase 6: Apply stretch to items that need it
    for (const line of lines) {
      for (const info of line.items) {
        if ((info as any)._shouldStretch) {
          const stretchedCross = Math.max(0, line.crossSize - info.marginCrossStart - info.marginCrossEnd)
          if (stretchedCross > info.crossSize) {
            const child = info.node
            // Set the child's cross dimension directly to the stretched size
            if (isRow) {
              child._layout.height = stretchedCross
            } else {
              child._layout.width = stretchedCross
            }
            info.crossSize = stretchedCross
          }
        }
      }
    }

    // Phase 7: Position items along main axis and cross axis
    // First, handle align-content for multi-line containers
    let crossOffset = isRow ? paddingTop : paddingLeft
    const totalLineCross = lines.reduce((sum, line) => sum + line.crossSize, 0)
    const freeCrossSpace = innerCrossSize - totalLineCross
    let lineCrossSpacing = 0
    let linesCrossStart = crossOffset

    if (lines.length > 1 && freeCrossSpace > 0) {
      switch (this._alignContent) {
        case ALIGN_FLEX_START:
          break
        case ALIGN_FLEX_END:
          linesCrossStart += freeCrossSpace
          break
        case ALIGN_CENTER:
          linesCrossStart += freeCrossSpace / 2
          break
        case ALIGN_SPACE_BETWEEN:
          if (lines.length > 1) {
            lineCrossSpacing = freeCrossSpace / (lines.length - 1)
          }
          break
        case ALIGN_SPACE_AROUND:
          lineCrossSpacing = freeCrossSpace / lines.length
          linesCrossStart += lineCrossSpacing / 2
          break
        case ALIGN_STRETCH:
          {
            const extraPerLine = freeCrossSpace / lines.length
            for (const line of lines) {
              line.crossSize += extraPerLine
            }
          }
          break
      }
    }

    crossOffset = linesCrossStart

    const orderedLines = isWrapReverse ? [...lines].reverse() : lines
    // For wrap-reverse, we need to compute positions from the opposite end
    if (isWrapReverse) {
      crossOffset = (isRow ? paddingTop : paddingLeft) + innerCrossSize
      for (const line of orderedLines) {
        crossOffset -= line.crossSize
      }
    }

    for (const line of orderedLines) {
      const { items } = line

      // Compute remaining space on main axis after flex resolution
      let usedMain = 0
      for (const info of items) {
        usedMain += info.mainSize + info.marginMainStart + info.marginMainEnd
      }
      const freeMainSpace = Math.max(0, innerMainSize - usedMain)

      // Apply justifyContent
      let mainOffset: number
      let mainSpacing = 0

      const orderedItems = isReverse ? [...items].reverse() : items

      if (isReverse) {
        // For reverse directions, start from the end
        mainOffset = (isRow ? paddingLeft : paddingTop) + innerMainSize - usedMain

        switch (this._justifyContent) {
          case JUSTIFY_FLEX_START:
            mainOffset = (isRow ? paddingLeft : paddingTop) + freeMainSpace
            break
          case JUSTIFY_FLEX_END:
            mainOffset = isRow ? paddingLeft : paddingTop
            break
          case JUSTIFY_CENTER:
            mainOffset = (isRow ? paddingLeft : paddingTop) + freeMainSpace / 2
            break
          case JUSTIFY_SPACE_BETWEEN:
            if (orderedItems.length > 1) {
              mainSpacing = freeMainSpace / (orderedItems.length - 1)
            }
            mainOffset = isRow ? paddingLeft : paddingTop
            break
          case JUSTIFY_SPACE_AROUND:
            if (orderedItems.length > 0) {
              mainSpacing = freeMainSpace / orderedItems.length
              mainOffset = (isRow ? paddingLeft : paddingTop) + mainSpacing / 2
            }
            break
          case JUSTIFY_SPACE_EVENLY:
            if (orderedItems.length > 0) {
              mainSpacing = freeMainSpace / (orderedItems.length + 1)
              mainOffset = (isRow ? paddingLeft : paddingTop) + mainSpacing
            }
            break
        }
      } else {
        mainOffset = isRow ? paddingLeft : paddingTop

        switch (this._justifyContent) {
          case JUSTIFY_FLEX_START:
            break
          case JUSTIFY_FLEX_END:
            mainOffset += freeMainSpace
            break
          case JUSTIFY_CENTER:
            mainOffset += freeMainSpace / 2
            break
          case JUSTIFY_SPACE_BETWEEN:
            if (orderedItems.length > 1) {
              mainSpacing = freeMainSpace / (orderedItems.length - 1)
            }
            break
          case JUSTIFY_SPACE_AROUND:
            if (orderedItems.length > 0) {
              mainSpacing = freeMainSpace / orderedItems.length
              mainOffset += mainSpacing / 2
            }
            break
          case JUSTIFY_SPACE_EVENLY:
            if (orderedItems.length > 0) {
              mainSpacing = freeMainSpace / (orderedItems.length + 1)
              mainOffset += mainSpacing
            }
            break
        }
      }

      for (const info of orderedItems) {
        mainOffset += info.marginMainStart

        const child = info.node
        const childMainPos = mainOffset
        let childCrossPos: number

        // Align items along cross axis
        const alignSelf = child._alignSelf === ALIGN_AUTO ? this._alignItems : child._alignSelf

        switch (alignSelf) {
          case ALIGN_FLEX_START:
            childCrossPos = crossOffset + info.marginCrossStart
            break
          case ALIGN_FLEX_END:
            childCrossPos = crossOffset + line.crossSize - info.crossSize - info.marginCrossEnd
            break
          case ALIGN_CENTER:
            childCrossPos = crossOffset + (line.crossSize - info.crossSize - info.marginCrossStart - info.marginCrossEnd) / 2 + info.marginCrossStart
            break
          case ALIGN_STRETCH:
            childCrossPos = crossOffset + info.marginCrossStart
            break
          case ALIGN_BASELINE:
            // For simplicity, treat baseline same as flex-start
            childCrossPos = crossOffset + info.marginCrossStart
            break
          default:
            childCrossPos = crossOffset + info.marginCrossStart
            break
        }

        if (isRow) {
          child._layout.left = childMainPos
          child._layout.top = childCrossPos
        } else {
          child._layout.left = childCrossPos
          child._layout.top = childMainPos
        }

        child._layout.right = 0
        child._layout.bottom = 0

        mainOffset += info.mainSize + info.marginMainEnd + mainSpacing
      }

      crossOffset += line.crossSize + lineCrossSpacing
    }

    // Phase 8: Position absolute children
    for (const child of absoluteChildren) {
      // Resolve child dimensions
      const childResolvedWidth = resolveValue(child._width, finalWidth)
      const childResolvedHeight = resolveValue(child._height, finalHeight)

      const childAvailWidth = childResolvedWidth ?? (finalWidth - paddingLeft - paddingRight - child._margin[EDGE_LEFT] - child._margin[EDGE_RIGHT])
      const childAvailHeight = childResolvedHeight ?? (finalHeight - paddingTop - paddingBottom - child._margin[EDGE_TOP] - child._margin[EDGE_BOTTOM])

      child._computeLayout(
        childAvailWidth,
        childAvailHeight,
        finalWidth,
        finalHeight,
      )

      // Position based on set position properties
      let left = child._position[EDGE_LEFT]
      let top = child._position[EDGE_TOP]
      const right = child._position[EDGE_RIGHT]
      const bottom = child._position[EDGE_BOTTOM]

      if (left === undefined && right !== undefined) {
        left = finalWidth - child._layout.width - right - child._margin[EDGE_RIGHT]
      }
      if (top === undefined && bottom !== undefined) {
        top = finalHeight - child._layout.height - bottom - child._margin[EDGE_BOTTOM]
      }

      child._layout.left = (left ?? paddingLeft) + child._margin[EDGE_LEFT]
      child._layout.top = (top ?? paddingTop) + child._margin[EDGE_TOP]
      child._layout.right = 0
      child._layout.bottom = 0
    }

    // Apply position offsets for relative positioning
    for (const child of flexChildren) {
      if (child._positionType === POSITION_TYPE_RELATIVE) {
        if (child._position[EDGE_LEFT] !== undefined) {
          child._layout.left += child._position[EDGE_LEFT]!
        }
        if (child._position[EDGE_TOP] !== undefined) {
          child._layout.top += child._position[EDGE_TOP]!
        }
        if (child._position[EDGE_RIGHT] !== undefined) {
          child._layout.left -= child._position[EDGE_RIGHT]!
        }
        if (child._position[EDGE_BOTTOM] !== undefined) {
          child._layout.top -= child._position[EDGE_BOTTOM]!
        }
      }
    }
  }
}

// ---- Utilities ----

function clampValue(value: number, min: number | undefined, max: number | undefined): number {
  let result = value
  if (min !== undefined) result = Math.max(result, min)
  if (max !== undefined) result = Math.min(result, max)
  return result
}

function applyMinMax(value: number | undefined, min: number | undefined, max: number | undefined): number | undefined {
  if (value === undefined) return undefined
  return clampValue(value, min, max)
}

function sameValue(a: number, b: number): boolean {
  if (isNaN(a) && isNaN(b)) return true
  return a === b
}
