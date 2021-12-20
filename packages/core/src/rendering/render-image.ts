import assert from 'assert'
import { Image } from '../canvas'
import { Point, Size } from '../math'
import { PaintingContext } from './painting-context'
import { RenderBox } from './render-box'

type URL = string

export type RenderImageSrc =
  | URL
  | CanvasImageSource

export class RenderImage extends RenderBox {

  crossOrigin: HTMLImageElement['crossOrigin'] = null

  get src() {
    return this._src
  }
  set src(value) {
    if (value !== this._src) {
      if (this._src) {
        this.image = undefined
      }
      this._src = value
      if (this._src) {
        if (typeof this._src === 'string') {
          this.loader.src = this._src
          this.loader.onload = () => {
            assert(this._loader)
            this.image = Image.from(this._loader)
          }
        } else {
          this.image = Image.from(this._src)
        }
      }
    }
  }
  private _src?: string

  private _loader?: HTMLImageElement
  get loader() {
    if (this._loader) {
      return this._loader
    }
    this._loader = new self.Image()
    this._loader.crossOrigin = this.crossOrigin
    return this._loader
  }

  private _image?: Image
  get image() {
    return this._image
  }
  set image(value) {
    if (value !== this._image) {
      if (this._image) {
        this.markPaintDirty()
      }
      this._image = value
      if (this._image) {
        if (!this.sizeSpecified) {
          // 如果没有设置 style.width 和 style.height 则会触发布局
          // 直接调用 style 的监听函数是为了避免向 style 写宽高
          this.handleWidthChange(this._image.width)
          this.handleHeightChange(this._image.height)
        } else {
          // 否则，只需更新节点即可
          this.markPaintDirty()
        }
      }
    }
  }

  private get sizeSpecified(): boolean {
    return this.style.has('width') && this.style.has('height')
  }

  paint(context: PaintingContext, offset: Point) {
    const hasSize = !Size.isZero(this._size)
    const { _boxDecorator } = this
    if (hasSize) {
      _boxDecorator?.paintBackground(context, offset, this._size)
    }
    if (this._image) {
      if (_boxDecorator) {
        _boxDecorator.clipBorderRadiusAndPaint(
          context,
          this._needsCompositing,
          offset,
          this._size,
          this._paint,
          this,
        )
      } else {
        this._paint(context, offset)
      }
    }
    if (hasSize) {
      _boxDecorator?.paintBorder(context, offset, this._size)
    }
  }

  private _paint(context: PaintingContext, offset: Point) {
    assert(this._image)
    context.canvas.drawImage(
      this._image,
      offset.x,
      offset.y,
      this._size.width,
      this._size.height,
    )
  }

  protected override updateOffsetAndSizeFromStyle() {
    super.updateOffsetAndSizeFromStyle()
    // 如果没有设置宽高，则使用 image 的宽高
    if (
      this._image
      && !this.sizeSpecified
    ) {
      this.size = Size.fromWH(this._image.width, this._image.height)
    }
  }

  visitChildren() { }

  protected redepthChildren() { }

  override hitTestSelf() {
    // RenderImage 没有子节点，所以他们总是命中自己
    // todo(haocong): 根据形状进一步 hitTest
    return true
  }

}
