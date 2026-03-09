/**
 * Compatibility layer for Yoga API.
 * 
 * Previously imported from 'yoga-layout-prebuilt-fork' (asm.js).
 * Now provides the same API surface using a pure TypeScript flex layout engine.
 */
import {
  FlexNode,
  FlexConfig,
  MeasureFunction,
  FLEX_DIRECTION_ROW,
  FLEX_DIRECTION_ROW_REVERSE,
  FLEX_DIRECTION_COLUMN,
  FLEX_DIRECTION_COLUMN_REVERSE,
  ALIGN_AUTO,
  ALIGN_FLEX_START,
  ALIGN_FLEX_END,
  ALIGN_CENTER,
  ALIGN_STRETCH,
  ALIGN_BASELINE,
  ALIGN_SPACE_BETWEEN,
  ALIGN_SPACE_AROUND,
  JUSTIFY_FLEX_START,
  JUSTIFY_FLEX_END,
  JUSTIFY_CENTER,
  JUSTIFY_SPACE_BETWEEN,
  JUSTIFY_SPACE_AROUND,
  JUSTIFY_SPACE_EVENLY,
  WRAP_NO_WRAP,
  WRAP_WRAP,
  WRAP_WRAP_REVERSE,
  EDGE_LEFT,
  EDGE_TOP,
  EDGE_RIGHT,
  EDGE_BOTTOM,
  POSITION_TYPE_RELATIVE,
  POSITION_TYPE_ABSOLUTE,
  DISPLAY_FLEX,
  DISPLAY_NONE,
  OVERFLOW_VISIBLE,
  OVERFLOW_HIDDEN,
  OVERFLOW_SCROLL,
  MEASURE_MODE_UNDEFINED,
  MEASURE_MODE_EXACTLY,
  MEASURE_MODE_AT_MOST,
} from './flex-layout'
import type { Size } from '../math'
import type { StyleMap } from './style-map'

// Re-export types
export type YogaMeasureMode = typeof MEASURE_MODE_UNDEFINED | typeof MEASURE_MODE_EXACTLY | typeof MEASURE_MODE_AT_MOST

export type YogaMeasure = (
  width: number,
  widthMode: YogaMeasureMode,
  height: number,
  heightMode: YogaMeasureMode
) => Size

// Yoga-compatible API surface
export const Yoga = {
  Node: {
    create: FlexNode.create,
    createWithConfig: FlexNode.createWithConfig,
  },
  Config: {
    create: FlexConfig.create,
  },
  // Flex direction
  FLEX_DIRECTION_ROW,
  FLEX_DIRECTION_ROW_REVERSE,
  FLEX_DIRECTION_COLUMN,
  FLEX_DIRECTION_COLUMN_REVERSE,
  // Alignment
  ALIGN_AUTO,
  ALIGN_FLEX_START,
  ALIGN_FLEX_END,
  ALIGN_CENTER,
  ALIGN_STRETCH,
  ALIGN_BASELINE,
  ALIGN_SPACE_BETWEEN,
  ALIGN_SPACE_AROUND,
  // Justify content
  JUSTIFY_FLEX_START,
  JUSTIFY_FLEX_END,
  JUSTIFY_CENTER,
  JUSTIFY_SPACE_BETWEEN,
  JUSTIFY_SPACE_AROUND,
  JUSTIFY_SPACE_EVENLY,
  // Wrap
  WRAP_NO_WRAP,
  WRAP_WRAP,
  WRAP_WRAP_REVERSE,
  // Edge
  EDGE_LEFT,
  EDGE_TOP,
  EDGE_RIGHT,
  EDGE_BOTTOM,
  // Position type
  POSITION_TYPE_RELATIVE,
  POSITION_TYPE_ABSOLUTE,
  // Display
  DISPLAY_FLEX,
  DISPLAY_NONE,
  // Overflow
  OVERFLOW_VISIBLE,
  OVERFLOW_HIDDEN,
  OVERFLOW_SCROLL,
  // Measure modes
  MEASURE_MODE_UNDEFINED,
  MEASURE_MODE_EXACTLY,
  MEASURE_MODE_AT_MOST,
} as const

