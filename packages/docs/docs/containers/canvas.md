---
sidebar_position: 1
---

# Canvas

`Canvas` is the special root component of Canvas UI - all Canvas UI elements must be descendants of this component. It serves as the bridge between the HTML DOM and the Canvas UI rendering system.

## Overview

The `Canvas` component is the essential entry point for any Canvas UI application. It creates and manages an HTML Canvas element, sets up the rendering pipeline, and provides the context for all child components to render within the Canvas environment.

Unlike traditional HTML elements, `Canvas` operates on a different rendering paradigm where all child components are rendered onto a Canvas surface using Canvas API calls rather than DOM manipulation.

## Basic Usage

```jsx live
function BasicCanvasExample() {
  return (
    <div style={{ height: '150px', border: '1px solid #ddd' }}>
      <Canvas>
        <Text style={{ fontSize: 16, color: '#333' }}>
          Hello, Canvas UI!
        </Text>
      </Canvas>
    </div>
  )
}
```

## Props

### `children`
- **Type:** `ReactNode`
- **Required:** Yes
- **Description:** The Canvas UI components to be rendered within the canvas. These must be Canvas UI components (like `Text`, `Flex`, `View`, etc.), not regular HTML elements.

### `onReady`
- **Type:** `() => void`
- **Required:** No
- **Description:** Callback function that gets called when the canvas is ready and initialized. Useful for performing actions that depend on the canvas being fully set up.

```jsx
<Canvas onReady={() => console.log('Canvas is ready!')}>
  <Text>Content</Text>
</Canvas>
```

## Key Features

### 🖼️ **Automatic Canvas Management**
The `Canvas` component automatically creates and manages an HTML Canvas element, handling:
- Canvas element creation and sizing
- Device pixel ratio (DPR) adjustments for high-density displays
- Automatic resizing when the container dimensions change

### 🎯 **Rendering Context**
Provides the rendering context that all child components need to function:
- Sets up the Canvas UI rendering pipeline
- Manages the scene tree and layout system
- Handles event delegation and hit testing

### 📱 **Responsive Design**
The canvas automatically adapts to its container:
- Fills the parent container completely
- Responds to container size changes
- Maintains proper aspect ratios on different screen densities

## Integration with React

The `Canvas` component seamlessly integrates with React applications:

```jsx
function App() {
  const [message, setMessage] = useState("Click me!")

  return (
    <div style={{ height: '200px' }}>
      <Canvas>
        <Flex style={{ flexDirection: 'column', padding: 20 }}>
          <Text
            style={{ fontSize: 18, cursor: 'pointer' }}
            onPointerDown={() => setMessage("Hello from Canvas!")}
            text={ message }
          />
          <Text style={{ fontSize: 14, color: '#666', marginTop: 10 }} text='This text is rendered on Canvas' />
        </Flex>
      </Canvas>
    </div>
  )
}
```

## Layout Behavior

The `Canvas` component itself behaves like a regular HTML element in terms of layout:

```jsx
// Canvas fills the container
<div style={{ width: '500px', height: '300px' }}>
  <Canvas>
    <Text>Canvas content</Text>
  </Canvas>
</div>

// Canvas with specific styling
<Canvas style={{ border: '1px solid #ccc', borderRadius: '8px' }}>
  <Text>Styled canvas</Text>
</Canvas>
```

## Event Handling

The `Canvas` component supports all standard Canvas UI events on its children:

```jsx live
function EventExample() {
  const [status, setStatus] = useState('Ready')

  return (
    <div style={{ height: '120px', border: '1px solid #ddd' }}>
      <Canvas>
        <Flex style={{ padding: 16, flexDirection: 'column', width: 200 }}>
          <Text
            style={{
              fontSize: 16,
              cursor: 'pointer',
              padding: 8,
              backgroundColor: '#f0f0f0',
              borderRadius: 4
            }}
            onPointerDown={() => setStatus('Clicked!')}
            onPointerOver={() => setStatus('Hovering')}
            onPointerOut={() => setStatus('Ready')}
            text={'Interactive Text'}
          />
          <Text style={{ fontSize: 12, color: '#666', marginTop: 8 }} text={`Status: ${status}`} />
        </Flex>
      </Canvas>
    </div>
  )
}
```

## Advanced Usage

### Accessing Canvas State

Use the `useCanvasState` hook to access canvas information within child components:

```jsx
import { useCanvasState } from '@canvas-ui/react'

function CanvasInfo() {
  const { width, height, binding } = useCanvasState()

  return (
    <Text>
      Canvas size: {width} x {height}
    </Text>
  )
}

function App() {
  return (
    <Canvas>
      <CanvasInfo />
    </Canvas>
  )
}
```

### Complex Layouts

Canvas UI supports sophisticated layouts within the Canvas:

```jsx live
function ComplexLayout() {
  return (
    <div style={{ height: '200px', border: '1px solid #ddd' }}>
      <Canvas>
        <Flex style={{
          flexDirection: 'row',
          width: 10,
          height: 200,
          padding: 16,
          gap: 16
        }}>
          <Flex style={{
            flex: 1,
            backgroundColor: '#e3f2fd',
            borderRadius: 8,
            padding: 12,
            flexDirection: 'column'
          }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Left Panel</Text>
            <Text style={{ fontSize: 12, marginTop: 4 }}>Some content here</Text>
          </Flex>
          <Flex style={{
            flex: 2,
            backgroundColor: '#f3e5f5',
            borderRadius: 8,
            padding: 12,
            flexDirection: 'column'
          }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Main Content</Text>
            <Text style={{ fontSize: 12, marginTop: 4 }}>More content in the main area</Text>
          </Flex>
        </Flex>
      </Canvas>
    </div>
  )
}
```

## Best Practices

### ✅ Do's
- Always wrap Canvas UI components in a `Canvas` component
- Use the `onReady` callback for initialization logic
- Leverage React state and props for dynamic content
- Use Canvas UI's layout system (Flex) for responsive designs

### ❌ Don'ts
- Don't mix HTML elements as direct children of Canvas UI components
- Don't try to manipulate the HTML canvas element directly
- Don't forget to provide adequate container dimensions
- Don't use Canvas for simple text-only content where HTML would suffice

## Common Patterns

### Container with Fixed Dimensions
```jsx
<div style={{ width: '800px', height: '600px' }}>
  <Canvas>
    {/* Your Canvas UI content */}
  </Canvas>
</div>
```

### Full-Screen Canvas
```jsx
<div style={{ width: '100vw', height: '100vh' }}>
  <Canvas>
    {/* Full-screen content */}
  </Canvas>
</div>
```

### Canvas in a Flex Layout
```jsx
<div style={{ display: 'flex', height: '400px' }}>
  <div style={{ flex: 1 }}>
    <Canvas>
      {/* Canvas content takes remaining space */}
    </Canvas>
  </div>
</div>
```
