import { assert } from '@canvas-ui/assert'
import { produce } from 'immer'
import { BehaviorSubject, map } from 'rxjs'
import type { Task, Tasklist, TasklistId } from './types'

const INITIAL_TASKLISTS = [
  { id: 'tasklist:1', name: '📃 To Do' },
  { id: 'tasklist:2', name: '🔨 In Progress' },
  { id: 'tasklist:3', name: '⏳ Ready for Testing' },
  { id: 'tasklist:4', name: '🧪 Testing' },
  { id: 'tasklist:5', name: '📦 Ready for Release' },
  { id: 'tasklist:6', name: '🚀 Released' },
] as Tasklist[]

const INITIAL_TASKS = [
  { 'id': 'task:1', name: 'PoC', tasklistId: 'tasklist:6', },
  { 'id': 'task:2', name: 'Task List', tasklistId: 'tasklist:3', },
  { 'id': 'task:3', name: 'Write Test Cases', tasklistId: 'tasklist:3', },
  { 'id': 'task:4', name: 'Review & Test New Features', tasklistId: 'tasklist:3', },
  { 'id': 'task:5', name: 'Message Module Development', tasklistId: 'tasklist:2', },
  { 'id': 'task:6', name: 'Message Module Review', tasklistId: 'tasklist:5', },
  { 'id': 'task:7', name: 'Login Reminder Development', tasklistId: 'tasklist:4', },
  { 'id': 'task:8', name: 'Login Reminder Review', tasklistId: 'tasklist:2', },
  { 'id': 'task:19', name: 'When users write lengthy content in tasks, it causes cards to expand. Need to properly handle multiline text overflow. For example: we can add "…" at the end of text to indicate more content.', tasklistId: 'tasklist:1', },
  { 'id': 'task:18', name: 'Save task data to LocalStorage or IndexedDB', tasklistId: 'tasklist:1', },
  { 'id': 'task:9', name: 'Modify Agile Development Template', tasklistId: 'tasklist:1', },
  { 'id': 'task:10', name: 'Modify Project Management Template', tasklistId: 'tasklist:1', },
  { 'id': 'task:11', name: 'Modify OKR Template', tasklistId: 'tasklist:1', },
  { 'id': 'task:12', name: 'Deploy Modified Templates', tasklistId: 'tasklist:1', },
  { 'id': 'task:13', name: 'Drag Task Cards', tasklistId: 'tasklist:1', },
  { 'id': 'task:14', name: 'Task Deletion Feature', tasklistId: 'tasklist:1', },
  { 'id': 'task:15', name: 'Task Completion Feature', tasklistId: 'tasklist:1', },
  { 'id': 'task:16', name: 'Task Creation Feature', tasklistId: 'tasklist:1', },
  { 'id': 'task:17', name: 'Task Editing Feature', tasklistId: 'tasklist:1', },
] as Task[]

type Store = {
  tasks: Task[]
  tasklists: Tasklist[]
}

export class Repo {

  private reactiveStore = new BehaviorSubject<Store>({
    tasks: INITIAL_TASKS,
    tasklists: INITIAL_TASKLISTS,
  })

  query() {
    return this.reactiveStore.pipe(
      map(({
        tasks,
        tasklists,
      }) => {
        const grouped = tasks.reduce<Record<TasklistId, Task[]>>((acc, it) => {
          if (!acc[it.tasklistId]) {
            acc[it.tasklistId] = []
          }
          acc[it.tasklistId].push(it)
          return acc
        }, {})

        return tasklists.map(it => {
          return {
            ...it,
            tasks: grouped[it.id] ?? []
          }
        })
      })
    )
  }

  update<K extends keyof Store, T extends Store[K][0] = Store[K][0]>(
    tableName: K,
    payload: Pick<T, 'id'> & Partial<Omit<T, 'id'>>,
  ) {
    const prevState = this.reactiveStore.value
    const table = prevState[tableName]
    const pos = table.findIndex(it => {
      return it.id === payload.id
    })

    assert(pos !== -1, 'Record not found')

    const record = {
      ...table[pos],
      ...payload,
    } as T

    const nextState = produce(prevState, draft => {
      draft[tableName][pos] = record
    })

    this.reactiveStore.next(nextState)
  }


  insert<K extends keyof Store, T extends Store[K][0] = Store[K][0]>(
    tableName: K,
    payload: Partial<Omit<T, 'id'>>,
  ) {
    const prevState = this.reactiveStore.value
    const table = prevState[tableName]
    const record = {
      id: String(table.length),
      ...payload,
    } as T

    const nextState = produce(prevState, draft => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      draft[tableName].push(record as any)
    })

    this.reactiveStore.next(nextState)
  }

}
