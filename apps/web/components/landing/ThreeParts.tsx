import landing from './Landing.module.css'
import styles from './ThreeParts.module.css'

const PARTS = [
  {
    title: 'Probabilistic AI, deterministic checks',
    text: 'An AI reviewer understands intent but can be wrong. Linters and tests are exact but narrow.',
    stitch: 'The Brain only suggests. The Scalpel and the Heart decide pass or fail.',
  },
  {
    title: 'Autonomy and human control',
    text: 'Automation should take the busywork, not the decisions.',
    stitch: 'The Lightning Lever stops every run until you approve or reject it.',
  },
  {
    title: 'The cloud and your machine',
    text: 'Hosted runs are easy to share, but your code and tools live on your machine.',
    stitch: 'Run in the hosted sandbox, or point a local runner at your project folder.',
  },
] as const

export function ThreeParts() {
  return (
    <section className={landing.section} aria-labelledby="parts-title">
      <h2 id="parts-title" className={landing.sectionTitle}>
        Three parts, stitched into one pipeline
      </h2>
      <p className={landing.sectionLead}>
        FlowPilot is a chimera on purpose. Each part does what it is good at, and the stitches between
        them are where you keep control.
      </p>
      <ul className={styles.cards}>
        {PARTS.map((part) => (
          <li key={part.title} className={styles.card}>
            <h3 className={styles.title}>{part.title}</h3>
            <p className={styles.text}>{part.text}</p>
            <p className={styles.stitch}>
              <span className={styles.stitchLabel}>How FlowPilot stitches it:</span> {part.stitch}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
