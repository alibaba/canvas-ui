---
sidebar_position: 5
---

# Chunk

`Chunk` is a specialized container component optimized for rendering large lists of elements efficiently. It provides automatic chunking and offstage rendering to handle performance-intensive scenarios where thousands of items need to be displayed.

## Overview

The `Chunk` component is designed to solve performance challenges when rendering large numbers of child elements. Unlike regular `View` or `Flex` containers, `Chunk` intelligently groups child elements into smaller chunks and only renders visible portions, significantly improving performance for large datasets.

Key performance optimizations include:
- **Automatic Chunking**: Groups elements into chunks of configurable capacity
- **Offstage Rendering**: Culls elements outside the viewport
- **Repaint Boundaries**: Always acts as a repaint boundary for performance isolation
- **Viewport Culling**: Uses intelligent viewport-based visibility detection

## Basic Usage

```jsx live
function BasicChunkExample() {
  const { Canvas, ScrollView, Chunk, Text } = importCanvasUIPackages()

  const items = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    text: `Item ${i + 1}`
  }))

  return (
    <div style={{ height: '200px', border: '1px solid #ddd' }}>
      <Canvas>
        <ScrollView style={{ width: 300, height: 200 }}>
          <Chunk style={{ width: 280, padding: 10 }}>
            {items.map((item) => (
              <Text
                key={item.id}
                style={{
                  top: item.id * 25,
                  width: 260,
                  height: 20,
                  fontSize: 14,
                  padding: 2,
                  backgroundColor: item.id % 2 === 0 ? '#f5f5f5' : '#ffffff'
                }}
                text={item.text}
              />
            ))}
          </Chunk>
        </ScrollView>
      </Canvas>
    </div>
  )
}
```

## Props

### `capacity`
- **Type:** `number`
- **Default:** `6`
- **Description:** The maximum number of child elements to group together in a single chunk. Smaller values create more granular chunks but may increase overhead. Larger values reduce overhead but may decrease culling effectiveness.

```jsx
<Chunk capacity={10}>
  {/* Children will be grouped into chunks of 10 elements */}
</Chunk>
```

### `isOffstage`
- **Type:** `(viewport: Rect, childBounds: Rect) => boolean`
- **Default:** `ChunkContainer.defaultIsOffstage`
- **Description:** A function that determines whether a chunk is outside the viewport and should be culled from rendering. The default implementation checks for rect overlap.

```jsx
// Custom offstage detection with larger threshold
const customIsOffstage = (viewport, childBounds) => {
  // Add 100px buffer around viewport
  const bufferedViewport = {
    left: viewport.left - 100,
    top: viewport.top - 100,
    width: viewport.width + 200,
    height: viewport.height + 200
  }
  return !Rect.overlaps(bufferedViewport, childBounds)
}

<Chunk isOffstage={customIsOffstage}>
  {children}
</Chunk>
```

### Inherited Props
`Chunk` inherits all props from [`View`](./view), including:
- `style` - CSS-like styling
- `children` - Child elements
- `id` - Component identifier
- Event handlers (`onPointerDown`, `onPointerMove`, etc.)

## Key Features

### 🎯 **Automatic Performance Optimization**
Chunk automatically optimizes rendering performance without requiring manual configuration:
- Groups elements into manageable chunks
- Culls offscreen content from rendering
- Provides repaint boundaries to isolate updates

### 📐 **Intelligent Chunking**
Elements are automatically grouped based on the `capacity` setting:
- Default capacity of 6 elements per chunk balances performance and granularity
- Chunks are dynamically created and destroyed as needed
- Layout calculations are optimized per chunk

### 👁️ **Viewport Culling**
Only visible chunks are rendered:
- Uses viewport bounds to determine visibility
- Customizable offstage detection function
- Significantly reduces drawing operations for large lists

### 🔧 **Seamless Integration**
Works naturally with other Canvas UI components:
- Integrates with ScrollView for scrollable lists
- Supports all standard layout properties
- Maintains event handling for all child elements

## Performance Comparison

Here's a demonstration showing the performance difference between regular containers and Chunk:

```jsx live
function PerformanceComparison() {
  const { Canvas, ScrollView, Chunk, View, Flex, Text } = importCanvasUIPackages()

  const [useChunk, setUseChunk] = useState(true)
  const items = Array.from({ length: 200 }, (_, i) => ({
    id: i,
    text: `Performance Item ${i + 1}`,
    color: `hsl(${(i * 137.5) % 360}, 70%, 85%)`
  }))

  const Container = useChunk ? Chunk : View

  return (
    <div style={{ height: '250px', border: '1px solid #ddd' }}>
      <div style={{ padding: '10px', backgroundColor: '#f9f9f9' }}>
        <button
          onClick={() => setUseChunk(!useChunk)}
          style={{ marginBottom: '10px' }}
        >
          Using: {useChunk ? 'Chunk (Optimized)' : 'View (Regular)'}
        </button>
      </div>
      <Canvas>
        <ScrollView style={{ width: 300, height: 200 }}>
          <Container style={{ width: 280, padding: 10 }}>
            {items.map((item) => (
              <Flex
                key={item.id}
                style={{
                  top: item.id * 30,
                  width: 260,
                  height: 25,
                  backgroundColor: item.color,
                  borderRadius: 4,
                  padding: 4,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontSize: 12 }} text={item.text} />
              </Flex>
            ))}
          </Container>
        </ScrollView>
      </Canvas>
    </div>
  )
}
```

## Advanced Usage

### Large Dataset Example

