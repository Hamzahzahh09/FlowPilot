import type { ReactNode } from 'react'
import { AppTopBar } from '@/components/app/AppTopBar'
import { SideNav } from '@/components/app/SideNav'
import { TopBarProvider } from '@/components/app/TopBarContext'
import styles from './layout.module.css'

// Shell for logged-in pages. middleware.ts guarantees a demo session here.
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <TopBarProvider>
      <div className={styles.frame}>
        <div className={styles.top}>
          <AppTopBar />
        </div>
        <div className={styles.nav}>
          <SideNav />
        </div>
        <main id="main" className={styles.content}>
          {children}
        </main>
      </div>
    </TopBarProvider>
  )
}
