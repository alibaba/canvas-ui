
import React from 'react'
import { App } from './app'

export const Kanban: React.FC = () => {
  const app = React.useMemo(() => new App(), [])
  return (
    <app.UI />
  )
}
