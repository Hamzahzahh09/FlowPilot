'use client'

import { PageHeader } from '@/components/app/PageHeader'
import { useSetTopBarDetail } from '@/components/app/TopBarContext'
import { LogPanel } from '@/components/shell/LogPanel'
import { RunSkeleton } from '@/components/skeletons/PageSkeletons'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { WaitNotice } from '@/components/ui/WaitNotice'
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

  const decide = useAction((decision: RunDecision) => data.runs.decide(id, decision), {
    // The bar disappears; keep keyboard focus in the log instead of losing it.
    onSuccess: () => document.getElementById('log-heading')?.focus(),
  })

  if (query.status === 'loading') {
    return <RunSkeleton notice={<WaitNotice slow={query.slow} onRetry={query.retry} />} />
  }

  if (query.status === 'error') {
    return (
      <>
        <PageHeader
          title="Could not load the run"
          actions={<ButtonLink href="/workflows">Back to workflows</ButtonLink>}
        />
        <WaitNotice error={query.error} onRetry={query.retry} />
      </>
    )
  }

  if (!run || !view) {
    return (
      <PageHeader
        title="Run not found"
        description="It may have been deleted, or the link is incomplete. Start a new one from your workflows."
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
                  pending={decide.pendingArgs?.[0] ?? null}
                  onApprove={() => void decide.run('approved')}
                  onReject={() => void decide.run('rejected')}
                />
              ) : null
            }
          >
            <WaitNotice
              pendingText={
                decide.pendingArgs ? (decide.pendingArgs[0] === 'approved' ? 'Approving…' : 'Rejecting…') : null
              }
              slow={decide.slow}
              error={decide.error && `Could not send your decision: ${decide.error}`}
              onRetry={decide.retry}
            />
            <LogLines lines={view.log} />
          </LogPanel>
        </div>
      </div>
    </div>
  )
}
