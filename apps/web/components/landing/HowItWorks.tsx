import { NODE_ICONS } from '@/components/flow/nodeIcons'
import type { NodeKind } from '@/lib/workflow/types'
import landing from './Landing.module.css'
import styles from './HowItWorks.module.css'

const STEPS: { kind: NodeKind; title: string; text: string }[] = [
  {
    kind: 'spark',
    title: 'Push',
    text: 'A push to GitHub, or Simulate push in the editor, starts a run.',
  },
  {
    kind: 'brain',
    title: 'AI review',
    text: 'An AI agent reads the diff with read-only tools and writes suggestions, without changing any code.',
  },
  {
    kind: 'scalpel',
    title: 'Lint and tests',
    text: 'A sandboxed runner runs only allowlisted commands such as npm run lint and npm test.',
  },
  {
    kind: 'lever',
    title: 'Your approval and report',
    text: 'The run waits for you to approve or reject, then writes the Autopsy report.',
  },
]

export function HowItWorks() {
  return (
    <section className={landing.section} aria-labelledby="how-title">
      <h2 id="how-title" className={landing.sectionTitle}>
        How it works
      </h2>
      <p className={landing.sectionLead}>Every run follows the same four steps, and you can watch each one happen.</p>
      <ol className={styles.steps}>
        {STEPS.map((step, i) => {
          const Icon = NODE_ICONS[step.kind]
          return (
            <li key={step.title} className={styles.step}>
              <div className={styles.head}>
                <span className={styles.icon} aria-hidden="true">
                  <Icon size={22} />
                </span>
                <span className={styles.number} aria-hidden="true">
                  {i + 1}
                </span>
              </div>
              <h3 className={styles.title}>{step.title}</h3>
              <p className={styles.text}>{step.text}</p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
