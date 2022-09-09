---
sidebar_position: 3
---

# Flex

The `Flex` component is a container node that supports flexible box layout, providing powerful and intuitive layout capabilities for arranging child elements. It follows CSS flexbox principles, making it easy to create responsive and adaptive layouts.

## Features

- **Flexible Layout**: Automatically adjusts child element sizes and positions based on available space
- **Direction Control**: Supports row and column layout directions
- **Alignment Options**: Comprehensive alignment control for both main and cross axes
- **Responsive Design**: Adapts to different screen sizes and container dimensions
- **Space Distribution**: Advanced options for distributing space between and around items
- **Wrapping Support**: Allows items to wrap to new lines when needed

## Basic Usage

### Simple Row Layout

```jsx live
function BasicRowExample() {
  const { Canvas, Flex, Text } = importCanvasUIPackages();

  return (
    <div style={{ width: 400, height: 100 }}>
      <Canvas>
        <Flex
          style={{
            width: 400,
            height: 100,
            backgroundColor: "lightblue",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center"
          }}
        >
          <Text text="Item 1" style={{ fontSize: 16, color: "black" }} />
          <Text text="Item 2" style={{ fontSize: 16, color: "black" }} />
          <Text text="Item 3" style={{ fontSize: 16, color: "black" }} />
        </Flex>
      </Canvas>
    </div>
  );
}
```

### Simple Column Layout

```jsx live
function BasicColumnExample() {
  const { Canvas, Flex, Text } = importCanvasUIPackages();

  return (
    <div style={{ width: 300, height: 200 }}>
      <Canvas>
        <Flex
          style={{
            width: 300,
            height: 200,
            backgroundColor: "lightgreen",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Text text="Header" style={{ fontSize: 18, color: "black" }} />
          <Text text="Content" style={{ fontSize: 16, color: "black" }} />
          <Text text="Footer" style={{ fontSize: 14, color: "black" }} />
        </Flex>
      </Canvas>
    </div>
  );
}
```

## Advanced Examples

### Nested Flex Layout

```jsx live
function NestedFlexExample() {
  const { Canvas, Flex, Text } = importCanvasUIPackages();

  return (
    <div style={{ width: 400, height: 200 }}>
      <Canvas>
        <Flex
          style={{
            width: 400,
            height: 200,
            backgroundColor: "lightgray",
            flexDirection: "column"
          }}
        >
          {/* Header */}
          <Flex
            style={{
              width: 400,
              height: 50,
              backgroundColor: "darkblue",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text text="Header" style={{ fontSize: 18, color: "white" }} />
          </Flex>

          {/* Main Content */}
          <Flex
            style={{
              width: 400,
              height: 100,
              backgroundColor: "white",
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center"
            }}
          >
            <Text text="Left" style={{ fontSize: 16, color: "black" }} />
            <Text text="Center" style={{ fontSize: 16, color: "black" }} />
            <Text text="Right" style={{ fontSize: 16, color: "black" }} />
          </Flex>

          {/* Footer */}
          <Flex
            style={{
              width: 400,
              height: 50,
              backgroundColor: "darkgreen",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text text="Footer" style={{ fontSize: 14, color: "white" }} />
          </Flex>
        </Flex>
      </Canvas>
    </div>
  );
}
```

### Responsive Card Layout

