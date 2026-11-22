import { useState } from 'react'
import { CopyIcon, PlayIcon, TrashIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { WorkflowSummary } from '@/lib/data'
import { TRIGGER_LABEL, absoluteTime, relativeTime } from '@/lib/format'
import styles from './WorkflowCard.module.css'

interface WorkflowCardProps {
  workflow: WorkflowSummary
  onSimulate: () => void
  onDelete: () => void
  onDuplicate: () => void
  /** Another action is running on the page. */
  disabled: boolean
  /** This card's Simulate push is in flight. */
  simulating: boolean
  /** This card's Delete action is in flight. */
  deleting: boolean
  /** This card's Duplicate action is in flight. */
  duplicating: boolean
}

export function WorkflowCard({
  workflow,
  onSimulate,
  onDelete,
  onDuplicate,
  disabled,
  simulating,
  deleting,
  duplicating,
}: WorkflowCardProps) {
  const [confirming, setConfirming] = useState(false)
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

      {confirming ? (
        <div className={styles.confirmBox}>
          <p className={styles.confirmText}>Hapus workflow ini dan semua riwayat prosesnya?</p>
          <div className={styles.confirmActions}>
            <Button
              variant="danger"
              size="md"
              icon={<TrashIcon size={16} />}
              onClick={onDelete}
              disabled={disabled}
              pending={deleting}
              pendingLabel="Menghapus…"
              aria-describedby={titleId}
            >
              Ya, Hapus
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setConfirming(false)}
              disabled={disabled || deleting}
            >
              Batal
            </Button>
          </div>
        </div>
      ) : (
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
          <Button
            variant="secondary"
            icon={<CopyIcon size={16} />}
            onClick={onDuplicate}
            disabled={disabled}
            pending={duplicating}
            pendingLabel="Menggandakan…"
            aria-label={`Duplikat workflow ${workflow.name}`}
            title="Duplikat workflow"
          >
            Duplikat
          </Button>
          <Button
            variant="secondary"
            icon={<TrashIcon size={16} />}
            onClick={() => setConfirming(true)}
            disabled={disabled}
            aria-label={`Hapus workflow ${workflow.name}`}
            title="Hapus workflow"
            className={styles.deleteButton}
          />
        </div>
      )}
    </article>
  )
}
