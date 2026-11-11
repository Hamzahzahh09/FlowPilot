import type { ReactNode } from 'react'
import styles from './Inspector.module.css'

interface InspectorProps {
  children?: ReactNode
}

export function Inspector({ children }: InspectorProps) {
  return (
    <aside className={styles.panel} aria-labelledby="inspector-heading">
      <h2 id="inspector-heading" className={styles.title}>
        Inspector
      </h2>
      {children ?? <p className={styles.empty}>Select a node to see its details.</p>}
    </aside>
  )
}
