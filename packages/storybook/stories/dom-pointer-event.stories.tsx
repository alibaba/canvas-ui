import type { Story } from '@storybook/react'
import React, { useEffect, useRef } from 'react'

export const DOMPointerEvent: Story = () => {

  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const { current: a } = ref
    if (!a) {
      return
    }

    const b = a.querySelector('#b') as HTMLElement
    const c = a.querySelector('#c') as HTMLElement

    const handleEvent = (event: MouseEvent) => {
      const target = event.target as HTMLDivElement
      console.info(event.type, target.id, `${event.offsetX}, ${event.offsetY}`)
    }

    const addListeners = (el: HTMLElement) => {
      el.addEventListener('pointerenter', handleEvent)
      el.addEventListener('pointerleave', handleEvent)
      el.addEventListener('pointerenter', handleEvent)
      el.addEventListener('pointerout', handleEvent)
      el.addEventListener('pointermove', handleEvent)
      el.addEventListener('pointerdown', handleEvent)
      el.addEventListener('pointerup', handleEvent)
      el.addEventListener('wheel', handleEvent)
    }

    const removeListeners = (el: HTMLElement) => {
      el.addEventListener('pointerenter', handleEvent)
      el.addEventListener('pointerleave', handleEvent)
      el.addEventListener('pointerenter', handleEvent)
      el.addEventListener('pointerout', handleEvent)
      el.addEventListener('pointermove', handleEvent)
      el.addEventListener('pointerdown', handleEvent)
      el.addEventListener('pointerup', handleEvent)
      el.addEventListener('wheel', handleEvent)
    }

    addListeners(a)
    addListeners(b)
    addListeners(c)

    return () => {
      removeListeners(a)
      removeListeners(b)
      removeListeners(c)
    }
  }, [ref])

  return (
    <>
      <div id='a' style={{ backgroundColor: 'red', width: 100, height: 100 }} ref={ref}>
        <div id="b" style={{ backgroundColor: 'black', width: 80, height: 80 }}>
          <div id="c" style={{ backgroundColor: 'yellow', width: 60, height: 60 }}>

          </div>
        </div>
      </div>
    </>
  )
}

export default {
  title: 'core/dom',
  component: DOMPointerEvent,
  decorators: [(Story: Story) => <div style={{ backgroundColor: '#efefef', width: '100%', height: '100vh' }}><Story /></div>],
}
