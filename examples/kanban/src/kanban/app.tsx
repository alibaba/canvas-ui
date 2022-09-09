import { Canvas } from '@canvas-ui/react'
import { assert } from '@canvas-ui/assert'
import React from 'react'
import { DebugFlagsUI } from '../common/debug-flags-ui'
import { Kanban } from './kanban'
import { Repo } from './repo'
import './styles.css'

const ctx = React.createContext<App | null>(null)

export class App {

  private readonly repo = new Repo()

  query() {
    return this.repo.query()
  }

  readonly UI: React.FC = () => {

    return (
      <div className='kanban-app'>
        <DebugFlagsUI />
        <div className='kanban-canvas'>
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
  const ret = React.useContext(ctx)
  assert(ret, 'use inside App')
  return ret
}
