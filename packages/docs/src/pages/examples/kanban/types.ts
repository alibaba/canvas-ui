export type EntityId<Kind> = string & { kind: Kind }

// eslint-disable-next-line @typescript-eslint/ban-types
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
