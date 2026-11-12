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

export type ActionOptions = {
  /**
   * The action ends by navigating away: stay pending after success, so the
   * button keeps its spinner until the next page replaces it.
   */
  holdOnSuccess?: boolean
}

/** Wraps an async action with pending and error state. */
export function useAction<A extends unknown[], R>(
  action: (...args: A) => Promise<R>,
  options: ActionOptions = {},
) {
  const [pendingArgs, setPendingArgs] = useState<A | null>(null)
  const [error, setError] = useState<string | null>(null)
  const actionRef = useRef(action)
  actionRef.current = action
  const hold = options.holdOnSuccess ?? false

  const run = useCallback(
    async (...args: A): Promise<R | undefined> => {
      setPendingArgs(args)
      setError(null)
      try {
        const result = await actionRef.current(...args)
        if (!hold) setPendingArgs(null)
        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
        setPendingArgs(null)
        return undefined
      }
    },
    [hold],
  )

  /** `pendingArgs` tells which call is in flight, for example which card. */
  return { run, pending: pendingArgs !== null, pendingArgs, error }
}
