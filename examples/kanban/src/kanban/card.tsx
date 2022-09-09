import { Flex, Text } from '@canvas-ui/react'
import React from 'react'
import type { Task } from './types'

type Props = {
  task: Task
}

export const CardStyle = {
  style: {
    width: 280,
    paddingLeft: 14,
    paddingTop: 12,
    paddingRight: 14,
    paddingBottom: 14,
    marginBottom: 14,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    boxShadow: '0 1px 8px rgb(0 0 0 / 10%)',
    cursor: 'pointer',
  },

  textStyle: {
    color: '#595959',
    fontSize: 16,
    maxLines: 3,
  }

} as const

export const Card: React.FC<Props> = ({
  task,
}) => {
  const [style, setStyle] = React.useState(CardStyle)

  const hover = React.useMemo(() => {
    return {
      pointerover: () => {
        setStyle(prev => {
          return {
            ...prev,
            style: {
              ...prev.style,
              borderColor: '#1B9AEE',
              borderWidth: 2,
            }
          }
        })
      },
      pointerout: () => {
        setStyle(prev => {
          return {
            ...prev,
            style: {
              ...prev.style,
              borderColor: undefined,
              borderWidth: undefined,
            }
          }
        })
      }
    }
  }, [])

  return (
    <Flex
      id={task.id}
      style={style.style}
      onPointerOut={hover.pointerout}
      onPointerOver={hover.pointerover}
    >
      <Text style={style.textStyle}>
        {task.name}
      </Text>
    </Flex>
  )
}