// Re-export FlexNode as YogaNode for type compatibility
export type YogaNode = FlexNode

// Type-safe style-to-yoga constant mappings
export type YogaFlexDirection = typeof FLEX_DIRECTION_ROW | typeof FLEX_DIRECTION_ROW_REVERSE | typeof FLEX_DIRECTION_COLUMN | typeof FLEX_DIRECTION_COLUMN_REVERSE
export type YogaFlexWrap = typeof WRAP_NO_WRAP | typeof WRAP_WRAP | typeof WRAP_WRAP_REVERSE
export type YogaJustifyContent = typeof JUSTIFY_FLEX_START | typeof JUSTIFY_FLEX_END | typeof JUSTIFY_CENTER | typeof JUSTIFY_SPACE_BETWEEN | typeof JUSTIFY_SPACE_AROUND | typeof JUSTIFY_SPACE_EVENLY
export type YogaAlign = typeof ALIGN_AUTO | typeof ALIGN_FLEX_START | typeof ALIGN_FLEX_END | typeof ALIGN_CENTER | typeof ALIGN_STRETCH | typeof ALIGN_BASELINE | typeof ALIGN_SPACE_BETWEEN | typeof ALIGN_SPACE_AROUND

const flexDirection: Record<NonNullable<StyleMap['flexDirection']>, YogaFlexDirection> = {
  'row': Yoga.FLEX_DIRECTION_ROW,
  'row-reverse': Yoga.FLEX_DIRECTION_ROW_REVERSE,
  'column': Yoga.FLEX_DIRECTION_COLUMN,
  'column-reverse': Yoga.FLEX_DIRECTION_COLUMN_REVERSE,
} as const

const alignContent: Record<NonNullable<StyleMap['alignContent']>, YogaAlign> = {
  'flex-start': Yoga.ALIGN_FLEX_START,
  'flex-end': Yoga.ALIGN_FLEX_END,
  'stretch': Yoga.ALIGN_STRETCH,
  'center': Yoga.ALIGN_CENTER,
  'space-between': Yoga.ALIGN_SPACE_BETWEEN,
  'space-around': Yoga.ALIGN_SPACE_AROUND,
} as const

const flexWrap: Record<NonNullable<StyleMap['flexWrap']>, YogaFlexWrap> = {
  'nowrap': Yoga.WRAP_NO_WRAP,
  'wrap': Yoga.WRAP_WRAP,
  'wrap-reverse': Yoga.WRAP_WRAP_REVERSE
} as const

const justifyContent: Record<NonNullable<StyleMap['justifyContent']>, YogaJustifyContent> = {
  'flex-start': Yoga.JUSTIFY_FLEX_START,
  'flex-end': Yoga.JUSTIFY_FLEX_END,
  'center': Yoga.JUSTIFY_CENTER,
  'space-between': Yoga.JUSTIFY_SPACE_BETWEEN,
  'space-around': Yoga.JUSTIFY_SPACE_AROUND,
  'space-evenly': Yoga.JUSTIFY_SPACE_EVENLY,
} as const

const alignItems: Record<NonNullable<StyleMap['alignItems']>, YogaAlign> = {
  'stretch': Yoga.ALIGN_STRETCH,
  'flex-start': Yoga.ALIGN_FLEX_START,
  'center': Yoga.ALIGN_CENTER,
  'flex-end': Yoga.ALIGN_FLEX_END,
  'baseline': Yoga.ALIGN_BASELINE,
} as const

const alignSelf: Record<NonNullable<StyleMap['alignSelf']>, YogaAlign> = {
  'auto': Yoga.ALIGN_AUTO,
  ...alignItems,
} as const

export const StyleToYoga = {
  flexDirection,
  flexWrap,
  justifyContent,
  alignItems,
  alignContent,
  alignSelf,
} as const

export { MeasureFunction }
