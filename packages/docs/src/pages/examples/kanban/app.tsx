import { Canvas } from '@canvas-ui/react'
import { assert } from '@canvas-ui/assert'
import React, { createContext, FC, useContext } from 'react'
import { DebugFlagsUI } from '../common/debug-flags-ui'
import { Kanban } from './kanban'
import { Repo } from './repo'
import styles from './styles.css'

const ctx = createContext<App | null>(null)


export class App {

  private readonly repo = new Repo()

  query() {
    return this.repo.query()
  }

  readonly UI: FC = () => {

    return (
      <div className={styles['app']}>
        <DebugFlagsUI />
        <div className={styles['app-canvas']}>
          <Canvas>
            <ctx.Provider value={this}>
              <Kanban />
            </ctx.Provider>
          </Canvas>
        </div>
      </div>
    )
  }
}

export function useApp() {
  const ret = useContext(ctx)
  assert(ret, 'use inside App')
  return ret
}
