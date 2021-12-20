type Node<T> = {
  value: T
  next?: Node<T>
  prev?: Node<T>
}

export class LinkedList<T> implements Iterable<T> {

  get length() {
    return this._length
  }
  private _length = 0

  private head?: Node<T>

  private tail?: Node<T>

  append(value: T) {
    const node = {
      value,
      prev: this.tail,
    }
    if (!this.head) {
      this.head = node
    }
    if (this.tail) {
      this.tail.next = node
    }
    this.tail = node
    this._length++
  }

  delete(value: T) {
    let node = this.head
    while (node) {
      if (node.value === value) {
        this.deleteNode(node)
        return true
      }
      node = node.next
    }
    return false
  }

  private deleteNode(node: Node<T>) {
    if (node.prev) {
      node.prev.next = node.next
    }
    if (node.next) {
      node.next.prev = node.prev
    }
    if (this.head === node) {
      this.head = node.next
    }
    if (this.tail === node) {
      this.tail = node.prev
    }
    this._length--
  }

  toJSON(): T[] {
    return Array.from(this)
  }

  *[Symbol.iterator](): IterableIterator<T> {
    let node = this.head
    while (node) {
      yield node.value
      node = node.next
    }
  }

}
