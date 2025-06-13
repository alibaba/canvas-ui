---
sidebar_position: 1
slug: /
---

# Intro

Welcome to **Canvas UI** - a powerful general-purpose UI renderer that runs on HTML Canvas, offering React developers a seamless way to build high-performance Canvas-based applications.

## What is Canvas UI?

Canvas UI is a modern UI framework that brings the familiar React component model to HTML Canvas rendering. It provides a comprehensive set of React components and a DOM-like scene tree, allowing developers to create sophisticated Canvas applications using their existing React knowledge.

## Key Features

### 🎯 **React Integration**
Seamlessly integrate with existing React applications using familiar component patterns and JSX syntax.

### 📐 **Flex Layout System**
Full support for CSS Flexbox layout, making it easy to create responsive and adaptive user interfaces.

### 📝 **Advanced Typography**
Rich text rendering capabilities including automatic word wrapping, text alignment, overflow handling, and multi-line support.

### 🎨 **CSS-like Styling**
Style your components using CSS-like properties through the `style` attribute, including support for colors, borders, shadows, and more.

### 🖱️ **Event Handling**
Complete interaction support with PointerEvents and WheelEvent, enabling rich user interactions.

### 🏗️ **DOM-like Architecture**
Manipulate Canvas elements just like DOM elements with a familiar scene tree structure.

### 📦 **TypeScript Ready**
Fully written in TypeScript with complete type definitions for better development experience.

### ⚡ **Performance Optimized**
Built-in layering capabilities and efficient rendering pipeline for optimal performance.

## Quick Start Example

Here's a simple example to get you started:

```jsx live
function HelloWorld() {
  const containerStyle = {
    width: 250,
    flexDirection: 'column'
  } as const

  const textStyle = {
    maxWidth: containerStyle.width,
    maxLines: 1,
    cursor: 'pointer',
    fontSize: 14,
    color: '#333'
  } as const

  const [text, setText] = React.useState('Hello, Canvas UI!')
  const textRef = React.useRef(null)

  const handlePointerDown = () => {
    setText(text === 'Hello, Canvas UI!' ? 'Welcome to Canvas UI! 🎉' : 'Hello, Canvas UI!')
  }

  React.useEffect(() => {
    console.info('Access underlying RenderText object:', textRef.current)
  }, [])

  return (
    <div style={{ height: '120px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <Canvas>
        <Flex style={containerStyle}>
          <Text
            ref={textRef}
            onPointerDown={handlePointerDown}
            style={textStyle}
          >
            {text}
          </Text>
          <Text style={{ ...textStyle, marginTop: 8, fontSize: 12, color: '#666' }}>
            Click the text above to see it change!
          </Text>
        </Flex>
      </Canvas>
    </div>
  )
}
```

## Core Components

Canvas UI provides a rich set of components for building your applications:

### Layout Components
- **`<Canvas>`** - The root container for your Canvas UI application
- **`<Flex>`** - Flexible container with Flexbox layout support
- **`<View>`** - Basic container component
- **`<ScrollView>`** - Scrollable container with customizable scroll behavior

### Content Components
- **`<Text>`** - Rich text rendering with typography controls
- **`<Image>`** - Image display component
- **`<Rect>`** - Rectangle shapes with styling
- **`<Circle>`** - Circle shapes
- **`<RRect>`** - Rounded rectangle shapes
- **`<Path>`** - Custom vector paths

## Architecture Overview

Canvas UI is built on a solid foundation with clear separation of concerns:

- **`@canvas-ui/core`** - The rendering engine core with element creation, events, and rendering pipeline
- **`@canvas-ui/react`** - Official React bindings providing familiar component APIs
- **`@canvas-ui/animation`** - Animation utilities (powered by motion)

## Use Cases

Canvas UI is perfect for applications that need:

- **Data Visualizations** - Charts, graphs, and interactive diagrams
- **Creative Tools** - Drawing applications, design tools, image editors
- **Games and Simulations** - 2D games, interactive simulations
- **Custom UI Components** - Unique interface elements that go beyond standard HTML
- **Performance-Critical UIs** - Applications requiring smooth 60fps interactions

## Browser Compatibility

The `Canvas` component works in all modern browsers that support:
- HTML5 Canvas API
- ES2015
- React 19+

## Getting Started

Ready to dive in? Check out our [Quick Start Guide](./quick-start/installation) to set up your first Canvas UI project, or explore our [component examples](./tutorial-basics/create-a-page) to see what's possible.

For a comprehensive demo, visit our [interactive kanban example](https://alibaba.github.io/canvas-ui/examples/task) to see Canvas UI in action.

