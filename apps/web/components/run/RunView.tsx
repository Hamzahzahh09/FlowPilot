'use client'

import { PageHeader } from '@/components/app/PageHeader'
import { useSetTopBarDetail } from '@/components/app/TopBarContext'
import { LogPanel } from '@/components/shell/LogPanel'
import { RunSkeleton } from '@/components/skeletons/PageSkeletons'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { data, type RunDecision } from '@/lib/data'
import { useAction, useQuery } from '@/lib/data/hooks'
import { isFinished } from '@/lib/data/runStatus'
import { TRIGGER_LABEL, absoluteTime, relativeTime } from '@/lib/format'
import { useRunView } from '@/lib/run/useRunView'
import { nodeTitle } from '@/lib/workflow/graph'
import { ApprovalBar } from './ApprovalBar'
import { LogLines } from './LogLines'
import { RunCanvas } from './RunCanvas'
import styles from './RunView.module.css'

export function RunLiveView({ id }: { id: string }) {
  const query = useQuery(`run:${id}`, () => data.runs.get(id))
  const run = query.status === 'ready' ? query.data : null
  const view = useRunView(run)
  useSetTopBarDetail(run ? run.workflowName : null)

  const decide = useAction(async (decision: RunDecision) => {
    await data.runs.decide(id, decision)
    // The bar disappears; keep keyboard focus in the log instead of losing it.
    document.getElementById('log-heading')?.focus()
  })

  if (query.status === 'loading') {
    return <RunSkeleton />
  }

  if (!run || !view) {
    return (
      <PageHeader
        title="Run not found"
        description={
          query.status === 'error'
            ? `Could not load it: ${query.error}`
            : 'It may have been deleted, or the link is incomplete. Start a new one from your workflows.'
        }
        actions={<ButtonLink href="/workflows">Back to workflows</ButtonLink>}
      />
    )
  }

  const finished = isFinished(view.status)
  const waitingNode = view.waitingNodeId ? run.graph.nodes.find((n) => n.id === view.waitingNodeId) : undefined

  return (
    <div className={styles.page}>
      <PageHeader
        title={run.workflowName}
        description={
          <>
            Run {run.id.slice(0, 8)} · {TRIGGER_LABEL[run.trigger]} · started{' '}
            <time dateTime={run.startedAt} title={absoluteTime(run.startedAt)}>
              {relativeTime(run.startedAt)}
            </time>
          </>
        }
        actions={
          <>
            <span className={styles.status}>
              <span className="sr-only">Run status: </span>
              <StatusBadge status={view.status} />
            </span>
            <ButtonLink href={`/workflows/${run.workflowId}`}>Open workflow</ButtonLink>
            {finished && (
              <ButtonLink href={`/runs/${run.id}/report`} variant="primary">
                View report
              </ButtonLink>
            )}
          </>
        }
      />

      <div className={styles.body}>
        <section className={styles.canvas} aria-label="Run progress on the workflow canvas">
          <RunCanvas run={run} view={view} />
        </section>

        <div className={styles.log}>
          <LogPanel
            scrollKey={view.log.length}
            headerSlot={
              view.status === 'awaiting_approval' && waitingNode ? (
                <ApprovalBar
                  nodeTitle={nodeTitle(waitingNode)}
                  pending={decide.pending}
                  onApprove={() => void decide.run('approved')}
                  onReject={() => void decide.run('rejected')}
                />
              ) : null
            }
          >
            {decide.error && (
              <p role="alert" className={styles.error}>
                {decide.error}
              </p>
            )}
            <LogLines lines={view.log} />
          </LogPanel>
        </div>
      </div>
    </div>
  )
}
