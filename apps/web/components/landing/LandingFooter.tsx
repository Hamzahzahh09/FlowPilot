import { REPO_URL } from '@/lib/site'
import styles from './LandingFooter.module.css'

export function LandingFooter() {
  return (
    <div className={styles.footer}>
      <p>Built with Kiro for Kiroween 2026, Frankenstein category</p>
      <p className={styles.links}>
        <span>MIT license</span>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
          Source on GitHub
        </a>
      </p>
    </div>
  )
}
