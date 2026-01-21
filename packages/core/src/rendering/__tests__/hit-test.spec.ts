import { HitTestResult, RenderRoot, RenderSingleChild, RenderView } from '../'
import { Point, Size, Rect } from '../../math'
import { TestRenderObject } from './test-render-object'

describe('HitTest', () => {

  test('should works', () => {
    //
    // 构造结构
    //         (x, y, w, h)
    //  canvas (0, 0, 0, 0) RenderRoot
    //   \
    //    root (0, 0, 0, 0) 逻辑根节点
    //     \
    //      a (0, 100, 100, 100)
    //     / \
    //    b   c
    //
    //   其中
    //      b (0, 0, 100, 80)
    //      c (0, 70, 100, 80) - 与 b 在 y 轴有重叠
    //

    const canvas = new RenderRoot()
    canvas.prepareInitialFrame()
    canvas.offstage = false
    canvas.dpr = 2

    const root = new RenderSingleChild()
    root.offstage = false
    canvas.child = root

    const a = new RenderView()
    a.offstage = false
    a.size = Size.fromWH(120, 100)
    root.child = a

    const b = new TestRenderObject()
    b.offstage = false
    b.size = Size.fromWH(100, 80)
    b.offset = Point.fromXY(0, 0)
    a.appendChild(b)


    const c = new TestRenderObject()
    c.offstage = false
    c.size = Size.fromWH(100, 80)
    c.offset = Point.fromXY(0, 70)
    a.appendChild(c)

    // 由于 a 具有 Size，所以命中 a 也可以得到响应
    {
      const result = new HitTestResult()
      canvas.hitTest(result, Point.fromXY(101, 0))
      expect(result.path[0].target).toBe(a)
      expect(result.path[1].target).toBe(root)
      expect(result.path[2].target).toBe(canvas)
      expect(result.path).toHaveLength(3)
    }

    // 命中 b
    {
      const result = new HitTestResult()
      canvas.hitTest(result, Point.fromXY(0, 0))
      expect(result.path[0].target).toBe(b)
      expect(result.path[1].target).toBe(a)
      expect(result.path[2].target).toBe(root)
      expect(result.path[3].target).toBe(canvas)
      expect(result.path).toHaveLength(4)
    }

    // 命中 c
    {
      const result = new HitTestResult()
      canvas.hitTest(result, Point.fromXY(0, 70))
      expect(result.path[0].target).toBe(c)
      expect(result.path[1].target).toBe(a)
      expect(result.path[2].target).toBe(root)
      expect(result.path[3].target).toBe(canvas)
      expect(result.path).toHaveLength(4)
    }

    // 修改 a.offset
    a.offset = Point.fromXY(0, 100)

    // 命中不到 b
    {
      const result = new HitTestResult()
      canvas.hitTest(result, Point.fromXY(0, 0))
      expect(result.path[0].target).toBe(canvas)
      expect(result.path).toHaveLength(1)
    }

    // 命中得到 b
    {
      const result = new HitTestResult()
      canvas.hitTest(result, Point.fromXY(0, 100))
      expect(result.path[0].target).toBe(b)
      expect(result.path[1].target).toBe(a)
      expect(result.path[2].target).toBe(root)
      expect(result.path[3].target).toBe(canvas)
      expect(result.path).toHaveLength(4)
    }

    // 修改 viewport
    a.viewport = Rect.fromLTWH(0, 71, 50, 50)

    // 受到视口影响，现在可以命中到 c
    {
      const result = new HitTestResult()
      canvas.hitTest(result, Point.fromXY(0, 100))
      expect(result.path[0].target).toBe(c)
      expect(result.path[1].target).toBe(a)
      expect(result.path[2].target).toBe(root)
      expect(result.path[3].target).toBe(canvas)
      expect(result.path).toHaveLength(4)
    }
  })

})
