'use client'

import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/app/PageHeader'
import { PlusIcon, WorkflowsIcon } from '@/components/icons'
import { WorkflowsSkeleton } from '@/components/skeletons/PageSkeletons'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { data } from '@/lib/data'
import { useAction, useQuery } from '@/lib/data/hooks'
import { WorkflowCard } from './WorkflowCard'
import styles from './WorkflowList.module.css'

export function WorkflowList() {
  const router = useRouter()
  const list = useQuery('workflows', () => data.workflows.list())

  const create = useAction(async () => {
    const workflow = await data.workflows.create()
    router.push(`/workflows/${workflow.id}`)
  })

  const simulate = useAction(async (workflowId: string) => {
    const run = await data.runs.start(workflowId)
    router.push(`/runs/${run.id}`)
  })

  const newButton = (
    <Button variant="primary" icon={<PlusIcon />} onClick={() => void create.run()} disabled={create.pending}>
      {create.pending ? 'Creating…' : 'New workflow'}
    </Button>
  )

  return (
    <>
      <PageHeader
        title="Workflows"
        description="Each workflow runs on a push: AI review, lint and tests, then it waits for your approval."
        actions={newButton}
      />

      <div role="alert" className={styles.error}>
        {create.error || simulate.error}
      </div>

      {list.status === 'loading' && <WorkflowsSkeleton header={false} />}

      {list.status === 'error' && (
        <p className={styles.error}>Could not load workflows: {list.error}</p>
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
                simulating={simulate.pending}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
