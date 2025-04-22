/* eslint-disable @typescript-eslint/no-unused-vars */
import { DebugFlags, Log, Point, Rect, ScrollAxis, StyleProps, SyntheticEvent, SyntheticPointerEvent } from '@canvas-ui/core'
import { Canvas, Chunk, Flex, ScrollView, Text, useCanvasState, View } from '@canvas-ui/react'
import { assert } from '@canvas-ui/assert'
import React, { createContext, FC, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Movie, MovieFields, MovieRepo } from './movie.repo'
import { StoryObj } from '@storybook/react/*'

type ScrollSync = {
  vertical: VerticalScrollSync
  horizontal: HorizontalScrollSync
}

const ScrollSyncContext = createContext<ScrollSync | null>(null)
const useScrollSyncContext = () => {
  const context = useContext(ScrollSyncContext)
  if (!context) {
    throw ''
  }
  return context
}

abstract class AbstractScrollSync {

  private nodes: ScrollView[] = []

  private handleScrollChange = (event: SyntheticEvent<ScrollView>) => {
    const source = event.target
    assert(source)
    const { scrollOffset } = source
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i]
      if (node !== source) {
        this.sync(node, scrollOffset)
      }
    }
  }

  protected abstract sync(target: ScrollView, scrollOffset: Point): void

  add(node: ScrollView, passive?: boolean) {
    if (!passive) {
      node.addEventListener('scroll', this.handleScrollChange)
    }
    this.nodes.push(node)
  }

  remove(node: ScrollView) {
    const pos = this.nodes.indexOf(node)
    assert(pos !== -1, '找不到节点')
    this.nodes.splice(pos, 1)
    node.removeEventListener('scroll', this.handleScrollChange)
  }
}

class VerticalScrollSync extends AbstractScrollSync {
  protected sync(target: ScrollView, scrollOffset: Point) {
    target._setScrollOffset(Point.fromXY(target.scrollLeft, scrollOffset.y))
  }
}

class HorizontalScrollSync extends AbstractScrollSync {
  protected sync(target: ScrollView, scrollOffset: Point) {
    target._setScrollOffset(Point.fromXY(scrollOffset.x, target.scrollLeft))
  }
}

export const TableTest: StoryObj<React.FC> = () => {

  useEffect(() => {
    // DebugFlags.set(DebugFlags.LayerBounds | DebugFlags.RasterCacheWaterMark)
    Log.disableAll = true
    return () => {
      DebugFlags.set(0)
      Log.disableAll = false
    }
  }, [])

  const [movies, setMovies] = useState<Movie[]>([])
  const [movieRepo] = useState(() => new MovieRepo())

  useEffect(() => {
    movieRepo.fetch(12000).then(setMovies)
  }, [movieRepo])

  const scrollSyncValue = useMemo(() => {
    return {
      vertical: new VerticalScrollSync(),
      horizontal: new HorizontalScrollSync(),
    }
  }, [])

  const deleteFirstRow = () => {
    setMovies(prev => {
      const next = prev.slice()
      next.shift()
      return next
    })
  }

  const deleteLastRow = () => {
    setMovies(prev => {
      const next = prev.slice()
      next.pop()
      return next
    })
  }

  return (
    <>
      <button onClick={deleteFirstRow}>Delete first row (slow)</button>
      <button onClick={deleteLastRow}>Delete last row</button>
      <div style={{ width: '100%', height: '100%' }}>
        <Canvas>
          <ScrollSyncContext.Provider value={scrollSyncValue}>
            <View>
              <View>
                <RightHead />
              </View>
              <View style={{ top: 40 }}>
                <Left rows={movies} />
                <Right rows={movies} />
              </View>
            </View>
          </ScrollSyncContext.Provider>
        </Canvas>
      </div>
    </>
  )
}

type LeftProps = {
  rows: Movie[]
}
const Left: FC<LeftProps> = ({ rows: data }) => {
  const { height } = useCanvasState()
  const scrollSync = useScrollSyncContext()

  const ref = React.useRef<ScrollView>(null)
  const setRef = (node: ScrollView) => {
    if (ref.current) {
      scrollSync.vertical.remove(ref.current)
    }
    ref.current = node
    if (ref.current) {
      scrollSync.vertical.add(ref.current)
    }
  }

  const content = data.map((it, index) => {
    return (
      <LeftRow seq={index} key={index} row={it} />
    )
  })

  return (
    <ScrollView
      ref={setRef}
      scrollAxis={ScrollAxis.Vertical}
      style={{ width: 348, height: height - 40 }}>
      <Flex style={{ flexDirection: 'column' }}>
        {content}
      </Flex>
    </ScrollView>
  )
}