```jsx live
function ResponsiveCardExample() {
  const { Canvas, Flex, Text, View } = importCanvasUIPackages();

  return (
    <div style={{ width: 450, height: 250 }}>
      <Canvas>
        <Flex
          style={{
            width: 450,
            height: 250,
            backgroundColor: "whitesmoke",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-around",
            alignItems: "flex-start",
            padding: 10
          }}
        >
          {[1, 2, 3, 4].map(num => (
            <Flex
              key={num}
              style={{
                width: 100,
                height: 80,
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: 8,
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                margin: 5
              }}
            >
              <Text text={`Card ${num}`} style={{ fontSize: 14, color: "black" }} />
              <Text text="Content" style={{ fontSize: 12, color: "gray" }} />
            </Flex>
          ))}
        </Flex>
      </Canvas>
    </div>
  );
}
```

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `flexDirection` | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'` | `'row'` | Defines the main axis direction |
| `justifyContent` | `'flex-start' \| 'flex-end' \| 'center' \| 'space-between' \| 'space-around' \| 'space-evenly'` | `'flex-start'` | Aligns items along the main axis |
| `alignItems` | `'flex-start' \| 'flex-end' \| 'center' \| 'stretch' \| 'baseline'` | `'stretch'` | Aligns items along the cross axis |
| `alignContent` | `'flex-start' \| 'flex-end' \| 'center' \| 'stretch' \| 'space-between' \| 'space-around'` | `'stretch'` | Aligns wrapped lines |
| `flexWrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | `'nowrap'` | Controls whether items wrap to new lines |
| `gap` | `number` | `0` | Space between items |
| `rowGap` | `number` | `gap` | Space between rows |
| `columnGap` | `number` | `gap` | Space between columns |
| `padding` | `number \| string` | `0` | Internal spacing |
| `margin` | `number \| string` | `0` | External spacing |

### Child Item Props

These props can be applied to direct children of Flex:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `flex` | `number \| string` | `'0 1 auto'` | Flex grow, shrink, and basis shorthand |
| `flexGrow` | `number` | `0` | How much the item should grow |
| `flexShrink` | `number` | `1` | How much the item should shrink |
| `flexBasis` | `number \| string` | `'auto'` | Initial size before free space is distributed |
| `alignSelf` | `'auto' \| 'flex-start' \| 'flex-end' \| 'center' \| 'stretch' \| 'baseline'` | `'auto'` | Override alignItems for this item |

## Layout Patterns

### Equal Width Columns

```jsx live
function EqualColumnsExample() {
  const { Canvas, Flex, Text } = importCanvasUIPackages();

  return (
    <div style={{ width: 400, height: 120 }}>
      <Canvas>
        <Flex
          style={{
            width: 400,
            height: 120,
            backgroundColor: "lavender",
            flexDirection: "row"
          }}
        >
          <Flex
            style={{
              flex: 1,
              height: 120,
              backgroundColor: "lightcoral",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text text="Column 1" style={{ fontSize: 14, color: "white" }} />
          </Flex>
          <Flex
            style={{
              flex: 1,
              height: 120,
              backgroundColor: "lightseagreen",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text text="Column 2" style={{ fontSize: 14, color: "white" }} />
          </Flex>
          <Flex
            style={{
              flex: 1,
              height: 120,
              backgroundColor: "lightsalmon",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text text="Column 3" style={{ fontSize: 14, color: "white" }} />
          </Flex>
        </Flex>
      </Canvas>
    </div>
  );
}
```

### Sidebar Layout

```jsx live
function SidebarLayoutExample() {
  const { Canvas, Flex, Text } = importCanvasUIPackages();

  return (
    <div style={{ width: 400, height: 200 }}>
      <Canvas>
        <Flex
          style={{
            width: 400,
            height: 200,
            backgroundColor: "whitesmoke",
            flexDirection: "row"
          }}
        >
          {/* Sidebar */}
          <Flex
            style={{
              width: 100,
              height: 200,
              backgroundColor: "darkslategray",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text text="Sidebar" style={{ fontSize: 14, color: "white" }} />
          </Flex>

          {/* Main Content */}
          <Flex
            style={{
              flex: 1,
              height: 200,
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
              padding: 20
            }}
          >
            <Text text="Main Content Area" style={{ fontSize: 16, color: "black" }} />
          </Flex>
        </Flex>
      </Canvas>
    </div>
  );
}
```

## Best Practices

### Performance Optimization

1. **Minimize Nesting**: Avoid excessive flex container nesting for better performance
2. **Use Specific Dimensions**: Provide explicit widths/heights when possible to reduce layout calculations
3. **Optimize Flex Properties**: Use `flex-shrink: 0` on items that shouldn't shrink to prevent unnecessary calculations

### Responsive Design

1. **Flexible Units**: Use flex properties instead of fixed dimensions for responsive layouts
2. **Wrap Strategy**: Use `flexWrap` appropriately for different screen sizes
3. **Gap Properties**: Use gap instead of margins for consistent spacing

## Common Use Cases

### Navigation Bar

```jsx live
function NavigationExample() {
  const { Canvas, Flex, Text } = importCanvasUIPackages();

  return (
    <div style={{ width: 500, height: 60 }}>
      <Canvas>
        <Flex
          style={{
            width: 500,
            height: 60,
            backgroundColor: "navy",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 10
          }}
        >
          <Text text="Logo" style={{ fontSize: 18, color: "white", fontWeight: "bold" }} />

          <Flex style={{ flexDirection: "row", gap: 20 }}>
            <Text text="Home" style={{ fontSize: 14, color: "white" }} />
            <Text text="About" style={{ fontSize: 14, color: "white" }} />
            <Text text="Contact" style={{ fontSize: 14, color: "white" }} />
          </Flex>

          <Text text="Login" style={{ fontSize: 14, color: "white" }} />
        </Flex>
      </Canvas>
    </div>
  );
}
```

### Card Grid

```jsx live
function CardGridExample() {
  const { Canvas, Flex, Text } = importCanvasUIPackages();

  return (
    <div style={{ width: 400, height: 300 }}>
      <Canvas style={{ width: 400, height: 300 }}>
        <Flex
          style={{
            width: 400,
            height: 300,
            backgroundColor: "aliceblue",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-around",
            alignContent: "flex-start",
            padding: 10,
            gap: 10
          }}
        >
          {[1, 2, 3, 4, 5, 6].map(num => (
            <Flex
              key={num}
              style={{
                width: 110,
                height: 80,
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: 8,
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              <Text text={`Item ${num}`} style={{ fontSize: 12, color: "black" }} />
            </Flex>
          ))}
        </Flex>
      </Canvas>
    </div>
  );
}
```

The Flex component provides a powerful and flexible layout system that adapts to various design requirements while maintaining excellent performance characteristics.


