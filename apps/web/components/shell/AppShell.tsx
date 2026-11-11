import type { ReactNode } from 'react'
import styles from './AppShell.module.css'

interface AppShellProps {
  topBar: ReactNode
  canvas: ReactNode
  log: ReactNode
  inspector: ReactNode
}

// Layout only: top bar, rounded canvas card, inspector (hidden < 820px), log panel.
export function AppShell({ topBar, canvas, log, inspector }: AppShellProps) {
  return (
    <div className={styles.shell}>
      {topBar}
      <main className={styles.main}>
        <section className={styles.canvasCard} aria-label="Workflow canvas">
          <div className={styles.canvasInner}>{canvas}</div>
        </section>
        <div className={styles.inspector}>{inspector}</div>
      </main>
      <div className={styles.log}>{log}</div>
    </div>
  )
}
