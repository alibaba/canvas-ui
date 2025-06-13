---
sidebar_position: 1
---

# Installation & Getting Started

Canvas UI is a high-performance React library for building interactive graphics and interfaces using HTML5 Canvas. This guide will help you install and set up Canvas UI in your project.

## Installation

Canvas UI consists of two main packages that work together to provide a complete canvas-based UI solution:

### Core Packages

**`@canvas-ui/core`**
- The foundational rendering engine and graphics primitives
- Provides low-level canvas drawing capabilities
- Handles layout, hit testing, and paint optimizations
- Framework-agnostic core functionality

**`@canvas-ui/react`**
- React bindings and components for Canvas UI
- Provides React hooks and declarative API
- Depends on `@canvas-ui/core`
- Recommended for most React applications

### Quick Install

For most React projects, you only need to install the React package:

```bash npm2yarn
npm install @canvas-ui/react
```

This automatically includes the core package as a dependency.

### Advanced Installation

If you need additional features, you can install optional packages:

```bash npm2yarn
# Animation utilities
npm install @canvas-ui/animation
```

Or without React bindings

```bash npm2yarn
# Animation utilities
npm install @canvas-ui/core
```

## System Requirements

Canvas UI works in all modern browsers and React environments:

- **React:** 19.0.0 or later
- **TypeScript:** 4.5 or later (optional but recommended)
- **Browsers:** Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Node.js:** 18+ (for build tools)

## Basic Usage

After installation, you can start using Canvas UI components in your React application.

### Hello World Example

```tsx live
function HelloWorld() {
  return (
    <div style={{ height: '150px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <Canvas>
        <Text
          style={{
            fontSize: 18,
            color: '#2196f3',
            fontWeight: 'bold'
          }}
          text="Hello, Canvas UI!"
        />
      </Canvas>
    </div>
  )
}
```

### Complete Application Setup

Here's how to integrate Canvas UI into a React application:

```tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, Text, Flex } from '@canvas-ui/react'

function App() {
  return (
    <div style={{ height: '100vh', backgroundColor: '#f5f5f5' }}>
      <Canvas>
        <Flex
          style={{
            flexDirection: 'column',
            padding: 20,
            gap: 10,
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#333'
            }}
            text="Welcome to Canvas UI"
          />
          <Text
            style={{
              fontSize: 16,
              color: '#666'
            }}
            text="High-performance React canvas components"
          />
        </Flex>
      </Canvas>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
```

## Key Concepts

### Canvas Root Component

Every Canvas UI application must have a `<Canvas />` root component:

- Acts as the bridge between React and the HTML Canvas API
- All Canvas UI components must be descendants of Canvas
- Automatically manages canvas sizing and device pixel ratio
- Handles event delegation and rendering optimization

```tsx
// ✅ Correct - Canvas UI components inside Canvas
<Canvas>
  <Text>This works!</Text>
  <Flex>
    <Text>Nested components work too</Text>
  </Flex>
</Canvas>

// ❌ Incorrect - Canvas UI components outside Canvas
<div>
  <Text>This won't work</Text>
</div>
```

### Container Sizing

The Canvas component fills its parent container completely. You must provide explicit dimensions:

```tsx live
function SizingExample() {
  return (
    <div style={{
      width: '300px',
      height: '200px',
      border: '2px solid #2196f3',
      borderRadius: '8px',
      backgroundColor: '#f8f9fa'
    }}>
      <Canvas>
        <Text
          style={{
            fontSize: 16,
            color: '#333',
            padding: 16
          }}
          text="Canvas fills the blue container"
        />
      </Canvas>
    </div>
  )
}
```

### Mixing with HTML

Canvas UI components render to canvas, but you can mix them with regular HTML:

