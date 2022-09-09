import React from 'react'

// Add react-live imports you need here
const ReactLiveScope: unknown = {
  React,
  ...React,
  importCanvasUIPackages: () => {
    const CanvasUIReact = require('@canvas-ui/react')
    const CanvasUICore = require('@canvas-ui/core')
    const CanvasUIAnimation = require('@canvas-ui/animation')
    return {
      ...CanvasUIReact,
      ...CanvasUIAnimation,
      CanvasUICore,
    }
  },
  Assets: {
    cat1: require('@site/static/img/cat1.gif').default,
    cat2: require('@site/static/img/cat2.gif').default,
  },
}

export default ReactLiveScope
