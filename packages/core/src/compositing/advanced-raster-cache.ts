import ShelfPack from '@mapbox/shelf-pack'
import type {
  Picture
} from '../canvas'
import { DebugFlags } from '../debug'
import { Matrix, Size } from '../math'
import { Surface } from '../surface'
import { RasterCache, RasterCacheEntry, RasterCacheKey, RasterCacheResult } from './raster-cache'

class Page {

  private pack = new ShelfPack(this.width, this.height)

  private surface = Surface.makeOffscreenCanvasSurface()

  constructor(
    readonly id: number,
    readonly width: number,
    readonly height: number,
    readonly maxWidth: number,
    readonly maxHeight: number,
  ) {
  }

  rasterizePicture(key: RasterCacheKey, picture: Picture, matrix: Matrix) {
    const cacheBounds = RasterCache.getCacheBounds(picture.cullRect, matrix)
    if (cacheBounds.width > this.maxWidth || cacheBounds.height > this.maxHeight) {
      return undefined
    }
    const bin = this.pack.packOne(cacheBounds.width, cacheBounds.height, key)
    if (!bin) {
      return undefined
    }
    const frame = this.surface.acquireFrame(Size.fromWH(this.width, this.height))
    const canvas = frame.canvas
    canvas.resetTransform()
    canvas.translate(bin.x, bin.y)
    canvas.translate(-cacheBounds.left, -cacheBounds.top)
    canvas.transform(matrix)
    canvas.drawPicture(picture)
    if (DebugFlags.paintRasterCacheWaterMark) {
      canvas.debugDrawWaterMark('ADV', bin.x, bin.y, bin.w, bin.h)
    }
    return new RasterCacheResult(
      this.surface.toImage(bin.x, bin.y, bin.w, bin.h),
      picture.cullRect,
    )
  }

  delete(key: RasterCacheKey) {
    const bin = this.pack.getBin(key)
    if (bin) {
      this.pack.unref(bin)
      return true
    }
    return false
  }
}

type Job = {
  entry: RasterCacheEntry
  picture: Picture
  matrix: Matrix
}

/**
 * 高级栅格缓存，不要在 Safari 使用
 */
export class AdvancedRasterCache extends RasterCache {

  static DEFAULT_PAGE_WIDTH = 4096
  static DEFAULT_PAGE_HEIGHT = 4096
  static DEFAULT_MAX_PAGES = 1
  static MAX_WIDTH = 512
  static MAX_HEIGHT = 512

  /**
   * 暂时我们只支持一个页面
   */
  private page = new Page(
    0,
    AdvancedRasterCache.DEFAULT_PAGE_WIDTH,
    AdvancedRasterCache.DEFAULT_PAGE_HEIGHT,
    AdvancedRasterCache.MAX_WIDTH,
    AdvancedRasterCache.MAX_HEIGHT,
  )

  private jobQueue: Job[] = []

  override prepareBeforeFrame() {
    while (this.jobQueue.length) {
      const {
        entry,
        picture,
        matrix,
      } = this.jobQueue.shift()!

      // 如果页面放不下，则使用默认缓存策略
      entry.result =
        this.page.rasterizePicture(entry.key, picture, matrix)
        ?? RasterCache.rasterizePicture(picture, matrix)
    }
  }

  protected override onDeleteEntry(entry: RasterCacheEntry) {
    // 从贴图集删除贴图
    this.page.delete(entry.key)
  }

  protected override updateCacheResult(entry: RasterCacheEntry, picture: Picture, matrix: Matrix) {
    // 新增缓存任务
    entry.usedThisFrame = true
    this.jobQueue.push({
      entry,
      picture,
      matrix,
    })
  }

}