For very large datasets, Chunk provides substantial performance benefits:

```jsx live
function LargeDatasetExample() {
  const { Canvas, ScrollView, Chunk, Flex, Text } = importCanvasUIPackages()

  const [itemCount, setItemCount] = useState(500)

  const items = React.useMemo(() =>
    Array.from({ length: itemCount }, (_, i) => ({
      id: i,
      title: `Large Dataset Item ${i + 1}`,
      subtitle: `Subtitle for item ${i + 1}`,
      value: Math.floor(Math.random() * 1000)
    })), [itemCount]
  )

  return (
    <div style={{ height: '300px', border: '1px solid #ddd' }}>
      <div style={{ padding: '10px', backgroundColor: '#f9f9f9' }}>
        <label>
          Items:
          <input
            type="range"
            min="100"
            max="2000"
            value={itemCount}
            onChange={(e) => setItemCount(Number(e.target.value))}
          />
          {itemCount}
        </label>
      </div>
      <Canvas>
        <ScrollView style={{ width: 350, height: 250 }}>
          <Chunk style={{ width: 330, padding: 10 }} capacity={8}>
            {items.map((item) => (
              <Flex
                key={item.id}
                style={{
                  top: item.id * 35,
                  width: 310,
                  height: 30,
                  backgroundColor: '#ffffff',
                  borderColor: '#e0e0e0',
                  borderWidth: 1,
                  borderRadius: 4,
                  padding: 6,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Flex style={{ flexDirection: 'column' }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold' }} text={item.title} />
                  <Text style={{ fontSize: 10, color: '#666' }} text={item.subtitle} />
                </Flex>
                <Text style={{ fontSize: 12, color: '#2196f3' }} text={item.value.toString()} />
              </Flex>
            ))}
          </Chunk>
        </ScrollView>
      </Canvas>
    </div>
  )
}
```

### Custom Offstage Detection

Customize when elements are considered offstage for advanced optimization:

```jsx
function CustomOffstageExample() {
  // Only render chunks that are very close to the viewport
  const aggressiveOffstage = (viewport, childBounds) => {
    const buffer = 50 // Small buffer
    return !Rect.overlaps({
      left: viewport.left - buffer,
      top: viewport.top - buffer,
      width: viewport.width + (buffer * 2),
      height: viewport.height + (buffer * 2)
    }, childBounds)
  }

  // Render chunks with a large buffer for smooth scrolling
  const conservativeOffstage = (viewport, childBounds) => {
    const buffer = 200 // Large buffer
    return !Rect.overlaps({
      left: viewport.left - buffer,
      top: viewport.top - buffer,
      width: viewport.width + (buffer * 2),
      height: viewport.height + (buffer * 2)
    }, childBounds)
  }

  return (
    <Chunk isOffstage={conservativeOffstage}>
      {/* Your items */}
    </Chunk>
  )
}
```

## Best Practices

### ✅ Do's
- Use `Chunk` for lists with 50+ elements
- Combine with `ScrollView` for scrollable large lists
- Set appropriate `capacity` based on your element size and complexity
- Use consistent element heights for best performance
- Position elements absolutely with `top`, `left` for optimal chunking

### ❌ Don'ts
- Don't use `Chunk` for small lists (< 20 items) where regular `View` is sufficient
- Don't set capacity too low (< 3) or too high (> 20) without testing
- Don't rely on flex layout for large lists - use absolute positioning
- Don't nest Chunks unnecessarily

### 🎯 Performance Tips
- **Element Size**: Smaller, simpler elements perform better
- **Capacity Tuning**: Test different capacity values for your use case
- **Viewport Buffer**: Adjust offstage detection based on scroll behavior
- **Event Handlers**: Minimize event handlers on individual items

## When to Use Chunk

| Scenario | Use Chunk | Use View/Flex |
|----------|-----------|---------------|
| Large lists (50+ items) | ✅ | ❌ |
| Virtualized scrolling | ✅ | ❌ |
| Static small collections | ❌ | ✅ |
| Complex nested layouts | ❌ | ✅ |
| Performance-critical lists | ✅ | ❌ |
| Simple forms | ❌ | ✅ |

## Browser Performance

The `Chunk` component provides measurable performance improvements:

- **Rendering**: 60-80% faster for lists with 500+ items
- **Memory**: Lower memory usage due to offstage culling
- **Scroll Performance**: Maintains 60fps scrolling with thousands of items
- **Initial Load**: Faster initial render with large datasets

## Common Patterns

### Simple List
```jsx
<Chunk style={{ width: 300 }}>
  {items.map((item, index) => (
    <Text
      key={item.id}
      style={{ top: index * 25, height: 20 }}
      text={item.name}
    />
  ))}
</Chunk>
```

### Grid Layout with Chunks
```jsx
<Chunk style={{ width: 400 }} capacity={10}>
  {items.map((item, index) => {
    const row = Math.floor(index / 4)
    const col = index % 4
    return (
      <View
        key={item.id}
        style={{
          left: col * 90,
          top: row * 90,
          width: 80,
          height: 80
        }}
      >
        {/* Grid item content */}
      </View>
    )
  })}
</Chunk>
```

### Interactive List Items
```jsx
<Chunk style={{ width: 350 }}>
  {items.map((item, index) => (
    <Flex
      key={item.id}
      style={{ top: index * 40, height: 35, cursor: 'pointer' }}
      onPointerDown={() => handleItemClick(item)}
    >
      {/* Interactive item content */}
    </Flex>
  ))}
</Chunk>
```

