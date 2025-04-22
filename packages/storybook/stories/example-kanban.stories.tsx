import { Log, ScrollAxis, ScrollBounds } from '@canvas-ui/core'
import { Canvas, Flex, ScrollView, Text, useCanvasState } from '@canvas-ui/react'
import type { StoryObj } from '@storybook/react'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { CardListSchema, CardSchema, data } from './example-kanban.data'

type BoardProps = {
  data: CardListSchema[]
}

type CardListProps = {
  id: string
  defalutCards: CardSchema[]
  width: number
}

type CardProps = {
  id: string
  text: string
  index: number
  width: number
  onPointerDown: (index: number) => void
}

const Card: FC<CardProps> = props => {
  const { id, text, index, width, onPointerDown } = props
  const [style, setStyle] = useState({
    width,
    paddingLeft: 8,
    paddingTop: 8,
    paddingRight: 8,
    paddingBottom: 8,
    marginBottom: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    boxShadow: '0 1px 2px rgb(0 0 0 / 10%)',
    cursor: 'pointer',
  })

  const handlePointerOut = useCallback(
    () => {
      setStyle(pre => {
        return {
          ...pre,
          borderColor: undefined,
          borderWidth: undefined
        }
      })
    },
    [],
  )
  const handlePointerOver = useCallback(
    () => {
      setStyle(pre => {
        return {
          ...pre,
          borderColor: '#1B9AEE',
          borderWidth: 1
        }
      })
    },
    [],
  )
  const handlePointerDown = useCallback(
    () => {
      onPointerDown(index)
    },
    [onPointerDown, index],
  )

  return (
    <Flex
      id={id}
      style={style}
      onPointerOut={handlePointerOut}
      onPointerOver={handlePointerOver}
      onPointerDown={handlePointerDown}
    >
      <Text style={{ color: '#383838', fontSize: 14, maxLines: 3 }}>
        {text}
      </Text>
    </Flex>
  )
}

const CardList: FC<CardListProps> = props => {
  const { id, defalutCards, width } = props
  const [cards, setCards] = useState(defalutCards)

  const handlePointerDown = useCallback(
    (index: number) => {
      const nodeId = id + '-flex' + '-' + cards.length
      cards.splice(index + 1, 0, {
        text: `任务 ${nodeId}`.repeat(Math.ceil(Math.random() * 20)),
        id: id + '-flex' + '-' + cards.length
      })
      setCards([...cards])
    },
    [cards, id],
  )

  const content = cards.map((item, index) => {
    return (
      <Card
        key={item.id}
        id={item.id}
        text={item.text}
        index={index}
        width={width}
        onPointerDown={handlePointerDown}
      />
    )
  })

  return (
    <ScrollView
      id={id}
      style={{ width: 220, height: '100%' }}
      scrollBounds={ScrollBounds.Fit}
      scrollAxis={ScrollAxis.Vertical}
    >
      <Flex
        id={id + '-flex'}
        style={{ flexDirection: 'column', paddingLeft: 12, paddingTop: 12, paddingRight: 12 }}
      >
        {content}
      </Flex>
    </ScrollView>
  )
}

const Board: FC<BoardProps> = props => {
  const { data } = props

  const { width, height } = useCanvasState()

  const content = data.map(item => {
    return (
      <CardList key={item.id} id={item.id} defalutCards={item.cards} width={200} />
    )
  })

  return (
    <ScrollView
      id='board'
      style={{ width, height }}
      scrollBounds={ScrollBounds.Fit}
      scrollAxis={ScrollAxis.Horizontal}
    >
      <Flex id='list-container-wrapper' style={{ height, paddingTop: 12, paddingBottom: 12 }}>
        {content}
      </Flex>
    </ScrollView>
  )
}

export const KanbanTest: StoryObj<React.FC> = () => {
  useEffect(() => {
    Log.disableAll = true

    return () => {
      Log.disableAll = false
    }
  })

  return (
    <Canvas onReady={() => console.info('canvas ready')}>
      <Board data={data} />
    </Canvas>
  )
}

KanbanTest.storyName = 'Kanban'

export default {
  title: 'example/Kanban',
  component: KanbanTest,
  decorators: [(Story: React.ComponentType) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
