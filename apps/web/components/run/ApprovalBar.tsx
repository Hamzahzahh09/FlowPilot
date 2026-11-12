'use client'

import { CheckIcon, XIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import styles from './ApprovalBar.module.css'

interface ApprovalBarProps {
  nodeTitle: string
  pending: boolean
  onApprove: () => void
  onReject: () => void
}

// Approve and Reject use the same variant and width: neither is the
// "default" choice, and Reject is not hidden or dimmed.
export function ApprovalBar({ nodeTitle, pending, onApprove, onReject }: ApprovalBarProps) {
  return (
    <div className={styles.bar} role="group" aria-labelledby="approval-text">
      <p id="approval-text" className={styles.text}>
        <span className={styles.dot} aria-hidden="true" />
        {nodeTitle} is waiting for your decision
      </p>
      <div className={styles.buttons}>
        <Button icon={<CheckIcon />} onClick={onApprove} disabled={pending} className={styles.choice}>
          Approve
        </Button>
        <Button icon={<XIcon />} onClick={onReject} disabled={pending} className={styles.choice}>
          Reject
        </Button>
      </div>
    </div>
  )
}
