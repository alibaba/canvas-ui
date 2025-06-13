import React from 'react'
import * as CanvasUIReact from '@canvas-ui/react'
import * as CanvasUICore from '@canvas-ui/core'
import * as CanvasUIAnimation from '@canvas-ui/animation'

// Add react-live imports you need here
const ReactLiveScope: unknown = {
  React,
  ...React,
  ...CanvasUIReact,
  ...CanvasUIAnimation,
  CanvasUICore,
  Assets: {
    cat1: require('@site/static/img/cat1.gif').default,
    cat2: require('@site/static/img/cat2.gif').default,
  },
}

export default ReactLiveScope
