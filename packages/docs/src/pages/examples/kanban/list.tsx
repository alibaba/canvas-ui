import { ScrollBounds, ScrollAxis } from '@canvas-ui/core'
import { Flex, Text, ScrollView } from '@canvas-ui/react'
import React, { FC } from 'react'
import { Card, CardStyle } from './card'
import type { Task, Tasklist } from './types'

type Props = {
  tasklist: Tasklist
  tasks: Task[]
}

const ListStyle = {
  style: {
    width: CardStyle.style.width + 32,
    flexDirection: 'column',
  },
  title: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  titleText: {
    color: '#262626',
    fontSize: 26,
    fontWeight: 800,
    height: 26,
    maxLines: 1,
    paddingLeft: 24,
    flexGrow: 1,
  },
  countStyle: {
    paddingRight: 24,
    color: '#8C8C8C',
    fontSize: 18,
  },
  contentScrollerStyle: {
    width: CardStyle.style.width + 32,
    marginBottom: 24,
    flexGrow: 1,
  },
  contentStyle: {
    flexDirection: 'column',
    paddingLeft: 16,
    paddingRight: 16,
  }
} as const

export const List: FC<Props> = ({
  tasklist,
  tasks,
}) => {

  const cards = tasks.map(it => {
    return (
      <Card
        key={it.id}
        task={it}
      />
    )
  })

  return (
    <Flex style={ListStyle.style} >
      <Flex style={ListStyle.title} >
        <Text style={ListStyle.titleText}>
          {tasklist.name}
        </Text>
        <Text style={ListStyle.countStyle}>
          {tasks.length}
        </Text>
      </Flex>
      <ScrollView
        id={tasklist.id}
        style={ListStyle.contentScrollerStyle}
        scrollBounds={ScrollBounds.Fit}
        scrollAxis={ScrollAxis.Vertical}
      >
        <Flex style={ListStyle.contentStyle} >
          {cards}
        </Flex>
      </ScrollView>
    </Flex>

  )
}
