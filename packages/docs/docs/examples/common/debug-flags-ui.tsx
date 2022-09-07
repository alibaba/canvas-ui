import assert from 'assert'
import { DebugFlags } from '@canvas-ui/core'
import React, { ChangeEvent, FC, useEffect, useState } from 'react'
import styles from './styles.sass'
export const DebugFlagsUI: FC = () => {

  const [flags, setFlags] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const v = Object.entries(flags).reduce((acc, [name, checked]) => {
      if (checked) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return acc | (DebugFlags as any)[name]
      }
      return acc
    }, 0)
    DebugFlags.set(v)
  }, [flags])

  const handleChange = (name: string, checked: boolean) => {
    setFlags(prev => {
      return {
        ...prev,
        [name]: checked,
      }
    })
  }

  const renderCheckbox = (name: string) => {
    return (
      <FlagCheckbox
        name={name}
        checked={flags[name]}
        onChange={handleChange}
      />
    )
  }

  return (
    <div className={styles['debug-flags-ui']}>
      {renderCheckbox('NodeBounds')}
      {renderCheckbox('LayerBounds')}
      {renderCheckbox('NodeId')}
      {renderCheckbox('TextLineBounds')}
      {renderCheckbox('RasterCacheWaterMark')}
      {renderCheckbox('PathBounds')}
    </div>
  )
}

type FlagCheckboxProps = {
  name: string
  onChange: (flag: string, checked: boolean) => void
  checked: boolean
}
const FlagCheckbox: FC<FlagCheckboxProps> = (props) => {
  const handleChange = (event: ChangeEvent) => {
    assert(event.target instanceof HTMLInputElement)
    props.onChange(props.name, event.target.checked)
  }
  return (
    <label>
      <input
        type='checkbox'
        checked={props.checked}
        onChange={handleChange}
      ></input>
      {props.name}
    </label>
  )
}
