'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoIcon } from '@/components/icons'
import { sectionTitle } from './nav'
import { useTopBarDetail } from './TopBarContext'
import { UserMenu } from './UserMenu'
import styles from './AppTopBar.module.css'

export function AppTopBar() {
  const pathname = usePathname()
  const section = sectionTitle(pathname)
  const detail = useTopBarDetail()

  return (
    <header className={styles.bar}>
      <Link href="/workflows" className={styles.brand} aria-label="FlowPilot, go to workflows">
        <span className={styles.logo}>
          <LogoIcon size={20} />
        </span>
        <span className={styles.brandName}>FlowPilot</span>
      </Link>

      <p className={styles.crumbs}>
        <span className={detail ? styles.section : styles.current}>{section}</span>
        {detail && (
          <>
            <span className={styles.sep} aria-hidden="true">
              /
            </span>
            <span className={styles.current}>{detail}</span>
          </>
        )}
      </p>

      <UserMenu />
    </header>
  )
}
