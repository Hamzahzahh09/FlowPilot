import type { RunStatus } from '@/lib/data'
import { RUN_STATUS_LABEL } from '@/lib/data/runStatus'
import styles from './StatusBadge.module.css'

export type Tone = 'accent' | 'ok' | 'bad' | 'wait' | 'muted'

const RUN_TONE: Record<RunStatus, Tone> = {
  queued: 'muted',
  running: 'accent',
  awaiting_approval: 'wait',
  succeeded: 'ok',
  failed: 'bad',
  cancelled: 'muted',
  timed_out: 'bad',
}

// Dot in the status color plus a text label: status never relies on color alone.
export function Badge({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span className={styles.badge} data-tone={tone}>
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </span>
  )
}

/** Run status, or null for "Never run". */
export function StatusBadge({ status }: { status: RunStatus | null }) {
  return status ? (
    <Badge tone={RUN_TONE[status]} label={RUN_STATUS_LABEL[status]} />
  ) : (
    <Badge tone="muted" label="Never run" />
  )
}
