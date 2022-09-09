import { ScrollAxis, ScrollBounds } from '@canvas-ui/core'
import { Flex, ScrollView, useCanvasState } from '@canvas-ui/react'
import { useApp } from './app'
import { List } from './list'
import { useObservable } from './use-observable'
import React from 'react'

export const Kanban: React.FC = () => {

  const app = useApp()

  const { width, height } = useCanvasState()


  const query = React.useMemo(() => {
    return app.query()
  }, [app])

  const state = useObservable(query)

  if (!state) {
    return null
  }

  const lists = state.map(it => {
    const { tasks, ...tasklist } = it
    return (
      <List
        key={it.id}
        tasklist={tasklist}
        tasks={tasks}
      />
    )
  })

  const kanbanStyle = {
    width,
    height,
  } as const

  const listsStyle = {
    height,
  } as const

  return (
    <ScrollView
      id='kanban'
      style={kanbanStyle}
      scrollBounds={ScrollBounds.Horizontal | ScrollBounds.Vertical}
      scrollAxis={ScrollAxis.Horizontal}
    >
      <Flex id='kanban-lists' style={listsStyle}>
        {lists}
      </Flex>
    </ScrollView>
  )
}
