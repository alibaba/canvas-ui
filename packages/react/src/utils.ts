/* eslint-disable no-prototype-builtins */
/* eslint eqeqeq: ["error", "smart"] */

import { ElementType, RenderText } from '@canvas-ui/core'
import assert from 'assert'

export type UpdatePayload = any[]

type StyleProps = Record<string, string | number | undefined>

export type AnyProps = Record<string, any>

type AnyElement = Record<string, any>

const enum PropKey {
  Style = 'style',
  Children = 'children',
}

export function diffProps(
  oldProps: AnyProps,
  newProps: AnyProps,
): null | UpdatePayload {

  let updatePayload: null | any[] = null
  let propKey: string
  let styleName: string
  let styleUpdates: null | StyleProps = null

  // 寻找 oldProps 有但 newProps 中没有的，视为属性的删除
  for (propKey in oldProps) {
    if (
      newProps.hasOwnProperty(propKey)
      || !oldProps.hasOwnProperty(propKey)
      || oldProps[propKey] == null
    ) {
      continue
    }
    if (propKey === PropKey.Style) {
      // 如果 newProps 中没有 style 属性，视为删除了旧 style 中所有属性
      const oldStyle = oldProps[propKey]
      for (styleName in oldStyle) {
        if (oldStyle.hasOwnProperty(styleName)) {
          if (!styleUpdates) {
            styleUpdates = {}
          }
          styleUpdates[styleName] = undefined
        }
      }
    } else if (propKey === PropKey.Children) {
      // 跳过 children 的处理
    } else {
      (updatePayload = updatePayload || []).push(propKey, null)
    }
  }

  // 寻找 newProps 中有的属性，视为属性的新增或更新
  for (propKey in newProps) {
    const newProp = newProps[propKey]
    const oldProp = oldProps != null ? oldProps[propKey] : undefined
    if (
      !newProps.hasOwnProperty(propKey) ||
      newProp === oldProp ||
      (newProp == null && oldProp == null)
    ) {
      continue
    }
    // 特殊处理 style
    if (propKey === PropKey.Style) {
      if (oldProp) {
        // 删除先前样式中有但新样式中没有的
        for (styleName in oldProp) {
          if (
            oldProp.hasOwnProperty(styleName) &&
            (!newProp || !newProp.hasOwnProperty(styleName))
          ) {
            if (!styleUpdates) {
              styleUpdates = {}
            }
            // 通过设置样式值为 undefined 以删除该样式
            styleUpdates[styleName] = undefined
          }
        }
        // 更新与 lastProps 中不同的样式
        for (styleName in newProp) {
          if (
            newProp.hasOwnProperty(styleName) &&
            oldProp[styleName] !== newProp[styleName]
          ) {
            if (!styleUpdates) {
              styleUpdates = {}
            }
            styleUpdates[styleName] = newProp[styleName]
          }
        }
      } else {
        // 否则只需简单全部采用新属性即可
        if (!styleUpdates) {
          if (!updatePayload) {
            updatePayload = []
          }
          updatePayload.push(propKey, styleUpdates)
        }
        styleUpdates = newProp
      }
    } else if (propKey === PropKey.Children) {
      // string 和 number 类型的 children 通常是文本，我们在这里统一转换成 string
      if (typeof newProp === 'string' || typeof newProp === 'number') {
        (updatePayload = updatePayload || []).push(propKey, '' + newProp)
      }
    } else {
      // For any other property we always add it to the queue and then we
      // filter it out using the allowed property list during the commit.
      (updatePayload = updatePayload || []).push(propKey, newProp)
    }
  }
  if (styleUpdates) {
    (updatePayload = updatePayload || []).push(PropKey.Style, styleUpdates)
  }

  return updatePayload
}

export function setInitialProps(_type: ElementType, node: AnyElement, props: AnyProps) {
  for (const propKey in props) {
    const nextProp = props[propKey]
    if (propKey === PropKey.Style) {
      // 样式
      setStyle(node, nextProp)
    } else if (propKey === PropKey.Children) {
      // 文本
      if (typeof nextProp === 'string') {
        setText(node, nextProp)
      } else if (typeof nextProp === 'number') {
        setText(node, '' + nextProp)
      }
    } else {
      // 其他属性
      setProp(node, propKey, nextProp)
    }
  }
}

export function updateProps(
  node: AnyElement,
  updatePayload: UpdatePayload,
) {
  for (let i = 0; i < updatePayload.length; i += 2) {
    const propKey = updatePayload[i]
    const propValue = updatePayload[i + 1]
    if (propKey === PropKey.Style) {
      setStyle(node, propValue)
    } else if (propKey === PropKey.Children) {
      setText(node, propValue)
    } else {
      setProp(node, propKey, propValue)
    }
  }
}

function setProp(
  node: AnyElement,
  key: string,
  value: AnyProps,
) {
  node[key] = value
}

export function setText(node: AnyElement, text: string) {
  assert(node instanceof RenderText)
  node.text = text
}

function setStyle(node: AnyElement, nextStyle: StyleProps) {
  const { style } = node
  for (const styleName in nextStyle) {
    style[styleName] = nextStyle[styleName]
  }
}
