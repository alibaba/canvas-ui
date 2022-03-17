import { assert } from '@canvas-ui/assert'

export abstract class AbstractNode<Owner>  {

  protected _depth = 0
  get depth() {
    return this._depth
  }

  protected redepthChild(child: AbstractNode<Owner>) {
    assert(child.owner === this.owner)
    if (child._depth <= this._depth) {
      child._depth = this._depth + 1
      child.redepthChildren()
    }
  }

  protected abstract redepthChildren(): void

  protected _parent?: AbstractNode<Owner>
  get parent() {
    return this._parent
  }

  protected _owner?: Owner
  get owner() {
    return this._owner
  }

  attach(owner: Owner) {
    assert(!this._owner)
    this._owner = owner
  }

  get attached() {
    return this._owner !== undefined
  }

  detach() {
    assert(this._owner)
    this._owner = undefined
    assert(!this.parent?.attached)
  }

  protected adoptChild(child: AbstractNode<Owner>) {
    assert(!child._parent, `子节点已经有父节点`)
    child._parent = this
    if (this._owner) { // .attached
      child.attach(this._owner)
    }
    this.redepthChild(child)
  }

  protected dropChild(child: AbstractNode<Owner>) {
    assert(child._parent === this)
    assert(child.attached === this.attached)
    child._parent = undefined
    if (this.attached) {
      child.detach()
    }
  }

}
