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
          <Text style={ textStyle }>私はガラスを食べられます。それは私を傷つけません。</Text>
          <Text style={ textStyle }>The quick brown fox jumps over the lazy dog.</Text>
        </Flex>
      </Canvas>
    </div>
  )
}
```

# Demo

https://stackblitz.com/github/alibaba/canvas-ui/tree/main/examples/kanban

![canvas-ui-kanban-demo](https://alibaba.github.io/canvas-ui/assets/images/stackblitz-aa46daf95c93384d7fee39a81805f909.png)


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

```

# Visual Regression Testing (VRT)

This project uses [Playwright](https://playwright.dev/) for visual regression testing against Storybook stories, ensuring UI components maintain their visual appearance across changes.

## Running VRT

```bash
# Build Storybook first (required before running VRT)
$ pnpm build:storybook

# Run VRT tests
$ pnpm test:vrt

# Update baseline screenshots (after intentional visual changes)
$ pnpm test:vrt:update
```

## How It Works

- VRT tests are located in `packages/storybook/vrt/`
- Baseline screenshots are stored in `packages/storybook/vrt/__snapshots__/`
- Tests automatically start a local HTTP server to serve the built Storybook
- Each test navigates to a story's iframe URL, waits for canvas rendering, and compares a screenshot against the baseline
- A `maxDiffPixelRatio` of `0.01` (1% of pixels) is used as the threshold — screenshots with more than 1% pixel differences will fail the test

## Adding New VRT Cases

To add a new story to VRT coverage, add an entry to the `stories` array in `packages/storybook/vrt/vrt.spec.ts`:

```ts
{ id: 'category--story-id', name: 'screenshot-name' }
```

The `id` must match the Storybook story ID (visible in Storybook's URL or `storybook-static/index.json`). Then run `pnpm test:vrt:update` to generate the baseline screenshot.

