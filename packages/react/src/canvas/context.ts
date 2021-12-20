import type { RenderCanvas } from '@canvas-ui/core'
import { createContext, useContext } from 'react'
import type { View } from '..'

export type CanvasState = {
  left: number
  top: number
  width: number
  height: number
  binding: RenderCanvas
  rootView: View
}

export const CanvasStateContext = createContext<CanvasState | null>(null)

export const useCanvasState = () => {
  const state = useContext(CanvasStateContext)
  if (!state) {
    throw new Error(`你只能在 '<Canvas>' 内部使用 'useCanvasState'`)
  }
  return state
}
