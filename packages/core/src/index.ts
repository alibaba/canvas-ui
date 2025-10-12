export * from './canvas'
export * from './compositing'
export * from './debug'
export * from './error'
export * from './events'
export * from './foundation'
export * from './math'
export * from './platform'
export * from './rendering'
export * from './surface'

import {
  RenderCanvas,
  RenderCircle,
  RenderFlex,
  RenderImage,
  RenderObject,
  RenderRect,
  RenderRRect,
  RenderScrollView,
  RenderText,
  RenderView,
  RenderPath,
  RenderChunk,
} from './rendering'
import type { IFrameScheduler } from './platform'
import type { NativeEventBinding } from './events'

export type ElementType =
  | 'View'
  | 'Chunk'
  | 'Flex'
  | 'Canvas'
  | 'Rect'
  | 'RRect'
  | 'Circle'
  | 'Path'
  | 'ScrollView'
  | 'Text'
  | 'Image'

export function createElement(type: 'View'): RenderView
export function createElement(type: 'Chunk'): RenderChunk
export function createElement(type: 'Flex'): RenderFlex
export function createElement(type: 'Canvas', frameScheduler?: IFrameScheduler, binding?: NativeEventBinding): RenderCanvas
export function createElement(type: 'Rect'): RenderRect
export function createElement(type: 'RRect'): RenderRRect
export function createElement(type: 'Circle'): RenderCircle
export function createElement(type: 'Path'): RenderPath
export function createElement(type: 'ScrollView'): RenderScrollView
export function createElement(type: 'Text'): RenderText
export function createElement(type: 'Image'): RenderImage

// Workaround 重载函数不支持 Union 类型参数
// see https://github.com/microsoft/TypeScript/issues/14107
export function createElement(type: ElementType): RenderObject

export function createElement(type: ElementType, frameScheduler?: IFrameScheduler, binding?: NativeEventBinding): RenderObject {
  if (type === 'View') {
    return new RenderView()
  } if (type === 'Chunk') {
    return new RenderChunk()
  } else if (type === 'Flex') {
    return new RenderFlex()
  } else if (type === 'Canvas') {
    return new RenderCanvas(frameScheduler, binding)
  } else if (type === 'Rect') {
    return new RenderRect()
  } else if (type === 'RRect') {
    return new RenderRRect()
  } else if (type === 'Circle') {
    return new RenderCircle()
  } else if (type === 'Path') {
    return new RenderPath()
  } else if (type === 'ScrollView') {
    return new RenderScrollView()
  } else if (type === 'Text') {
    return new RenderText()
  } else if (type === 'Image') {
    return new RenderImage()
  }

  throw new Error(`没有该类型的 Element: ${type}`)
}
