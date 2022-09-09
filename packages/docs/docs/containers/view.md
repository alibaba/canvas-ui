---
sidebar_position: 2
---

# View

`View` is the fundamental container component in Canvas UI. It provides a basic container without automatic layout capabilities, requiring child elements to use absolute positioning to specify their coordinates.

## Overview

The `View` component serves as the foundation for building custom layouts and containers in Canvas UI. Unlike `Flex` which provides automatic layout, `View` gives you complete control over the positioning of child elements through absolute positioning.

Key characteristics:
- **No Automatic Layout**: Child elements must specify their own positions
- **Absolute Positioning**: Children use `top`, `left`, `width`, and `height` properties
- **Full Styling Support**: Supports all Canvas UI styling properties
- **Event Handling**: Provides complete event handling capabilities
- **Performance Optimized**: Minimal overhead for maximum performance

## Basic Usage

```tsx live
function BasicViewExample() {
  const { Canvas, View, Text } = importCanvasUIPackages()

  return (
    <div style={{ height: '200px', border: '1px solid #ddd' }}>
      <Canvas>
        <View style={{ width: 300, height: 180, backgroundColor: '#f5f5f5', padding: 10 }}>
          <Text
            style={{
              top: 20,
              left: 20,
              fontSize: 16,
              color: '#333'
            }}
            text="Top Left Text"
          />
          <Text
            style={{
              top: 20,
              right: 20,
              fontSize: 16,
              color: '#2196f3'
            }}
            text="Top Right Text"
          />
          <Text
            style={{
              bottom: 20,
              left: 20,
              fontSize: 14,
              color: '#666'
            }}
            text="Bottom Left Text"
          />
          <Text
            style={{
              bottom: 20,
              right: 20,
              fontSize: 14,
              color: '#4caf50'
            }}
            text="Bottom Right Text"
          />
        </View>
      </Canvas>
    </div>
  )
}
```

## Props

### Inherited Props
`View` inherits all standard Canvas UI component props:

- **`style`** - CSS-like styling properties
- **`children`** - Child components to render inside the view
- **`id`** - Component identifier for debugging
- **Event handlers** - `onPointerDown`, `onPointerMove`, `onPointerOver`, etc.
- **`hidden`** - Whether the component is hidden
- **`hitTestDisabled`** - Whether hit testing is disabled
- **`repaintBoundary`** - Whether the component acts as a repaint boundary

## Key Features

### 🎯 **Absolute Positioning Control**
Complete control over child element positioning:
- Use `top`, `left`, `bottom`, `right` for positioning
- Specify `width` and `height` for sizing
- Stack elements using `zIndex`

### 🎨 **Full Styling Support**
Supports all Canvas UI styling properties:
- Background colors and images
- Borders and border radius
- Padding and margins
- Box shadows and effects

### ⚡ **High Performance**
Optimized for performance:
- Minimal layout overhead
- Efficient rendering pipeline
- Optional repaint boundaries

### 🖱️ **Complete Event Handling**
Full event handling capabilities:
- Pointer events (click, hover, etc.)
- Keyboard events
- Custom event propagation

## Positioning Examples

### Complex Layout

```tsx live
function ComplexLayoutExample() {
  const { Canvas, View, Text } = importCanvasUIPackages()

  return (
    <div style={{ height: '250px', border: '1px solid #ddd' }}>
      <Canvas>
        <View style={{ width: 400, height: 230, backgroundColor: '#fafafa', padding: 10 }}>
          {/* Header */}
          <View
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: 50,
              backgroundColor: '#2196f3',
              borderRadius: 4
            }}
          >
            <Text
              style={{
                top: 15,
                left: 15,
                fontSize: 16,
                color: 'white',
                fontWeight: 'bold'
              }}
              text="Header"
            />
          </View>

          {/* Sidebar */}
          <View
            style={{
              top: 60,
              left: 0,
              width: 100,
              bottom: 0,
              backgroundColor: '#e3f2fd',
              borderRadius: 4
            }}
          >
            <Text
              style={{
                top: 10,
                left: 10,
                fontSize: 12,
                color: '#1976d2'
              }}
              text="Sidebar"
            />
          </View>

          {/* Main Content */}
          <View
            style={{
              top: 60,
              left: 110,
              right: 0,
              bottom: 0,
              backgroundColor: 'white',
              borderRadius: 4,
              borderWidth: 1,
              borderColor: '#ddd'
            }}
          >
            <Text
              style={{
                top: 20,
                left: 20,
                fontSize: 14,
                color: '#333'
              }}
              text="Main Content Area"
            />
            <Text
              style={{
                top: 45,
                left: 20,
                fontSize: 12,
                color: '#666'
              }}
              text="This is a complex layout using absolute positioning"
            />
          </View>
        </View>
      </Canvas>
    </div>
  )
}
```

