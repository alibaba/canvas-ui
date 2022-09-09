import { useEffect, useState } from 'react'
import { Observable } from 'rxjs'

export function useObservable<T>(source: Observable<T>) {
  const [ret, setRet] = useState<T | null>(null)
  useEffect(() => {
    const sub = source.subscribe(setRet)
    return () => {
      sub.unsubscribe()
    }
  }, [source])
  return ret
}

export default useObservable
