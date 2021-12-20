import { LinkedList } from './linked-list'

type Slot<K, V> = {
  key: K
  value: V
}

export type HashMapComparator<K> = (lhs: K, rhs: K) => boolean

export class HashMap<K1, K2, V>
{

  constructor(
    private readonly comparator: HashMapComparator<K2>
  ) { }

  private storage = new Map<K1, LinkedList<Slot<K2, V>>>()

  get(key1: K1, key2: K2): V | undefined {
    const slots = this.storage.get(key1)
    if (!slots) {
      return undefined
    }
    for (const slot of slots) {
      if (this.comparator(slot.key, key2)) {
        return slot.value
      }
    }
    return undefined
  }

  set(key1: K1, key2: K2, value: V) {
    let slots = this.storage.get(key1)
    if (!slots) {
      slots = new LinkedList()
      this.storage.set(key1, slots)
    }
    if (slots.length > 0) {
      for (const slot of slots) {
        if (this.comparator(slot.key, key2)) {
          return
        }
      }
    }
    slots.append({
      key: key2,
      value,
    })
  }

  delete(key1: K1, key2: K2) {
    const slots = this.storage.get(key1)
    if (!slots) {
      return false
    }
    for (const slot of slots) {
      if (this.comparator(slot.key, key2)) {
        slots.delete(slot)
        if (slots.length === 0) {
          this.storage.delete(key1)
        }
        return true
      }
    }
    return false
  }

  *[Symbol.iterator](): IterableIterator<[K1, K2, V]> {
    for (const [key1, slots] of this.storage) {
      for (const slot of slots) {
        yield [key1, slot.key, slot.value]
      }
    }
  }
}
