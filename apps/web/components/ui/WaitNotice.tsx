'use client'

import { SLOW_MESSAGE } from '@/lib/useSlow'
import { Button } from './Button'
import styles from './WaitNotice.module.css'

interface WaitNoticeProps {
  /** Read by screen readers while waiting, for example "Starting run…". */
  pendingText?: string | null
  /** The wait passed 8 seconds: show the slow message. */
  slow?: boolean
  error?: string | null
  onRetry?: () => void
  /** Extra class on the visible box, for placement. */
  className?: string
}

/**
 * Feedback for one wait: pending text for screen readers, the slow message
 * with Retry after 8 seconds, and a clear error with Retry. Both live regions
 * are always rendered (empty divs take no space) so changes are announced.
 */
export function WaitNotice({ pendingText, slow = false, error, onRetry, className }: WaitNoticeProps) {
  const box = (kind: string) => [styles.box, kind, className].filter(Boolean).join(' ')
  const retry = onRetry && <Button onClick={onRetry}>Retry</Button>

  return (
    <>
      <div role="status" aria-live="polite">
        {!error && slow ? (
          <div className={box(styles.slow)}>
            <p className={styles.text}>
              <span className={styles.label}>Slow</span>
              <span>{SLOW_MESSAGE}</span>
            </p>
            {retry}
          </div>
        ) : (
          !error && pendingText && <span className="sr-only">{pendingText}</span>
        )}
      </div>
      <div role="alert">
        {error && (
          <div className={box(styles.error)}>
            <p className={styles.text}>
              <span className={styles.label}>Failed</span>
              <span>{error}</span>
            </p>
            {retry}
          </div>
        )}
      </div>
    </>
  )
}
