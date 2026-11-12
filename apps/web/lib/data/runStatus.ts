import type { Run, RunStatus } from './types'

/** The part of a run the status depends on. Full runs and DB rows both fit. */
type Timed = Pick<Run, 'startedAt' | 'events'>

/** Milliseconds since the run started. */
export function elapsedMs(run: Pick<Run, 'startedAt'>, now: number = Date.now()): number {
  return Math.max(0, now - Date.parse(run.startedAt))
}

/** Latest run status whose event time has passed. Queued before any event. */
export function runStatusAt(run: Timed, now: number = Date.now()): RunStatus {
  const elapsed = elapsedMs(run, now)
  let status: RunStatus = 'queued'
  for (const event of run.events) {
    if (event.at > elapsed) break
    if (event.kind === 'run') status = event.status
  }
  return status
}

export const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  queued: 'Queued',
  running: 'Running',
  awaiting_approval: 'Awaiting approval',
  succeeded: 'Succeeded',
  failed: 'Failed',
  cancelled: 'Cancelled',
  timed_out: 'Timed out',
}

export function isFinished(status: RunStatus): boolean {
  return status === 'succeeded' || status === 'failed' || status === 'cancelled' || status === 'timed_out'
}
