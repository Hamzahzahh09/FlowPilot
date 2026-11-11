import type { RunStatus } from '@/lib/data'
import { RUN_STATUS_LABEL } from '@/lib/data/runStatus'
import styles from './StatusBadge.module.css'

type Tone = 'accent' | 'ok' | 'bad' | 'wait' | 'muted'

const RUN_TONE: Record<RunStatus, Tone> = {
  queued: 'muted',
  running: 'accent',
  awaiting_approval: 'wait',
  succeeded: 'ok',
  failed: 'bad',
  cancelled: 'muted',
  timed_out: 'bad',
}

interface StatusBadgeProps {
  /** Run status, or null for "Never run". */
  status: RunStatus | null
}

// Dot in the status color plus a text label: status never relies on color alone.
export function StatusBadge({ status }: StatusBadgeProps) {
  const tone: Tone = status ? RUN_TONE[status] : 'muted'
  const label = status ? RUN_STATUS_LABEL[status] : 'Never run'
  return (
    <span className={styles.badge} data-tone={tone}>
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </span>
  )
}
