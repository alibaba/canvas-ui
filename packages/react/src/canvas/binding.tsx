import { createElement, RenderCanvas } from '@canvas-ui/core'
import React, { ReactNode, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { render } from '../renderer'
import { CanvasState, CanvasStateContext } from './context'

export type UseBindingOptions = {
  binding: RenderCanvas
  left: number
  top: number
  width: number
  height: number
  onReady?: () => void
  children: ReactNode
}

export function useBinding({
  binding,
  left,
  top,
  width,
  height,
  onReady,
  children,
}: UseBindingOptions) {

  const [rootView] = useState(() => {
    return createElement('View')
  })

  useLayoutEffect(() => {
    binding.child = rootView
    return () => {
      binding.child = undefined
    }
  }, [binding, rootView])

  const state: CanvasState = useMemo(() => {
    const nextState = {
      left,
      top,
      width,
      height,
      binding,
      rootView,
    }
    return nextState
  }, [
    left,
    top,
    width,
    height,
    binding,
    rootView,
  ])

  const [Canvas] = useState(() => {
    return function Canvas(props: { children: ReactNode }) {
      useEffect(() => {
        onReady?.()
      }, [])

      // see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/18051
      return props.children as JSX.Element
    }
  })

  useLayoutEffect(() => {
    render(
      <Canvas>
        <CanvasStateContext.Provider value={state}>
          {children}
        </CanvasStateContext.Provider>
      </Canvas>,
      rootView,
    )
  }, [
    state,
    children,
    Canvas,
    rootView,
  ])

}
