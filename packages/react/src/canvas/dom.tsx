import { createElement, RenderCanvas, Size } from '@canvas-ui/core'
import React, { CSSProperties, memo, ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import useMeasure, { RectReadOnly } from 'react-use-measure'
import type { ViewProps } from '../elements'
import { useBinding, UseBindingOptions } from './binding'
import { DprObserver } from './dpr-observer'

const measureNodeStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
}

const canvasStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  letterSpacing: 'normal',
  position: 'absolute',
  userSelect: 'none',

  // OffscreenCanvas 渲染文本时，默认采用 `subpixel-antialiased` 且不能修改
  // 为了统一渲染效果，我们只能在 Surface 上也设置这个属性
  WebkitFontSmoothing: 'subpixel-antialiased',
}

/**
 * <Canvas> 的子节点是 glui 节点
 */
export type CanvasProps =
  & ViewProps
  & Pick<BindingProps, 'onReady'>
  & { children: ReactNode }

export const Canvas = memo(function Canvas({
  children,
  onReady,
}: CanvasProps) {
  const [bindMeasureNode, rect] = useMeasure({ scroll: true, debounce: { scroll: 50, resize: 1 / 60 } })
  const canvasElRef = useRef<HTMLCanvasElement | null>(null)
  const ready = useReady(rect)
  const binding = ready && canvasElRef.current && (
    <Binding
      el={canvasElRef.current}
      top={rect.top}
      left={rect.left}
      width={rect.width}
      height={rect.height}
      onReady={onReady}
    >
      {children}
    </Binding>
  )

  return (
    <div ref={bindMeasureNode} style={measureNodeStyle} className="glui-canvas">
      <canvas ref={canvasElRef} style={canvasStyle} />
      {binding}
    </div>
  )
})

function useReady(rect: Pick<RectReadOnly, 'width' | 'height'>) {
  const flag = useRef(false)
  const ready = useMemo(() => {
    return flag.current = (flag.current || (rect.width > 0 && rect.height > 0))
  }, [rect])
  return ready
}

function useDprObserver() {
  const [dpr, setDpr] = useState(() => {
    return self.devicePixelRatio
  })
  useEffect(() => {
    const observer = new DprObserver(setDpr)
    return () => {
      observer.disconnect()
    }
  }, [])
  return dpr
}

type BindingProps = Omit<UseBindingOptions, 'binding'> & {
  el: HTMLCanvasElement
}

function Binding({
  el,
  left,
  top,
  width,
  height,
  children,
}: BindingProps) {

  const bindingRef = useRef<RenderCanvas>(null)

  const [binding] = useState(() => {
    const binding = createElement('Canvas')
    binding.prepareInitialFrame()
    bindingRef.current = binding
    saveRoot(binding, true)
    return binding
  })

  useEffect(() => {
    return () => {
      saveRoot(binding, false)
    }
  }, [binding])

  const dpr = useDprObserver()

  useLayoutEffect(() => {
    binding.el = el
    binding.dpr = dpr
    if (el) {
      el.style.width = `${width}px`
      el.style.height = `${height}px`
    }
    binding.size = Size.fromWH(width, height)
  }, [
    binding,
    el,
    width,
    height,
    dpr,
  ])

  useBinding({
    binding,
    left,
    top,
    width,
    height,
    children,
  })

  return null
}

type Store = {
  canvasui?: {
    roots: Set<RenderCanvas>
  }
}

function saveRoot(root: RenderCanvas, save: boolean) {
  const store = window as unknown as Store
  if (!store.canvasui) {
    store.canvasui = {
      roots: new Set(),
    }
  }
  if (save) {
    store.canvasui.roots.add(root)
  } else {
    store.canvasui.roots.delete(root)
  }
}
