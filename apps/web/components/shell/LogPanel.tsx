import type { ReactNode } from 'react'
import styles from './LogPanel.module.css'

interface LogPanelProps {
  /** Right side of the header; the ApprovalBar goes here in a later task. */
  headerSlot?: ReactNode
  children?: ReactNode
}

export function LogPanel({ headerSlot, children }: LogPanelProps) {
  return (
    <section className={styles.panel} aria-labelledby="log-heading">
      <div className={styles.header}>
        <h2 id="log-heading" className={styles.title}>
          Run log
        </h2>
        {headerSlot}
      </div>
      <div className={styles.body} aria-live="polite">
        {children ?? <p className={styles.empty}>No run yet. Press Simulate push to start one.</p>}
      </div>
    </section>
  )
}
