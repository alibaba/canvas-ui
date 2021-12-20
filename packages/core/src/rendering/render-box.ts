import { hasOwn } from '../utils'
import { BoxDecorator } from './box-decorator'
import { BoxShadow } from './box-shadow'
import { ParentData, RenderObject } from './render-object'
import { StyleMap } from './style-map'

export abstract class RenderBox<ParentDataType extends ParentData = ParentData>
  extends RenderObject<ParentDataType> {

  protected override trackStyle() {
    super.trackStyle()
    this.style.on('boxShadow', this.handleBoxShadowChange, this)
    this.style.on('borderWidth', this.handleBorderWidthChange, this)
    this.style.on('borderColor', this.handleBorderColorChange, this)
    this.style.on('borderImage', this.handleBorderImageChange, this)
    this.style.on('borderRadius', this.handleBorderRadiusChange, this)
    this.style.on('backgroundColor', this.handleBackgroundColorChange, this)
    this.style.on('backgroundImage', this.handleBackgroundImageChange, this)
    if (hasOwn(this.style, 'boxShadow')) {
      this.handleBoxShadowChange(this.style.boxShadow)
    }
    if (hasOwn(this.style, 'borderWidth')) {
      this.handleBorderWidthChange(this.style.borderWidth)
    }
    if (hasOwn(this.style, 'borderColor')) {
      this.handleBorderColorChange(this.style.borderColor)
    }
    if (hasOwn(this.style, 'borderImage')) {
      this.handleBorderImageChange(this.style.borderImage)
    }
    if (hasOwn(this.style, 'borderRadius')) {
      this.handleBorderRadiusChange(this.style.borderRadius)
    }
    if (hasOwn(this.style, 'backgroundColor')) {
      this.handleBackgroundColorChange(this.style.backgroundColor)
    }
    if (hasOwn(this.style, 'backgroundImage')) {
      this.handleBackgroundImageChange(this.style.backgroundImage)
    }
  }

  protected get boxDecorator() {
    return this._boxDecorator ??= new BoxDecorator()
  }
  _boxDecorator?: BoxDecorator

  protected handleBoxShadowChange(value: StyleMap['boxShadow']) {
    if (value) {
      this.boxDecorator.boxShadow = BoxShadow.fromCss(value)
    } else {
      this.boxDecorator.boxShadow = undefined
    }
    this.markPaintDirty()
  }

  protected handleBorderWidthChange(value: StyleMap['borderWidth']) {
    if (value) {
      this.boxDecorator.borderWidth = value
    } else {
      this.boxDecorator.borderWidth = undefined
    }
    this.markPaintDirty()
  }

  protected handleBorderColorChange(value: StyleMap['borderColor']) {
    if (value) {
      this.boxDecorator.borderColor = value
    } else {
      this.boxDecorator.borderColor = undefined
    }
    this.markPaintDirty()
  }

  protected handleBorderImageChange(value: StyleMap['borderImage']) {
    if (value) {
      this.boxDecorator.borderImage = value
    } else {
      this.boxDecorator.borderImage = undefined
    }
    this.markPaintDirty()
  }


  protected handleBorderRadiusChange(value: StyleMap['borderRadius']) {
    if (value) {
      this.boxDecorator.borderRadius = value
    } else {
      this.boxDecorator.borderRadius = undefined
    }
    this.markPaintDirty()
  }

  protected handleBackgroundColorChange(value: StyleMap['backgroundColor']) {
    if (value) {
      this.boxDecorator.backgroundColor = value
    } else {
      this.boxDecorator.backgroundColor = undefined
    }
    this.markPaintDirty()
  }

  protected handleBackgroundImageChange(value: StyleMap['backgroundImage']) {
    if (value) {
      this.boxDecorator.backgroundImage = value
    } else {
      this.boxDecorator.backgroundImage = undefined
    }
    this.markPaintDirty()
  }

}
