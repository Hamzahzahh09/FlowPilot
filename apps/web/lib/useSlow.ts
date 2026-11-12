'use client'

import { useEffect, useState } from 'react'

/** After this long a wait counts as slow (Neon computes can take a while to wake up). */
export const SLOW_MS = 8000

export const SLOW_MESSAGE = 'This is taking longer than usual. The database may be waking up.'

/**
 * True once `active` has stayed true for `ms`. A new `attempt` (for example
 * after Retry) starts the clock again.
 */
export function useSlow(active: boolean, attempt: number = 0, ms: number = SLOW_MS): boolean {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    setSlow(false)
    if (!active) return
    const timer = window.setTimeout(() => setSlow(true), ms)
    return () => window.clearTimeout(timer)
  }, [active, attempt, ms])

  return active && slow
}
