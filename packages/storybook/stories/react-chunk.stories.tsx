/* eslint-disable @typescript-eslint/no-unused-vars */
import { DebugFlags, Size, StyleProps, SyntheticPointerEvent } from '@canvas-ui/core'
import { Canvas, Chunk, Flex, ScrollView, Text } from '@canvas-ui/react'
import type { Story } from '@storybook/react'
import React, { FC, useEffect, useState } from 'react'

const rowSize = Size.fromWH(200, 24)

type RowSchema = {
  id: number
  content: string
}

type RowProps = {
  row: RowSchema
  top: number
  onInsertAfter?: (row: RowSchema) => void
  onRemove?: (row: RowSchema) => void
}

const Row: FC<RowProps> = ({
  row,
  top,
  onInsertAfter,
  onRemove,
}) => {
  const style: StyleProps = {
    top,
    width: rowSize.width,
    height: rowSize.height,
  }

  const handlePointerUp = (event: SyntheticPointerEvent<Flex>) => {
    if (event.target?.id === 'insertAfter') {
      onInsertAfter?.(row)
    } else if (event.target?.id === 'remove') {
      onRemove?.(row)
    }
  }

  return (
    <Flex id={row.id} style={style} onPointerUp={handlePointerUp}>
      <Text id="insertAfter" style={{ cursor: 'pointer' }}>[+]</Text>
      <Text style={{ marginLeft: 8, marginRight: 8, flexGrow: 1 }}>{row.content}</Text>
      <Text id="remove" style={{ cursor: 'pointer' }}>[-]</Text>
    </Flex>
  )
}

export const ChunkTest: Story = () => {

  useEffect(() => {
    DebugFlags.set(
      DebugFlags.NodeBounds
      | DebugFlags.LayerBounds
      | DebugFlags.RasterCacheWaterMark
    )
    return () => {
      DebugFlags.set(0)
    }
  }, [])


  const [createRow] = useState(() => {
    let nextRowId = 0
    return (label = ''): RowSchema => {
      const id = nextRowId++
      return {
        id,
        content: `${label}:${id}`,
      }
    }
  })

  const [rows, setRows] = useState<RowSchema[]>(() => {
    const INITIAL_COUNT = 10
    return Array.from(new Array(INITIAL_COUNT).keys(), () => {
      return createRow('initial')
    })
  })

  const [actions] = useState(() => {
    return {
      append() {
        setRows(prev => {
          const row = createRow('append')
          return [...prev, row]
        })
      },
      prepend() {
        setRows(prev => {
          const row = createRow('prepend')
          return [row, ...prev]
        })
      },
      insertBefore() {
        setRows(prev => {
          const row = createRow('insertBefore')
          const next = prev.slice()
          const pos = 3
          next.splice(pos, 0, row)
          return next
        })
      },
      removeFirst() {
        setRows(prev => {
          const next = prev.slice()
          next.shift()
          return next
        })
      },
      removeLast() {
        setRows(prev => {
          const next = prev.slice()
          next.pop()
          return next
        })
      },
      removeAt() {
        setRows(prev => {
          const pos = 4
          const next = prev.slice()
          next.splice(pos, 1)
          return next
        })
      },
      insertAfter(row: RowSchema) {
        setRows(prev => {
          const pos = prev.findIndex(it => it === row)
          if (pos !== -1) {
            const newRow = createRow(`insertAfter(${row.id})`)
            const next = prev.slice()
            next.splice(pos + 1, 0, newRow)
            return next
          }
          return prev
        })
      },
      remove(row: RowSchema) {
        setRows(prev => {
          const pos = prev.findIndex(it => it === row)
          if (pos !== -1) {
            const next = prev.slice()
            next.splice(pos, 1)
            return next
          }
          return prev
        })
      }
    }
  })

  const nodes = rows.map((it, index) => {
    return (
      <Row key={it.id} row={it} top={index * rowSize.height} onInsertAfter={actions.insertAfter} onRemove={actions.remove} />
    )
  })

  return (
    <div style={{ height: '100%' }}>
      <div style={{ marginBottom: 8 }}>
        <button onClick={actions.append}>append</button>
        <button onClick={actions.prepend}>prepend</button>
        <button onClick={actions.insertBefore}>insertBefore(4)</button>
        <br />
        <button onClick={actions.removeFirst}>removeFirst</button>
        <button onClick={actions.removeLast}>removeLast</button>
        <button onClick={actions.removeAt}>removeAt(4)</button>
      </div>
      <Canvas>
        <ScrollView style={{ width: rowSize.width, height: 250 }}>
          <Chunk style={{ height: rows.length * rowSize.height, width: rowSize.width }}>
            {nodes}
          </Chunk>
        </ScrollView>
      </Canvas>
    </div>
  )
}

ChunkTest.storyName = 'Chunk'

export default {
  title: 'react',
  component: ChunkTest,
  decorators: [(Story: Story) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
