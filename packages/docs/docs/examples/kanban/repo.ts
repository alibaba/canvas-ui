import { assert } from '@canvas-ui/assert'
import { produce } from 'immer'
import { BehaviorSubject, map } from 'rxjs'
import { Task, Tasklist, TasklistId } from './types'

const INITIAL_TASKLISTS = [
  { id: 'tasklist:1', name: '📃 未开始' },
  { id: 'tasklist:2', name: '🔨 开发中' },
  { id: 'tasklist:3', name: '⏳ 待测试' },
  { id: 'tasklist:4', name: '🧪 测试中' },
  { id: 'tasklist:5', name: '📦 待发布' },
  { id: 'tasklist:6', name: '🚀 已发布' },
] as Tasklist[]

const INITIAL_TASKS = [
  { 'id': 'task:1', name: 'PoC', tasklistId: 'tasklist:6', },
  { 'id': 'task:2', name: '任务列表', tasklistId: 'tasklist:3', },
  { 'id': 'task:3', name: '编写测试用例', tasklistId: 'tasklist:3', },
  { 'id': 'task:4', name: '验收 & 测试新功能', tasklistId: 'tasklist:3', },
  { 'id': 'task:5', name: '消息模块开发', tasklistId: 'tasklist:2', },
  { 'id': 'task:6', name: '消息模块验收', tasklistId: 'tasklist:5', },
  { 'id': 'task:7', name: '登录提醒开发', tasklistId: 'tasklist:4', },
  { 'id': 'task:8', name: '登录提醒验收', tasklistId: 'tasklist:2', },
  { 'id': 'task:19', name: '当用户在任务里长篇大论时，会导致卡片被撑开，需要正确处理多行文本的溢出。例如：我们可以在文本的最后增加「…」 代表还有更多内容。', tasklistId: 'tasklist:1', },
  { 'id': 'task:18', name: '将任务数据保存到 LocalStorage 或 IndexedDB', tasklistId: 'tasklist:1', },
  { 'id': 'task:9', name: '修改敏捷开发模板', tasklistId: 'tasklist:1', },
  { 'id': 'task:10', name: '修改项目管理模板', tasklistId: 'tasklist:1', },
  { 'id': 'task:11', name: '修改 OKR 模板', tasklistId: 'tasklist:1', },
  { 'id': 'task:12', name: '修改的模板上线', tasklistId: 'tasklist:1', },
  { 'id': 'task:13', name: '拖拽任务卡片', tasklistId: 'tasklist:1', },
  { 'id': 'task:14', name: '任务删除能力', tasklistId: 'tasklist:1', },
  { 'id': 'task:15', name: '任务完成能力', tasklistId: 'tasklist:1', },
  { 'id': 'task:16', name: '任务添加能力', tasklistId: 'tasklist:1', },
  { 'id': 'task:17', name: '任务编辑能力', tasklistId: 'tasklist:1', },
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
      draft[tableName].push(record as any) // 谁能教我如何避免这个 any
    })

    this.reactiveStore.next(nextState)
  }

}
