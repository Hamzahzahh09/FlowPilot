import { PlayIcon } from '@/components/icons'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { ROUTES } from '@/lib/site'
import { HeroCanvas } from './HeroCanvas'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.copy}>
        <h1 id="hero-title" className={styles.title}>
          Automate the workflow. Keep control of the code.
        </h1>
        <p className={styles.lead}>
          Push to GitHub and FlowPilot takes it from there. An AI agent reviews the change, a
          sandboxed runner lints and tests it, and the run waits for your approval before it writes
          the final report.
        </p>
        <div className={styles.actions}>
          <ButtonLink href={ROUTES.editor} variant="primary" size="lg" icon={<PlayIcon />}>
            Try the demo
          </ButtonLink>
          <ButtonLink href={ROUTES.editor} size="lg">
            Build from scratch
          </ButtonLink>
        </div>
      </div>
      <HeroCanvas />
    </section>
  )
}
