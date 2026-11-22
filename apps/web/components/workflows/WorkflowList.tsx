'use client'

import { PageHeader } from '@/components/app/PageHeader'
import { PlusIcon, WorkflowsIcon } from '@/components/icons'
import { WorkflowsSkeleton } from '@/components/skeletons/PageSkeletons'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { WaitNotice } from '@/components/ui/WaitNotice'
import { data } from '@/lib/data'
import { useAction, useQuery } from '@/lib/data/hooks'
import { useNavigate } from '@/lib/navigation'
import { WorkflowCard } from './WorkflowCard'
import styles from './WorkflowList.module.css'

export function WorkflowList() {
  const navigate = useNavigate()
  const list = useQuery('workflows', () => data.workflows.list())

  const create = useAction(() => data.workflows.create(), {
    holdOnSuccess: true,
    onSuccess: (workflow) => navigate.push(`/workflows/${workflow.id}`),
  })

  const simulate = useAction((workflowId: string) => data.runs.start(workflowId), {
    holdOnSuccess: true,
    onSuccess: (run) => navigate.push(`/runs/${run.id}`),
  })

  const remove = useAction((workflowId: string) => data.workflows.delete(workflowId))
  const duplicate = useAction((workflowId: string) => data.workflows.duplicate(workflowId))

  const busy = create.pending || simulate.pending || remove.pending || duplicate.pending
  const simulatingId = simulate.pendingArgs?.[0] ?? null
  const deletingId = remove.pendingArgs?.[0] ?? null
  const duplicatingId = duplicate.pendingArgs?.[0] ?? null
  // One notice for whichever action ran last.
  const action =
    create.pending || create.error
      ? create
      : remove.pending || remove.error
        ? remove
        : duplicate.pending || duplicate.error
          ? duplicate
          : simulate
  const actionName =
    action === create
      ? 'create the workflow'
      : action === remove
        ? 'delete the workflow'
        : action === duplicate
          ? 'duplicate the workflow'
          : 'start the run'

  const newButton = (
    <Button
      variant="primary"
      icon={<PlusIcon />}
      onClick={() => void create.run()}
      disabled={busy}
      pending={create.pending}
      pendingLabel="Creating…"
    >
      New workflow
    </Button>
  )

  return (
    <>
      <PageHeader
        title="Workflows"
        description="Each workflow runs on a push: AI review, lint and tests, then it waits for your approval."
        actions={newButton}
      />

      <WaitNotice
        pendingText={
          create.pending
            ? 'Creating workflow…'
            : simulate.pending
              ? 'Starting run…'
              : remove.pending
                ? 'Deleting workflow…'
                : duplicate.pending
                  ? 'Duplicating workflow…'
                  : null
        }
        slow={action.slow}
        error={action.error && `Could not ${actionName}: ${action.error}`}
        onRetry={action.retry}
      />

      {list.status === 'loading' && (
        <WorkflowsSkeleton header={false} notice={<WaitNotice slow={list.slow} onRetry={list.retry} />} />
      )}

      {list.status === 'error' && (
        <WaitNotice error={`Could not load workflows: ${list.error}`} onRetry={list.retry} />
      )}

      {list.status === 'ready' && list.data.length === 0 && (
        <EmptyState
          title="No workflows yet"
          icon={<WorkflowsIcon size={26} />}
          action={newButton}
        >
          A workflow starts with a Spark (what triggers it) and ends with an Autopsy report. Create
          one, add the checks you want in between, then press Simulate push to try it.
        </EmptyState>
      )}

      {list.status === 'ready' && list.data.length > 0 && (
        <ul className={styles.grid} aria-label="Your workflows">
          {list.data.map((workflow) => (
            <li key={workflow.id}>
              <WorkflowCard
                workflow={workflow}
                onSimulate={() => void simulate.run(workflow.id)}
                onDelete={() => void remove.run(workflow.id)}
                onDuplicate={() => void duplicate.run(workflow.id)}
                disabled={busy}
                simulating={simulatingId === workflow.id}
                deleting={deletingId === workflow.id}
                duplicating={duplicatingId === workflow.id}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
