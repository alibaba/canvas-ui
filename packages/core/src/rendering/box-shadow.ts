import { Property } from 'csstype'
import type { Paint } from '../canvas'
import { Mut, NonConstructiable } from '../foundation'

export interface BoxShadow {
  color: string
  offsetX: number
  offsetY: number
  blur: number
}

export class BoxShadow extends NonConstructiable {

  static fromCss(boxShadowProp: Property.BoxShadow): BoxShadow {
    const prop = boxShadowProp.trim()
    const offsetsAndBlur = offsetsAndBlurPattern.exec(prop) || []

    const color = prop.replace(offsetsAndBlurPattern, '').trim() || 'rgb(0,0,0)'
    const offsetX = parseFloat(offsetsAndBlur[1]) || 0
    const offsetY = parseFloat(offsetsAndBlur[2]) || 0
    const blur = parseFloat(offsetsAndBlur[3]) || 0

    return {
      color,
      offsetX,
      offsetY,
      blur,
    }
  }

  static applyToPaint(boxShadow: BoxShadow, paint: Mut<Paint>) {
    paint.shadowBlur = boxShadow.blur
    paint.shadowColor = boxShadow.color
    paint.shadowOffsetX = boxShadow.offsetX
    paint.shadowOffsetY = boxShadow.offsetY
  }

}


// https://github1s.com/fabricjs/fabric.js/blob/master/src/shadow.class.js
const offsetsAndBlurPattern = /(?:\s|^)(-?\d+(?:\.\d*)?(?:px)?(?:\s?|$))?(-?\d+(?:\.\d*)?(?:px)?(?:\s?|$))?(\d+(?:\.\d*)?(?:px)?)?(?:\s?|$)(?:$|\s)/
