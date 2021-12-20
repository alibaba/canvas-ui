import type { RenderObject, Visitor } from './render-object'

export interface RenderContainer<ChildType extends RenderObject> {
  readonly childCount: number
  readonly firstChild?: ChildType
  readonly lastChild?: ChildType
  childBefore(child: ChildType): ChildType | undefined
  childAfter(child: ChildType): ChildType | undefined
  visitChildren(visitor: Visitor<ChildType>): void
  insertAfter(child: ChildType, after?: ChildType): void
  insertBefore(child: ChildType, before?: ChildType): void
  appendChild(child: ChildType): void
  removeChild(child: ChildType): void
  removeAllChildren(): void
  readonly debugChildren: ChildType[]
}

