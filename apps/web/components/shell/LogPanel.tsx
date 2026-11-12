'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import styles from './LogPanel.module.css'

interface LogPanelProps {
  /** Right side of the header, e.g. the ApprovalBar. */
  headerSlot?: ReactNode
  children?: ReactNode
  /** Changes when lines are added; the body follows the end unless the user scrolled up. */
  scrollKey?: number
}

export function LogPanel({ headerSlot, children, scrollKey }: LogPanelProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const pinned = useRef(true)

  useEffect(() => {
    const body = bodyRef.current
    if (body && pinned.current) body.scrollTop = body.scrollHeight
  }, [scrollKey])

  return (
    <section className={styles.panel} aria-labelledby="log-heading">
      <div className={styles.header}>
        {/* tabIndex -1: focus lands here after an approval decision. */}
        <h2 id="log-heading" className={styles.title} tabIndex={-1}>
          Run log
        </h2>
        {headerSlot}
      </div>
      <div
        ref={bodyRef}
        className={styles.body}
        aria-live="polite"
        onScroll={(e) => {
          const el = e.currentTarget
          pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24
        }}
      >
        {children ?? <p className={styles.empty}>No run yet. Press Simulate push to start one.</p>}
      </div>
    </section>
  )
}
