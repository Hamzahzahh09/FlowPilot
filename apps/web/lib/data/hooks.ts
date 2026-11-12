'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSlow } from '@/lib/useSlow'
import { data } from './index'

export type QueryState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: T }

export type Query<T> = QueryState<T> & {
  /** Loads again from scratch (shows loading). */
  retry: () => void
  /** Still loading after 8 seconds. */
  slow: boolean
}

const message = (error: unknown) => (error instanceof Error ? error.message : String(error))

/**
 * Loads data from the data layer and reloads after any change.
 * `key` identifies the query; a new key starts a new load.
 */
export function useQuery<T>(key: string, load: () => Promise<T>): Query<T> {
  const [state, setState] = useState<QueryState<T>>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const loadRef = useRef(load)
  loadRef.current = load

  useEffect(() => {
    let alive = true
    setState({ status: 'loading' })
    const run = () => {
      loadRef.current().then(
        (value) => alive && setState({ status: 'ready', data: value }),
        (error: unknown) => alive && setState({ status: 'error', error: message(error) }),
      )
    }
    run()
    const unsubscribe = data.subscribe(run)
    return () => {
      alive = false
      unsubscribe()
    }
  }, [key, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  const slow = useSlow(state.status === 'loading', attempt)

  return { ...state, retry, slow }
}

export type ActionOptions<A extends unknown[], R> = {
  /** Runs for the latest attempt only, so a retried action does not navigate twice. */
  onSuccess?: (result: R, ...args: A) => void
  /**
   * The action ends by navigating away: stay pending after success, so the
   * button keeps its spinner until the next page replaces it.
   */
  holdOnSuccess?: boolean | ((result: R) => boolean)
}

/** Wraps an async action with pending, slow and error state, and Retry. */
export function useAction<A extends unknown[], R>(
  action: (...args: A) => Promise<R>,
  options: ActionOptions<A, R> = {},
) {
  const [pendingArgs, setPendingArgs] = useState<A | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  // Succeeded and waiting for the next page: the navigation bar owns the wait.
  const [navigating, setNavigating] = useState(false)
  const actionRef = useRef(action)
  const optionsRef = useRef(options)
  actionRef.current = action
  optionsRef.current = options
  const lastArgs = useRef<A | null>(null)
  const latest = useRef(0)

  const run = useCallback(async (...args: A): Promise<R | undefined> => {
    const id = ++latest.current
    lastArgs.current = args
    setAttempt(id)
    setPendingArgs(args)
    setNavigating(false)
    setError(null)
    try {
      const result = await actionRef.current(...args)
      // A newer attempt (Retry) owns the state now.
      if (id !== latest.current) return undefined
      const { onSuccess, holdOnSuccess } = optionsRef.current
      const hold = typeof holdOnSuccess === 'function' ? holdOnSuccess(result) : Boolean(holdOnSuccess)
      if (hold) setNavigating(true)
      else setPendingArgs(null)
      onSuccess?.(result, ...args)
      return result
    } catch (err) {
      if (id !== latest.current) return undefined
      setError(message(err))
      setPendingArgs(null)
      return undefined
    }
  }, [])

  /** Runs the last call again. While a call is slow, the new one replaces it. */
  const retry = useCallback(() => {
    if (lastArgs.current) void run(...lastArgs.current)
  }, [run])

  const pending = pendingArgs !== null
  const slow = useSlow(pending && !navigating, attempt)

  /** `pendingArgs` tells which call is in flight, for example which card. */
  return { run, retry, pending, pendingArgs, slow, error }
}
