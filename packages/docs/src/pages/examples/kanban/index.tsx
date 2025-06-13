import React, { useState } from 'react'
import { App } from './app'

export default () => {

  const [app] = useState(() => {
    return new App()
  })

  return (
    <app.UI />
  )
}
