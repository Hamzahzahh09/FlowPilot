import { LOG_TAG, formatOffset, type LogEntry } from '@/lib/run/reduce'
import styles from './LogLines.module.css'

// Timestamp column, a text tag per line (color is never the only signal), then the message.
export function LogLines({ lines }: { lines: LogEntry[] }) {
  if (lines.length === 0) {
    return <p className={styles.empty}>Waiting for the runner…</p>
  }
  return (
    <ol className={styles.lines}>
      {lines.map((line, i) => (
        <li key={`${line.at}-${i}`} className={styles.line} data-level={line.level}>
          <span className={styles.time}>{formatOffset(line.at)}</span>
          <span className={styles.tag}>{LOG_TAG[line.level]}</span>
          <span className={styles.text}>{line.text}</span>
        </li>
      ))}
    </ol>
  )
}
