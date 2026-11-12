import styles from './Spinner.module.css'

/** Decorative. Pair it with visible pending text. */
export function Spinner({ className }: { className?: string }) {
  return <span aria-hidden="true" className={[styles.spinner, className].filter(Boolean).join(' ')} />
}
