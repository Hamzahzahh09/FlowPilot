'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, isCurrent } from './nav'
import styles from './SideNav.module.css'

export function SideNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="App" className={styles.nav}>
      <ul className={styles.list}>
        {NAV_ITEMS.map(({ href, label, match, icon: Icon }) => {
          const current = isCurrent(pathname, match)
          return (
            <li key={href}>
              <Link
                href={href}
                className={styles.item}
                aria-current={current ? 'page' : undefined}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
