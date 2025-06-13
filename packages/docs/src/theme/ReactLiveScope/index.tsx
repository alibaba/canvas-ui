import React from 'react'
import * as CanvasUIReact from '@canvas-ui/react'
import * as CanvasUICore from '@canvas-ui/core'
import * as CanvasUIAnimation from '@canvas-ui/animation'

// Add react-live imports you need here
const ReactLiveScope: unknown = {
  React,
  ...React,
  ...CanvasUIReact,
  ...CanvasUICore,
  ...CanvasUIAnimation,
}

export default ReactLiveScope
