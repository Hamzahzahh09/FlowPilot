import type { Metadata } from 'next'
import { LandingHeader } from '@/components/landing/LandingHeader'
import landing from '@/components/landing/Landing.module.css'
import { LoginForm } from '@/components/auth/LoginForm'
import { safeNext } from '@/lib/auth/demo'
import styles from './login.module.css'

export const metadata: Metadata = {
  title: 'Sign in · FlowPilot',
}

interface LoginPageProps {
  searchParams: { next?: string | string[] }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const raw = Array.isArray(searchParams.next) ? searchParams.next[0] : searchParams.next
  const next = safeNext(raw)

  return (
    <div className={landing.page}>
      <header className={landing.container}>
        <LandingHeader />
      </header>
      <main className={`${landing.container} ${styles.main}`}>
        <div className={styles.card}>
          <h1 className={styles.title}>Sign in to FlowPilot</h1>
          <p className={styles.lead}>Use the demo account to try workflows, runs and approvals.</p>
          <LoginForm next={next} />
        </div>
      </main>
    </div>
  )
}