```tsx live
function MixedContentExample() {
  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>HTML Header</h3>

      <div style={{ height: '120px', border: '1px solid #ddd', marginBottom: '10px' }}>
        <Canvas>
          <Flex style={{ padding: 16, gap: 8, width: 200 }}>
            <Text style={{ fontSize: 14, color: '#2196f3' }} text="Canvas UI Text" />
            <Text style={{ fontSize: 14, color: '#4caf50' }} text="More Canvas Content" />
          </Flex>
        </Canvas>
      </div>

      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
        Regular HTML paragraph below the canvas
      </p>
    </div>
  )
}
```

## Common Issues & Solutions

### Issue: Can't See Any Content

**Problem:** The Canvas appears empty or shows no content.

**Solution:** Ensure the Canvas container has explicit height:

```tsx live
function HeightIssueDemo() {
  const [hasHeight, setHasHeight] = useState(true)

  return (
    <div>
      <button
        onClick={() => setHasHeight(!hasHeight)}
        style={{ marginBottom: '10px' }}
      >
        {hasHeight ? 'Remove Height' : 'Add Height'}
      </button>

      <div
        style={{
          height: hasHeight ? '120px' : undefined,
          border: '2px solid red',
          borderRadius: '4px'
        }}
      >
        <Canvas>
          <Text
            style={{ fontSize: 16, padding: 16 }}
            text={`Container height: ${hasHeight ? '120px' : 'auto (0px)'}`}
          />
        </Canvas>
      </div>
    </div>
  )
}
```

### Issue: Performance Problems

**Problem:** Canvas rendering feels slow or choppy.

**Solutions:**
- Use [`Chunk`](../containers/chunk) for large lists
- Enable repaint boundaries with `repaintBoundary={true}`
- Minimize complex layouts and use absolute positioning when possible

### Issue: Events Not Working

**Problem:** Click or hover events don't respond.

**Solutions:**
- Ensure components have proper size (width/height > 0)
- Check that `hitTestDisabled={false}` (default)
- Verify event handlers are attached to the correct component

```tsx live
function EventsExample() {
  const [message, setMessage] = useState('Click the blue box')

  return (
    <div style={{ height: '120px', border: '1px solid #ddd' }}>
      <Canvas>
        <Flex style={{ padding: 20, gap: 10, flexDirection: 'column', width: 200 }}>
          <Flex
            style={{
              width: 150,
              height: 40,
              backgroundColor: '#2196f3',
              borderRadius: 4,
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onPointerDown={() => setMessage('Box clicked!')}
            onPointerOver={() => setMessage('Hovering over box')}
            onPointerOut={() => setMessage('Click the blue box')}
          >
            <Text style={{ color: 'white', fontSize: 14 }} text="Click me" />
          </Flex>
          <Text style={{ fontSize: 12, color: '#666' }} text={message} />
        </Flex>
      </Canvas>
    </div>
  )
}
```

## Next Steps

Now that you have Canvas UI installed and running:

1. **Learn the Basics:** Explore the [Tutorial](../tutorial-basics/create-a-page) to understand core concepts
2. **Browse Components:** Check out [Containers](../containers/canvas) and [Graphics](../graphics/text) components
3. **See Examples:** Look at practical examples in the [Storybook](https://canvas-ui-storybook.vercel.app)
4. **Performance:** Learn about optimizations with [Chunk](../containers/chunk) and rendering best practices

## TypeScript Support

Canvas UI is written in TypeScript and provides excellent type safety:

```tsx
import { Canvas, Text, Flex } from '@canvas-ui/react'
import type { StyleProps } from '@canvas-ui/react'

// Full type safety for styles and props
const textStyle: StyleProps = {
  fontSize: 16,
  color: '#333',
  fontWeight: 'bold'
}

function TypedComponent() {
  return (
    <Canvas>
      <Text style={textStyle} text="Fully typed!" />
    </Canvas>
  )
}
```

## Bundle Size

Canvas UI is optimized for production use:

- **@canvas-ui/react:** ~150KB minified + gzipped
- **@canvas-ui/core:** ~120KB minified + gzipped
- Tree-shaking friendly for smaller bundles
- No external dependencies beyond React

For bundle analysis and optimization tips, see the [Performance Guide](../tutorial-extras/performance).
