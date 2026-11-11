import Link from 'next/link'
import { LogoIcon } from '@/components/icons'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { REPO_URL, ROUTES } from '@/lib/site'
import styles from './LandingHeader.module.css'

export function LandingHeader() {
  return (
    <div className={styles.bar}>
      <Link href={ROUTES.home} className={styles.brand} aria-label="FlowPilot home">
        <span className={styles.logo}>
          <LogoIcon size={20} />
        </span>
        <span className={styles.brandName}>FlowPilot</span>
      </Link>

      <nav aria-label="Main" className={styles.nav}>
        <Link href={ROUTES.editor} className={styles.link}>
          Editor
        </Link>
        <a href={REPO_URL} className={styles.link} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <ButtonLink href={ROUTES.editor} variant="primary">
          Open the demo
        </ButtonLink>
      </nav>
    </div>
  )
}
