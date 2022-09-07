import { assert } from '@canvas-ui/assert'
import { Log } from '../foundation'
import type { RenderObject } from '.'
import { PaintingContext } from './painting-context'

export class RenderPipeline {

  constructor(
    private readonly onRequestVisualUpdate: () => void
  ) {
  }

  private _rootNode?: RenderObject | undefined
  get rootNode() {
    return this._rootNode
  }
  set rootNode(value: RenderObject | undefined) {
    if (value === this._rootNode) {
      return
    }
    this._rootNode?.detach()
    this._rootNode = value
    this._rootNode?.attach(this)
  }

  private paintDirtyObjects: RenderObject[] = []

  private needsCompositingDirtyObjects: RenderObject[] = []

  private layoutDirtyObjects: RenderObject[] = []

  private enterFrameObjects: RenderObject[] = []

  get debugPaintDirtyObjects() {
    return this.paintDirtyObjects
  }

  get debugNeedsCompositingDirtyObjects() {
    return this.needsCompositingDirtyObjects
  }

  get debugLayoutDirtyObjects() {
    return this.layoutDirtyObjects
  }

  addEnterFrame(object: RenderObject) {
    if (this.enterFrameObjects.indexOf(object) === -1) {
      this.enterFrameObjects.push(object)
    }
  }

  @Log({ disabled: true })
  addLayoutDirty(object: RenderObject): void {
    if (this.layoutDirtyObjects.indexOf(object) === -1) {
      this.layoutDirtyObjects.push(object)
    }
  }

  addNeedsCompositingDirty(object: RenderObject): void {
    if (this.needsCompositingDirtyObjects.indexOf(object) === -1) {
      this.needsCompositingDirtyObjects.push(object)
    }
  }

  @Log({ disabled: true })
  addPaintDirty(object: RenderObject): void {
    if (this.paintDirtyObjects.indexOf(object) === -1) {
      this.paintDirtyObjects.push(object)
    }
  }

  requestVisualUpdate() {
    this.onRequestVisualUpdate()
  }

  flushEnterFrame() {
    const enterFrameObjects = this.enterFrameObjects
    this.enterFrameObjects = []
    const n = enterFrameObjects.length
    for (let i = 0; i < n; i++) {
      const object = enterFrameObjects[i]
      object.unstable_enterFrame()
    }
  }

  flushLayout() {
    while (this.layoutDirtyObjects.length > 0) {
      const dirtyObjects = this.layoutDirtyObjects
      this.layoutDirtyObjects = []
      dirtyObjects.sort((a, b) => {
        return a.depth - b.depth // 从外层布局到内层
      })
      const n = dirtyObjects.length
      for (let i = 0; i < n; i++) {
        const object = dirtyObjects[i]
        if (object._layoutDirty && object.owner === this) {
          object.layoutAsBoundary()
        }
      }
    }
  }

  flushNeedsCompositing() {
    this.needsCompositingDirtyObjects.sort((a, b) => {
      return a.depth - b.depth
    })
    const n = this.needsCompositingDirtyObjects.length
    for (let i = 0; i < n; i++) {
      const object = this.needsCompositingDirtyObjects[i]
      if (object._needsCompositingDirty && object.owner === this) {
        object.updateNeedsCompositing()
      }
    }
    this.needsCompositingDirtyObjects = []
  }

  flushPaint() {
    const dirtyObjects = this.paintDirtyObjects
    this.paintDirtyObjects = []
    dirtyObjects.sort((a, b) => {
      return b.depth - a.depth // 从内层绘制到外层
    })
    const n = dirtyObjects.length
    for (let i = 0; i < n; i++) {
      const object = dirtyObjects[i]
      if (object._paintDirty && object.owner === this) {
        if (object._layer!.attached) {
          PaintingContext.repaintCompositedChild(object)
        } else {
          object.skipPaint()
        }
      }
    }
    assert(this.paintDirtyObjects.length === 0, 'flushPaint 结束后仍有节点没有被绘制')
  }

}
