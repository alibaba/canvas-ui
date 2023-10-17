import {
  RenderCircle,
  RenderFlex,
  RenderImage,
  RenderObject,
  RenderRect,
  RenderRRect,
  RenderScrollView,
  RenderShape,
  RenderText,
  RenderChunk,
  RenderView,
  StyleProps,
  RenderPath
} from '@canvas-ui/core'
import type {
  Key,
  ReactElement,
  ReactNode,
  Ref
} from 'react'

export type { StyleProps } from '@canvas-ui/core'

type BaseProps<E, P> = {
  key?: Key
  ref?: Ref<E>
  children?: ReactNode
} & P

type RenderObjectProps = {
  id?: RenderObject['id']
  style?: StyleProps
  size?: RenderObject['size']
  offset?: RenderObject['offset']
  viewport?: RenderObject['viewport']
  hidden?: RenderObject['hidden']
  hitTestDisabled?: RenderObject['hitTestDisabled']
  hitTestSelfDisabled?: RenderObject['hitTestSelfDisabled']
  repaintBoundary?: RenderObject['repaintBoundary']
  onPointerMove?: RenderObject['onPointerMove']
  onPointerOver?: RenderObject['onPointerOver']
  onPointerEnter?: RenderObject['onPointerEnter']
  onPointerDown?: RenderObject['onPointerDown']
  onPointerUp?: RenderObject['onPointerUp']
  onPointerOut?: RenderObject['onPointerOut']
  onPointerLeave?: RenderObject['onPointerLeave']
  onWheel?: RenderObject['onWheelCapture']
  onPointerMoveCapture?: RenderObject['onPointerMoveCapture']
  onPointerOverCapture?: RenderObject['onPointerOverCapture']
  onPointerEnterCapture?: RenderObject['onPointerEnterCapture']
  onPointerDownCapture?: RenderObject['onPointerDownCapture']
  onPointerUpCapture?: RenderObject['onPointerUpCapture']
  onPointerOutCapture?: RenderObject['onPointerOutCapture']
  onPointerLeaveCapture?: RenderObject['onPointerLeaveCapture']
  onWheelCapture?: RenderObject['onWheelCapture']
  onPaint?: RenderObject['onPaint']
}

type ShapeProps = {
  fill?: RenderShape['fill']
  stroke?: RenderShape['stroke']
  strokeWidth?: RenderShape['strokeWidth']
}

export type ViewProps = RenderObjectProps

export type ChunkProps = ViewProps & {
  isOffstage?: RenderChunk['isOffstage']
}

export type FlexProps = RenderObjectProps

export type CircleProps = RenderObjectProps & ShapeProps & {
  radius?: RenderCircle['radius']
}

export type RectProps = RenderObjectProps & ShapeProps

export type RRectProps = RenderObjectProps & ShapeProps & {
  rx?: RenderRRect['rx']
  ry?: RenderRRect['ry']
}

export type PathProps = RenderObjectProps & ShapeProps & {
  hitTestStrokeWidth?: RenderPath['hitTestStrokeWidth']
  path?: RenderPath['path']
  pathBounds?: RenderPath['pathBounds']
  unstable_rotation?: RenderPath['unstable_rotation']
  unstable_transformOrigin?: RenderPath['unstable_transformOrigin']
}

export type ScrollViewProps = RenderObjectProps & {
  scrollAxis?: RenderScrollView['scrollAxis']
  scrollbar?: RenderScrollView['scrollbar']
  scrollBounds?: RenderScrollView['scrollBounds']
  scrollOffset?: RenderScrollView['scrollOffset']
  scrollSize?: RenderScrollView['scrollSize']
  scrollLeft?: RenderScrollView['scrollLeft']
  scrollTop?: RenderScrollView['scrollTop']
  onScroll?: RenderScrollView['onScroll']
}

export type ImageProps = RenderObjectProps & {
  src?: RenderImage['src']
  image?: RenderImage['image']
  crossOrigin?: RenderImage['crossOrigin']
}

export type TextProps = RenderObjectProps

export function ElementOf<E, P, T extends string>(type: T): (props: BaseProps<E, P>) => ReactElement<P, T> {
  return type as any
}

export type View = RenderView
export const View = ElementOf<View, ViewProps, 'View'>('View')

export type Chunk = RenderChunk
export const Chunk = ElementOf<Chunk, ChunkProps, 'Chunk'>('Chunk')

export type Flex = RenderFlex
export const Flex = ElementOf<Flex, FlexProps, 'Flex'>('Flex')

export type Circle = RenderCircle
export const Circle = ElementOf<Circle, CircleProps, 'Circle'>('Circle')

export type Rect = RenderRect
export const Rect = ElementOf<Rect, RectProps, 'Rect'>('Rect')

export type RRect = RenderRRect
export const RRect = ElementOf<RRect, RRectProps, 'RRect'>('RRect')

export type Path = RenderPath
export const Path = ElementOf<Path, PathProps, 'Path'>('Path')


export type ScrollView = RenderScrollView
export const ScrollView = ElementOf<ScrollView, ScrollViewProps, 'ScrollView'>('ScrollView')

export type Image = RenderImage
export const Image = ElementOf<Image, ImageProps, 'Image'>('Image')

export type Text = RenderText
export const Text = ElementOf<Text, TextProps, 'Text'>('Text')
