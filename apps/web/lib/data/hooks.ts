'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { data } from './index'

export type QueryState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: T }

/**
 * Loads data from the data layer and reloads after any change.
 * `key` identifies the query; a new key starts a new load.
 */
export function useQuery<T>(key: string, load: () => Promise<T>): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({ status: 'loading' })
  const loadRef = useRef(load)
  loadRef.current = load

  useEffect(() => {
    let alive = true
    setState({ status: 'loading' })
    const run = () => {
      loadRef.current().then(
        (value) => alive && setState({ status: 'ready', data: value }),
        (error: unknown) =>
          alive && setState({ status: 'error', error: error instanceof Error ? error.message : String(error) }),
      )
    }
    run()
    const unsubscribe = data.subscribe(run)
    return () => {
      alive = false
      unsubscribe()
    }
  }, [key])

  return state
}

/** Wraps an async action with pending and error state. */
export function useAction<A extends unknown[], R>(action: (...args: A) => Promise<R>) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const actionRef = useRef(action)
  actionRef.current = action

  const run = useCallback(async (...args: A): Promise<R | undefined> => {
    setPending(true)
    setError(null)
    try {
      return await actionRef.current(...args)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      return undefined
    } finally {
      setPending(false)
    }
  }, [])

  return { run, pending, error }
}
