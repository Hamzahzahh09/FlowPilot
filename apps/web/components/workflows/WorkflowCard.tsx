import { PlayIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { WorkflowSummary } from '@/lib/data'
import { TRIGGER_LABEL, absoluteTime, relativeTime } from '@/lib/format'
import styles from './WorkflowCard.module.css'

interface WorkflowCardProps {
  workflow: WorkflowSummary
  onSimulate: () => void
  /** Another action is running on the page. */
  disabled: boolean
  /** This card's Simulate push is in flight. */
  simulating: boolean
}

export function WorkflowCard({ workflow, onSimulate, disabled, simulating }: WorkflowCardProps) {
  const titleId = `wf-${workflow.id}`
  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.name}>
        {workflow.name}
      </h2>
      {workflow.description && <p className={styles.description}>{workflow.description}</p>}

      <dl className={styles.meta}>
        <div>
          <dt>Trigger</dt>
          <dd>{workflow.trigger ? TRIGGER_LABEL[workflow.trigger] : 'No Spark node'}</dd>
        </div>
        <div>
          <dt>Last run</dt>
          <dd>
            <StatusBadge status={workflow.lastRun?.status ?? null} />
          </dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>
            <time dateTime={workflow.updatedAt} title={absoluteTime(workflow.updatedAt)}>
              {relativeTime(workflow.updatedAt)}
            </time>
          </dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <ButtonLink href={`/workflows/${workflow.id}`} aria-describedby={titleId}>
          Open
        </ButtonLink>
        <Button
          variant="primary"
          icon={<PlayIcon />}
          onClick={onSimulate}
          disabled={disabled || !workflow.trigger}
          pending={simulating}
          pendingLabel="Starting run…"
          aria-describedby={titleId}
        >
          Simulate push
        </Button>
      </div>
    </article>
  )
}
