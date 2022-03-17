import { DebugFlags, RenderText, SyntheticPointerEvent } from '@canvas-ui/core'
import {
  Canvas,
  Flex,
  ScrollView,
  StyleProps,
  Text,
  usePopup
} from '@canvas-ui/react'
import type { Story } from '@storybook/react'
import { assert } from '@canvas-ui/assert'
import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useRef,
  useState
} from 'react'

const textStyle: StyleProps = {
  marginBottom: 12,
  cursor: 'text',
}

export const UsePopupTest: Story = () => {

  useEffect(() => {
    DebugFlags.set(0)
  }, [])

  const [editor, setEditor] = useState<ReactNode | null>(null)
  const editorRef = useRef<HTMLTextAreaElement | null>(null)

  const [value, setValue] = useState('3. 那只敏捷的棕毛🦊跃过了那只🐶\nThe quick brown 🦊 jumps over the lazy 🐶')

  const { handlePointerDown: handlePointerDown1, open } = usePopup<RenderText, CSSProperties>({
    hideTriggerOnOpen: true,
    onOpen(state) {
      const { bounds, target, payload } = state
      assert(target)
      const { computedStyle } = target.paragraph

      const style: CSSProperties = {
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate(${bounds.left}px, ${bounds.top}px)`,
        width: bounds.width,
        height: bounds.height,
        background: 'transparent',
        border: payload?.border ?? 'none', // 可以获取 payload
        margin: 0,
        padding: 0,
        outline: 'none',
        font: computedStyle.font,
        color: computedStyle.color,
        lineHeight: `${computedStyle.lineHeight}px` // 不加 px 会被识别成按字体大小比例行高
      }

      const handleBlur = () => {
        state.close()
      }

      setEditor(
        <textarea
          ref={editorRef}
          autoFocus={true}
          onBlur={handleBlur}
          style={style}
          defaultValue={value}
        />,
      )
    },

    onUpdate(state) {
      this.onOpen?.(state)
    },

    onClose() {
      assert(editorRef.current)
      setValue(editorRef.current.value)
      setEditor(null)
    },

  })

  const handlePointerDown2 = (event: SyntheticPointerEvent<RenderText>) => {
    assert(event.target)

    // 可以传递 payload
    open(event.target, { border: '1px solid red' })
  }

  return (
    <div style={{ height: '100%' }}>
      <div style={{ padding: 24, height: '100%' }}>
        <Canvas>
          <ScrollView style={{ width: 300, height: 80 }}>
            <Flex style={{ width: 400, flexDirection: 'column' }}>
              <Text onPointerDown={handlePointerDown1} style={textStyle}>{value}</Text>
              <Text onPointerDown={handlePointerDown2} style={textStyle}>{value}</Text>
            </Flex>
          </ScrollView>
        </Canvas>
      </div>
      {editor}
    </div>
  )
}

UsePopupTest.storyName = 'usePopup'

export default {
  title: 'react',
  component: UsePopupTest,
  decorators: [(Story: Story) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
