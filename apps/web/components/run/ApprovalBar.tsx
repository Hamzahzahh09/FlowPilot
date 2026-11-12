'use client'

import { CheckIcon, XIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import type { RunDecision } from '@/lib/data'
import styles from './ApprovalBar.module.css'

interface ApprovalBarProps {
  nodeTitle: string
  /** The decision being sent, or null when idle. */
  pending: RunDecision | null
  onApprove: () => void
  onReject: () => void
}

// Approve and Reject use the same variant and width: neither is the
// "default" choice, and Reject is not hidden or dimmed. While one is being
// sent both are disabled and the one in flight shows a spinner.
export function ApprovalBar({ nodeTitle, pending, onApprove, onReject }: ApprovalBarProps) {
  return (
    <div className={styles.bar} role="group" aria-labelledby="approval-text">
      <p id="approval-text" className={styles.text}>
        <span className={styles.dot} aria-hidden="true" />
        {nodeTitle} is waiting for your decision
      </p>
      <div className={styles.buttons}>
        <Button
          icon={<CheckIcon />}
          onClick={onApprove}
          disabled={pending !== null}
          pending={pending === 'approved'}
          pendingLabel="Approving…"
          className={styles.choice}
        >
          Approve
        </Button>
        <Button
          icon={<XIcon />}
          onClick={onReject}
          disabled={pending !== null}
          pending={pending === 'rejected'}
          pendingLabel="Rejecting…"
          className={styles.choice}
        >
          Reject
        </Button>
      </div>
    </div>
  )
}
