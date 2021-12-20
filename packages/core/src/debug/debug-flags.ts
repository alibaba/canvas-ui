export class DebugFlags {

  /**
   * 是否绘制图层边框
   */
  static LayerBounds = 1 << 0

  /**
   * 是否绘制节点边框
   */
  static NodeBounds = 1 << 1

  /**
   * 是否绘制节点 id
   */
  static NodeId = 1 << 2

  /**
   * 是否绘制文本边框
   */
  static TextLineBounds = 1 << 3

  /**
   * 是否绘制缓存水印
   */
  static RasterCacheWaterMark = 1 << 4

  /**
   * 是否绘制路径的包围盒
   */
  static PathBounds = 1 << 5

  static set(flags: number) {
    DebugFlags.paintLayerBounds = (flags & DebugFlags.LayerBounds) !== 0
    DebugFlags.paintNodeBounds = (flags & DebugFlags.NodeBounds) !== 0
    DebugFlags.paintNodeId = (flags & DebugFlags.NodeId) !== 0
    DebugFlags.paintTextLineBounds = (flags & DebugFlags.TextLineBounds) !== 0
    DebugFlags.paintRasterCacheWaterMark = (flags & DebugFlags.RasterCacheWaterMark) !== 0
    DebugFlags.paintPathBounds = (flags & DebugFlags.PathBounds) !== 0
  }

  /**
   * @internal
   */
  static paintLayerBounds = false

  /**
   * @internal
   */
  static paintNodeBounds = false

  /**
   * @internal
   */
  static paintNodeId = false

  /**
   * @internal
   */
  static paintTextLineBounds = false

  /**
   * @internal
   */
  static paintRasterCacheWaterMark = false

  /**
   * @internal
   */
  static paintPathBounds = false
}
