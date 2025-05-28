<img width="248" alt="canvas-ui-logo" src="https://user-images.githubusercontent.com/180445/147241118-4fb09f35-8bc0-449b-8ab1-045caa9eb726.png">

Canvas UI is a general UI renderer runs on HTML Canvas. https://alibaba.github.io/canvas-ui/

<hr>

It provides a series of React components, allowing developers to quickly build Canvas-based applications using their existing knowledge.

It also features a DOM-like scene tree, enabling developers to manipulate elements drawn in Canvas just like they would manipulate DOM elements.

```tsx
import React from 'react'
import { Canvas, Text, Flex } from '@canvas-ui/react'

export default () => {
  const containerStyle = {
    width: 250,
    flexDirection: 'column'
  }
  const textStyle = {
    maxWidth: containerStyle.width,
    maxLines: 1,
  }
  return (
    <div style={{ height: '100px' }}>
      <Canvas>
        <Flex style={ containerStyle }>
          <Text style={ textStyle }>我能吞下玻璃而不伤身体。</Text>
          <Text style={ textStyle }>私はガラスを食べられます。それは私を傷つけません。</Text>
          <Text style={ textStyle }>The quick brown fox jumps over the lazy dog.</Text>
        </Flex>
      </Canvas>
    </div>
  )
}
```

# Demo

https://alibaba.github.io/canvas-ui/examples/task

![canvas-ui-kanban-demo](https://user-images.githubusercontent.com/180445/189369038-1a5b5c56-375b-4d5d-801a-9e06421f4a63.png)


# Features

- Manipulate elements in Canvas just like DOM elements

- Seamlessly integrating with React applications

- Flex layout

- Animation based on [motion](https://motion.dev/)

- Basic text typography capabilities: automatic word wrapping, alignment, text overflow

- CSS styles through the style attribute

- Interaction events: PointerEvents and WheelEvent

- Convenient layering capabilities

- Fully written in TypeScript with complete type definitions

- Rendering in WebWorker (WIP)

# Project Structure

- packages/core
The core of the renderer, providing capabilities such as createElement, events, rendering pipeline, etc.

- packages/react
Canvas UI's official React binding, providing components like `<View />`, `<Text />`, etc.

- packages/examples
Component development and testing environment based on Storybook

- tools/
scripts

# Development

```
# Start development mode for core and react
$ pnpm dev

# Start Storybook
$ pnpm dev:storybook

# Run unit tests
$ pnpm test

# Build umd, esm versions
$ pnpm build

# Publish
$ sh ./tools/publish.sh
```
