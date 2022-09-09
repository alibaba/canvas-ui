export type EntityId<Kind> = string & { kind: Kind }

export type Entity<T extends EntityId<unknown>, U = object> = {
  id: T
  name: string
} & U

export type TaskId = EntityId<'TaskId'>

export type Task = Entity<TaskId, {
  tasklistId: TasklistId
}>

export type TasklistId = EntityId<'Tasklist'>

export type Tasklist = Entity<TasklistId>
