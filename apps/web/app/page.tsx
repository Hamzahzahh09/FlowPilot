import { Hero } from '@/components/landing/Hero'
import { LandingHeader } from '@/components/landing/LandingHeader'
import styles from '@/components/landing/Landing.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.container}>
        <LandingHeader />
      </header>
      <main className={styles.container}>
        <Hero />
        {/* HowItWorks (task 3), ThreeParts (task 4) */}
      </main>
      <footer className={styles.container}>{/* LandingFooter (task 4) */}</footer>
    </div>
  )
}
