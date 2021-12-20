import assert from 'assert'
import { RenderObject } from './render-object'
import { RenderView, ViewParentData } from './render-view'
import { StyleMap } from './style-map'
import { StyleToYoga } from './yoga'

export class FlexParentData<ChildType extends RenderObject = RenderObject> extends ViewParentData<ChildType> {

}

export class RenderFlex<ChildType extends RenderObject<FlexParentData<ChildType>> = RenderObject> extends RenderView<ChildType> {

  protected override setupParentData(child: RenderObject) {
    if (!(child.parentData instanceof FlexParentData)) {
      child.parentData = new FlexParentData()
    }
  }

  override get alwaysHoldYogaNode() {
    // RenderFlex 总是持有 yogaNode
    return true
  }

  protected override setupYogaNode() {
    super.setupYogaNode()

    // 同步容器样式
    this.handleFlexDirectionChange(this.style.flexDirection)
    this.handleFlexWrapChange(this.style.flexWrap)
    this.handleJustifyContentChange(this.style.justifyContent)
    this.handleAlignItemsChange(this.style.alignItems)
    this.handleAlignContent(this.style.alignContent)

    // 追踪变更
    this.style.on('flexDirection', this.handleFlexDirectionChange, this)
    this.style.on('flexWrap', this.handleFlexWrapChange, this)
    this.style.on('justifyContent', this.handleJustifyContentChange, this)
    this.style.on('alignItems', this.handleAlignItemsChange, this)
    this.style.on('alignContent', this.handleAlignContent, this)
  }

  private handleFlexDirectionChange(value: StyleMap['flexDirection'] = 'row') {
    assert(this.yogaNode)
    this.yogaNode.setFlexDirection(StyleToYoga.flexDirection[value])
  }

  private handleFlexWrapChange(value: StyleMap['flexWrap'] = 'nowrap') {
    assert(this.yogaNode)
    this.yogaNode.setFlexWrap(StyleToYoga.flexWrap[value])
  }

  private handleJustifyContentChange(value: StyleMap['justifyContent'] = 'flex-start') {
    assert(this.yogaNode)
    this.yogaNode.setJustifyContent(StyleToYoga.justifyContent[value])
  }

  private handleAlignItemsChange(value: StyleMap['alignItems'] = 'stretch') {
    assert(this.yogaNode)
    this.yogaNode.setAlignItems(StyleToYoga.alignItems[value])
  }

  private handleAlignContent(value: StyleMap['alignContent'] = 'flex-start') {
    assert(this.yogaNode)
    this.yogaNode.setAlignContent(StyleToYoga.alignContent[value])
  }

  override performLayout() {
    assert(this.yogaNode, `${this.id}: RenderFlex 的 yogaNode 不能是 undefined`)

    // 从根 yogaNode 开始布局
    if (!(this.parent instanceof RenderFlex)) {
      this.yogaNode.calculateLayout(
        // todo(haocong) 设法读取 parentSize，以支持根节点的百分比宽高
      )
    }

    // 更新自己的 Size 和 Offset
    this.updateOffsetAndSize()

    // 更新子节点的 Size 和 Offset
    this.visitChildren(child => {
      child.layoutAsChild(true, true)
    })
  }

}