## Interactive Examples

### Clickable Areas

```tsx live
function InteractiveViewExample() {
  const { Canvas, View, Text } = importCanvasUIPackages()

  const [selectedArea, setSelectedArea] = useState('none')

  const areas = [
    { id: 'area1', color: '#e3f2fd', label: 'Area 1', top: 20, left: 20 },
    { id: 'area2', color: '#f3e5f5', label: 'Area 2', top: 20, left: 140 },
    { id: 'area3', color: '#e8f5e8', label: 'Area 3', top: 90, left: 20 },
    { id: 'area4', color: '#fff3e0', label: 'Area 4', top: 90, left: 140 }
  ]

  return (
    <div style={{ height: '200px', border: '1px solid #ddd' }}>
      <Canvas>
        <View style={{ width: 300, height: 180, backgroundColor: '#fafafa' }}>
          {areas.map((area) => (
            <View
              key={area.id}
              style={{
                top: area.top,
                left: area.left,
                width: 100,
                height: 60,
                backgroundColor: selectedArea === area.id ? '#2196f3' : area.color,
                borderRadius: 4,
                cursor: 'pointer',
                borderWidth: selectedArea === area.id ? 2 : 1,
                borderColor: selectedArea === area.id ? '#1976d2' : '#ddd'
              }}
              onPointerDown={() => setSelectedArea(area.id)}
            >
              <Text
                style={{
                  top: 20,
                  left: 10,
                  fontSize: 12,
                  color: selectedArea === area.id ? 'white' : '#333',
                  fontWeight: selectedArea === area.id ? 'bold' : 'normal'
                }}
                text={area.label}
              />
            </View>
          ))}
          <Text
            style={{
              bottom: 10,
              left: 10,
              fontSize: 10,
              color: '#666'
            }}
            text={`Selected: ${selectedArea}`}
          />
        </View>
      </Canvas>
    </div>
  )
}
```

## Best Practices

### ✅ Do's
- Use `View` when you need precise control over element positioning
- Specify explicit dimensions (`width`, `height`) for child elements
- Leverage absolute positioning properties (`top`, `left`, `bottom`, `right`)
- Use `View` as a foundation for custom layout components

### ❌ Don'ts
- Don't use `View` when `Flex` would be more appropriate for automatic layouts
- Don't forget to set dimensions for child elements
- Don't rely on default positioning - always specify positions explicitly
- Don't create overly complex nesting when simpler solutions exist

### 🎯 Performance Tips
- **Repaint Boundaries**: Use `repaintBoundary={true}` for independent update areas
- **Minimal Nesting**: Keep view hierarchy shallow when possible
- **Static Positioning**: Prefer static layouts over dynamic repositioning
- **Event Optimization**: Use `hitTestDisabled={true}` for non-interactive elements

## When to Use View

| Scenario | Use View | Use Flex |
|----------|----------|----------|
| Precise positioning needed | ✅ | ❌ |
| Overlapping elements | ✅ | ❌ |
| Custom layout systems | ✅ | ❌ |
| Simple automatic layouts | ❌ | ✅ |
| Responsive designs | ❌ | ✅ |
| Game UI positioning | ✅ | ❌ |

## Comparison with Other Containers

### View vs Flex
- **View**: Manual positioning, complete control, no automatic layout
- **Flex**: Automatic layout, responsive, CSS Flexbox-like behavior

### View vs Chunk
- **View**: General-purpose container, any number of children
- **Chunk**: Performance-optimized for large lists, chunking and culling

### View vs Canvas
- **View**: Container component, rendered within Canvas
- **Canvas**: Root component, bridges to HTML Canvas element

The `View` component provides the foundation for building custom layouts in Canvas UI, offering maximum flexibility and control over element positioning.

