import type { Shader } from '../canvas'
import type { StandardProperties } from 'csstype'
import { EventEmitter } from 'eventemitter3'
import { hasOwn } from '../utils'

type LayoutStyles = {
  display?: 'none'

  // flex child styles
  position?: 'relative' | 'absolute'
  flexGrow?: number
  flexShrink?: number
  flexBasis?: number | string
  alignSelf?: 'auto' | LayoutStyles['alignItems']

  // flex child sizes
  width?: number | string | 'auto'
  height?: number | string | 'auto'
  minWidth?: number | string | 'auto'
  minHeight?: number | string | 'auto'
  maxWidth?: number | string | 'auto'
  maxHeight?: number | string | 'auto'

  // flex child padding
  paddingTop?: number | string
  paddingRight?: number | string
  paddingBottom?: number | string
  paddingLeft?: number | string

  // flex child margin
  marginTop?: number | string
  marginRight?: number | string
  marginBottom?: number | string
  marginLeft?: number | string

  // flex child positions
  left?: number | string
  top?: number | string
  right?: number | string
  bottom?: number | string

  // flex container styles
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse'
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'
  alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline'
  alignContent?: 'flex-start' | 'flex-end' | 'stretch' | 'center' | 'space-between' | 'space-around'
}

type PaintStyles = {
  visibility?: 'visible' | 'hidden'
}

type TextStyles = {
  fontStyle?: StandardProperties['fontStyle']
  fontVariant?: StandardProperties['fontVariant']
  fontWeight?: StandardProperties['fontWeight']
  fontStretch?: StandardProperties['fontStretch']
  fontSize?: number
  lineHeight?: number
  fontFamily?: StandardProperties['fontFamily']
  font?: StandardProperties['font']
  color?: StandardProperties['color']
  maxLines?: number
  textAlign?: StandardProperties['textAlign']
}

type BoxDecorationStyles = {
  borderColor?: StandardProperties['color']
  borderImage?: Shader
  borderWidth?: number
  borderRadius?: number
  boxShadow?: StandardProperties['boxShadow']
  backgroundColor?: StandardProperties['color']
  backgroundImage?: Shader
}

type InteractiveStyles = {
  cursor?: StandardProperties['cursor']
}

export type StyleProps =
  & LayoutStyles
  & PaintStyles
  & InteractiveStyles
  & TextStyles
  & BoxDecorationStyles

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StyleMap
  extends StyleProps, Record<string, string | number | undefined | ((...args: any[]) => any)> { }

type ChangeEventTypes<T> = {
  [K in keyof T]-?: (value: T[K]) => void
}

export type StyleMapEventTypes = ChangeEventTypes<StyleProps>

export class StyleMap extends EventEmitter<StyleMapEventTypes> {

  constructor() {
    super()

    // 阻止这些属性被 Object.keys 枚举
    Object.defineProperties(this, {
      '_events': {
        enumerable: false,
        configurable: true,
      },
      '_eventsCount': {
        enumerable: false,
        configurable: true,
      }
    })

    return new Proxy(this, {
      set(
        target: any,
        styleName: string,
        styleValue: any,
      ) {
        if (target[styleName] !== styleValue) {
          (<any>target)[styleName] = styleValue
          target.emit(styleName, styleValue)
        }
        return true
      },
      deleteProperty(
        target: any,
        styleName: string,
      ) {
        delete target[styleName]
        target.emit(styleName, undefined)
        return true
      },
    })
  }

  has(styleName: keyof StyleProps): this is StyleMap & Required<Pick<StyleMap, keyof StyleProps>> {
    return hasOwn(this, styleName)
  }
}
