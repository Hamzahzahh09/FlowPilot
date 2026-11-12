'use client'

import { PageHeader } from '@/components/app/PageHeader'
import { useSetTopBarDetail } from '@/components/app/TopBarContext'
import { RunsIcon } from '@/components/icons'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { EmptyState } from '@/components/ui/EmptyState'
import { data } from '@/lib/data'
import { useQuery } from '@/lib/data/hooks'
import { isFinished } from '@/lib/data/runStatus'
import { useRunView } from '@/lib/run/useRunView'
import { ReportCard } from './ReportCard'
import styles from './RunView.module.css'

export function ReportView({ id }: { id: string }) {
  const query = useQuery(`run:${id}`, () => data.runs.get(id))
  const run = query.status === 'ready' ? query.data : null
  const view = useRunView(run)
  useSetTopBarDetail(run ? `${run.workflowName} report` : null)

  if (query.status === 'loading') {
    return (
      <p className={styles.loading} role="status">
        Loading report…
      </p>
    )
  }

  if (!run || !view) {
    return (
      <PageHeader
        title="Report not found"
        description="Runs and their reports are stored in this browser only."
        actions={<ButtonLink href="/workflows">Back to workflows</ButtonLink>}
      />
    )
  }

  const back = (
    <>
      <ButtonLink href={`/workflows/${run.workflowId}`}>Back to workflow</ButtonLink>
      <ButtonLink href={`/runs/${run.id}`}>Live run view</ButtonLink>
    </>
  )

  return (
    <>
      <PageHeader
        title="Autopsy report"
        description={`${run.workflowName} · run ${run.id.slice(0, 8)}`}
        actions={back}
      />
      {isFinished(view.status) ? (
        <ReportCard run={run} view={view} />
      ) : (
        <EmptyState
          title="This run has not finished yet"
          icon={<RunsIcon size={26} />}
          action={
            <ButtonLink href={`/runs/${run.id}`} variant="primary">
              Open the live run
            </ButtonLink>
          }
        >
          {view.status === 'awaiting_approval'
            ? 'It is waiting at the Lightning Lever. Approve or reject it in the live view, then the report is written.'
            : 'The report is written when the last step finishes.'}
        </EmptyState>
      )}
    </>
  )
}
