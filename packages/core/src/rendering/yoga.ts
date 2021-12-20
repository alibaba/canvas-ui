import Yoga, {
  YogaAlign,
  YogaFlexDirection,
  YogaFlexWrap,
  YogaJustifyContent,
  YogaMeasureMode
} from 'yoga-layout-prebuilt-fork'
import type { Size } from '../math'
import type { StyleMap } from './style-map'

export { Yoga }

export type YogaMeasure = (
  width: number,
  widthMode: YogaMeasureMode,
  height: number,
  heightMode: YogaMeasureMode
) => Size

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