type LeftRowProps = {
  seq: number
  row: Movie
}

const LeftRow: FC<LeftRowProps> = ({
  seq,
  row,
}) => {

  const style: StyleProps = {
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: 'white',
    width: 348,
    height: 30,
    justifyContent: 'flex-start',
    marginTop: -1,
  }

  return (
    <Flex style={style}>
      <Text style={{ width: 48 }}>
        {seq}
      </Text>
      <Text style={{ maxLines: 1, width: 100 }}>
        {row.电影ID}
      </Text>
      <Text style={{ maxLines: 1, width: 100 }}>
        {row.电影名}
      </Text>
      <Text style={{ maxLines: 1, width: 100 }}>
        {row.电影英文名}
      </Text>
    </Flex>
  )
}

type RightProps = {
  rows: Movie[]
}
const Right: FC<RightProps> = ({ rows }) => {
  const { width, height } = useCanvasState()
  const scrollSync = useScrollSyncContext()
  const ref = React.useRef<ScrollView>(null)
  const setRef = (node: ScrollView) => {
    if (ref.current) {
      scrollSync.vertical.remove(ref.current)
      scrollSync.horizontal.remove(ref.current)
    }
    ref.current = node
    if (ref.current) {
      scrollSync.vertical.add(ref.current)
      scrollSync.horizontal.add(ref.current)
    }
  }

  const content = rows.map((it, index) => {
    return (
      <RightRow key={index} seq={index} row={it} />
    )
  })

  const isOffstage = (viewport: Rect, childBounds: Rect) => {
    return childBounds.bottom < viewport.top || childBounds.top > viewport.bottom
  }

  return (
    <ScrollView
      ref={setRef}
      offset={Point.fromXY(348, 0)}
      style={{ width: width - 348, height: height - 40 }}>
      <Chunk isOffstage={isOffstage} style={{ width: (MovieFields.length - 4) * 150, height: -1 + rows.length * (30 - 1) }}>
        {content}
      </Chunk>
    </ScrollView>
  )
}

type RightRowProps = {
  seq: number
  row: Movie
}

const RightRow: FC<RightRowProps> = ({
  seq,
  row,
}) => {

  const ref = useRef<Flex | null>(null)

  const [lastPointerEvent, setLastPointerEvent] = useState<SyntheticPointerEvent<Flex> | null>(null)

  const style = useMemo<StyleProps>(() => {
    return {
      borderWidth: 1,
      borderColor: '#EFEFEF',
      backgroundColor: lastPointerEvent?.type === 'pointerover' ? 'rgba(255,165,0,0.2)' : 'white',
      height: 30,
      justifyContent: 'flex-start',
      top: -1 + seq * (30 - 1),
    }
  }, [seq, lastPointerEvent])

  const columns = MovieFields.slice(4).map(key => {
    return (
      <Text key={key} style={{ width: 150, maxLines: 1 }}>
        {row[key] || ''}
      </Text>
    )
  })

  return (
    <Flex ref={ref} style={style} onPointerOver={setLastPointerEvent} onPointerOut={setLastPointerEvent}>
      {columns}
    </Flex>
  )
}

const RightHead: FC = () => {

  const { width } = useCanvasState()

  const scrollSync = useScrollSyncContext()
  const ref = React.useRef<ScrollView>(null)
  const setRef = (node: ScrollView) => {
    if (ref.current) {
      scrollSync.horizontal.remove(ref.current)
    }
    ref.current = node
    if (ref.current) {
      scrollSync.horizontal.add(ref.current)
    }
  }

  const cells = MovieFields.slice(4).map(it => {
    return (
      <Text key={it} style={{ width: 150, maxLines: 1 }}>
        {it}
      </Text>
    )
  })

  const style: StyleProps = {
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: 'white',
    height: 30,
    justifyContent: 'flex-start',
  }

  return (
    <ScrollView
      ref={setRef}
      scrollAxis={ScrollAxis.Horizontal}
      offset={Point.fromXY(348, 0)}
      style={{ width: width - 348, height: 30 }}>
      <Flex repaintBoundary={true} style={style}>
        {cells}
      </Flex>
    </ScrollView>
  )
}

TableTest.storyName = 'Table'

export default {
  title: 'example/Table',
  component: TableTest,
  decorators: [(Story: React.ComponentType) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
