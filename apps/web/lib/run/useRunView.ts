'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Run } from '@/lib/data/types'
import { reduceRun, type RunView } from './reduce'

/**
 * Re-reduces the run whenever its next event is due. One timer at a time,
 * set to the next event, so nothing ticks while the run waits or is done.
 */
export function useRunView(run: Run | null): RunView | null {
  const [now, setNow] = useState(() => Date.now())
  const startedAt = run ? Date.parse(run.startedAt) : 0
  const view = useMemo(() => (run ? reduceRun(run, now - startedAt) : null), [run, now, startedAt])
  const nextAt = view?.nextAt ?? null

  useEffect(() => {
    if (nextAt === null) return
    const delay = Math.max(16, startedAt + nextAt - Date.now())
    const timer = window.setTimeout(() => setNow(Date.now()), delay)
    return () => window.clearTimeout(timer)
  }, [nextAt, startedAt, now])

  return view
}
