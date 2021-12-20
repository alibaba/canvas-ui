import type {
  Canvas,
  Image,
  Picture
} from '../canvas'
import { DebugFlags } from '../debug'
import { Matrix, Rect, Size } from '../math'
import { Surface } from '../surface'

export type RasterCacheKey = string

export type RasterCacheEntry = {
  key: RasterCacheKey
  usedThisFrame: boolean
  accessCount: number
  failed: boolean
  result?: RasterCacheResult
}

export class RasterCacheResult {

  constructor(
    private readonly image: Image,
    private readonly paintBounds: Rect,
    readonly surface?: Surface,
  ) { }

  /**
   * 将缓存的内容绘制到 Canvas 上，如果绘制成功返回 true，否则返回 false
   * 
   * todo(haocong): 增加 canvas.getTransform 方法，避免传递 matrix
   */
  draw(canvas: Canvas, matrix: Matrix) {
    canvas.save()
    const bounds = RasterCache.getCacheBounds(this.paintBounds, matrix)
    canvas.resetTransform()
    canvas.drawImage(this.image, bounds.left, bounds.top)
    canvas.restore()
  }

}


class SurfacePool {

  private nodes: Surface[] = []

  constructor(readonly capacity = 4) {

  }

  take() {
    if (this.nodes.length > 0) {
      return this.nodes.pop()!
    } else {
      return Surface.makeOffscreenCanvasSurface()
    }
  }

  return(surface: Surface) {
    if (this.nodes.length < this.capacity) {
      this.nodes.push(surface)
    }
  }
}


export class RasterCache {

  static readonly DEFAULT_ACCESS_THRESHOLD = 3

  static readonly DEFAULT_PICTURE_CACHE_LIMIT_PER_FRAME = 1

  /**
   * 缓存的大小，默认值是 5 分之一 4K 分辨率
   * 
   * 例如，如长边为 8192px，短边最大可以是 101
   */
  static readonly DEFAULT_PICTURE_CACHE_AREA = 3840 * 2160 / 5

  /**
   * 缓存的最大边长
   */
  static readonly DEFAULT_PICTURE_CACHE_LONG_SIDE = 8192

  static readonly DEFAULT_SURFACE_POOL_CAPACITY = 4

  /**
   * 当 Picture 的 drawOps 超过该数值时，视为复杂的 Picture，可以被缓存，否则不会被缓存
   */
  static readonly COMPLEX_PICTURE = 5

  private static readonly surfacePool = new SurfacePool(RasterCache.DEFAULT_SURFACE_POOL_CAPACITY)

  protected entries = new Map<RasterCacheKey, RasterCacheEntry>()

  private accessThreshold = RasterCache.DEFAULT_ACCESS_THRESHOLD

  private pictureCacheLimitPerFrame = RasterCache.DEFAULT_PICTURE_CACHE_LIMIT_PER_FRAME

  private pictureCachedThisFrame = 0

  protected onDeleteEntry(entry: RasterCacheEntry) {
    if (entry.result?.surface) {
      RasterCache.surfacePool.return(entry.result.surface)
    }
  }

  prepareBeforeFrame() {
  }

  sweepAfterFrame() {
    const iterator = this.entries[Symbol.iterator]()
    let ptr = iterator.next()
    while (!ptr.done) {
      const { value: [key, entry] } = ptr
      if (!entry.usedThisFrame) {
        this.entries.delete(key)
        this.onDeleteEntry?.(entry)
      }
      entry.usedThisFrame = false
      ptr = iterator.next()
    }
    this.pictureCachedThisFrame = 0
  }

  private getOrCreateRasterCacheEntry(
    picture: Picture,
    matrix: Matrix,
  ) {
    const cacheKey = RasterCache.getCacheKey(picture, matrix)
    let entry = this.entries.get(cacheKey)
    if (entry) {
      return entry
    }
    entry = {
      key: cacheKey,
      usedThisFrame: false,
      accessCount: 0,
      failed: false,
    }
    this.entries.set(cacheKey, entry)
    return entry
  }

