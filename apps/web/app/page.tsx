import { HowItWorks } from '@/components/landing/HowItWorks'
import { Hero } from '@/components/landing/Hero'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { ThreeParts } from '@/components/landing/ThreeParts'
import styles from '@/components/landing/Landing.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.container}>
        <LandingHeader />
      </header>
      <main className={styles.container}>
        <Hero />
        <HowItWorks />
        <ThreeParts />
      </main>
      <footer className={styles.container}>
        <LandingFooter />
      </footer>
    </div>
  )
}
