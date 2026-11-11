import styles from '@/components/landing/Landing.module.css'

// Landing page. Sections are filled in by landing-page tasks 2-4.
export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.container}>{/* LandingHeader (task 2) */}</header>
      <main className={styles.container}>{/* Hero, HowItWorks, ThreeParts */}</main>
      <footer className={styles.container}>{/* LandingFooter (task 4) */}</footer>
    </div>
  )
}
