import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  title: string
  children: ReactNode
  icon?: ReactNode
  action?: ReactNode
  /** Heading level inside the page (the page h1 is the PageHeader). */
  headingLevel?: 2 | 3
}

export function EmptyState({ title, children, icon, action, headingLevel = 2 }: EmptyStateProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <div className={styles.empty}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <Heading className={styles.title}>{title}</Heading>
      <div className={styles.text}>{children}</div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