  private getRasterCacheEntry(
    picture: Picture,
    matrix: Matrix,
  ) {
    const cacheKey = RasterCache.getCacheKey(picture, matrix)
    return this.entries.get(cacheKey)
  }

  prepare(picture: Picture, matrix: Matrix, willChange: boolean): boolean {
    // RasterCache 关闭了
    if (this.accessThreshold === 0) {
      return false
    }

    // 到达每帧可缓存的上限
    if (this.pictureCachedThisFrame >= this.pictureCacheLimitPerFrame) {
      return false
    }

    // 频繁变化的 picture
    if (willChange) {
      return false
    }

    // 不够复杂的 Picture (drawOps 太少且不绘制文本)
    if (
      picture.drawOps.length < RasterCache.COMPLEX_PICTURE
      && !picture.hasDrawText
    ) {
      return false
    }

    const entry = this.getOrCreateRasterCacheEntry(picture, matrix)

    // 不需要缓存：因为之前尝试过但是失败了 (Picture 太大了)
    if (entry.failed) {
      return false
    }

    // 不需要缓存：因为访问还不够频繁
    if (entry.accessCount < this.accessThreshold) {
      return false
    }

    // 创建缓存
    if (!entry.result) {
      this.updateCacheResult(entry, picture, matrix)
      this.pictureCachedThisFrame++
    }

    return false
  }

  protected updateCacheResult(entry: RasterCacheEntry, picture: Picture, matrix: Matrix) {
    entry.result = RasterCache.rasterizePicture(picture, matrix)
    entry.failed = !entry.result
  }

  static rasterizePicture(picture: Picture, matrix: Matrix) {
    const cacheBounds = RasterCache.getCacheBounds(picture.cullRect, matrix)

    // 太大了
    if (
      cacheBounds.width > RasterCache.DEFAULT_PICTURE_CACHE_LONG_SIDE
      || cacheBounds.height > RasterCache.DEFAULT_PICTURE_CACHE_LONG_SIDE
      || cacheBounds.width * cacheBounds.height > RasterCache.DEFAULT_PICTURE_CACHE_AREA) {
      return undefined
    }

    const surface = RasterCache.surfacePool.take()
    const frame = surface.acquireFrame(Size.fromWH(cacheBounds.width, cacheBounds.height))
    const canvas = frame.canvas

    // 从池子里拿出来的 frame，可能留有上一帧的渲染结果，需要手动 reset
    canvas.resetTransform()
    canvas.clear()

    // 然后执行缓存的绘制
    canvas.translate(-cacheBounds.left, -cacheBounds.top)
    canvas.transform(matrix)
    canvas.drawPicture(picture)
    if (DebugFlags.paintRasterCacheWaterMark) {
      canvas.resetTransform()
      canvas.debugDrawCheckerboard(1)
    }
    return new RasterCacheResult(
      surface.toImage(),
      picture.cullRect,
      surface,
    )
  }

  // todo(haocong): 增加 canvas.getTransform 方法，避免传递 matrix
  drawPicture(picture: Picture, canvas: Canvas, matrix: Matrix): boolean {
    const entry = this.getRasterCacheEntry(picture, matrix)
    if (!entry) {
      return false
    }
    entry.accessCount++
    entry.usedThisFrame = true

    if (entry.result) {
      entry.result.draw(canvas, matrix)
      return true
    }
    return false
  }

  static getCacheBounds(bounds: Rect, matrix: Matrix) {
    return Rect.roundOut(
      Matrix.transformRect(matrix, bounds)
    )
  }

  static getCacheKey(picture: Picture, matrix: Matrix): RasterCacheKey {
    return picture.id + Matrix.setTranslate(matrix, 0, 0).values.toString()
  }

}
