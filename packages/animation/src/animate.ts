import { Point, RenderObject, RenderShape, Size } from '@canvas-ui/core'
import { animate as impl, ValueAnimationTransition } from 'motion'

type MotionProps = {
  x?: number
  y?: number
  width?: number
  height?: number
  rotation?: number
}

type AnimatableProps = {
  offset?: RenderObject['offset']
  size?: RenderObject['size']
  rotation?: RenderShape['rotation']
}

export function animate(
  object: RenderObject,
  props: AnimatableProps,
  options: ValueAnimationTransition<AnimatableProps> = {},
) {
  const { initialProps, targetProps } = buildMotionProps(object, props)
  const onUpdate = () => {
    // motion will change initialProps in-place during animation
    applyMotionProps(object, initialProps)
    options.onUpdate?.(initialProps)
  }

  return impl(initialProps, targetProps, {
    ...options,
    onUpdate,
  })
}

function applyMotionProps(object: RenderObject, props: MotionProps) {
  let isParentDirty = false
  if (props.x !== undefined) {
    object._offset = Point.fromXY(props.x, props.y!)
    isParentDirty = true
  }
  if (props.width !== undefined) {
    object._size = Size.fromWH(props.width, props.height!)
    isParentDirty = true
  }
  if (isParentDirty) {
    object.parent?.markPaintDirty()
  }
  if (props.rotation !== undefined && object instanceof RenderShape) {
    object.rotation = props.rotation
  }
}

function buildMotionProps(object: RenderObject, props: AnimatableProps) {
  const initialProps: MotionProps = {}
  const targetProps: MotionProps = {}
  if (props.offset) {
    initialProps.x = object.offset.x
    initialProps.y = object.offset.y
    targetProps.x = props.offset.x
    targetProps.y = props.offset.y
  }
  if (props.size) {
    initialProps.width = object.size.width
    initialProps.height = object.size.height
    targetProps.width = object.size.width
    targetProps.height = object.size.height
  }
  if (typeof props.rotation === 'number' && object instanceof RenderShape) {
    initialProps.rotation = object.rotation
    targetProps.rotation = props.rotation
  }
  return {
    initialProps,
    targetProps,
  }
}
