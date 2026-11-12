'use client'

import { ReactFlowProvider } from '@xyflow/react'
import { PageHeader } from '@/components/app/PageHeader'
import { useSetTopBarDetail } from '@/components/app/TopBarContext'
import { EditorSkeleton } from '@/components/skeletons/PageSkeletons'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { WaitNotice } from '@/components/ui/WaitNotice'
import { data } from '@/lib/data'
import { useQuery } from '@/lib/data/hooks'
import { EditorWorkbench } from './EditorWorkbench'

export function WorkflowEditor({ id }: { id: string }) {
  const query = useQuery(`workflow:${id}`, () => data.workflows.get(id))
  useSetTopBarDetail(query.status === 'ready' && query.data ? query.data.name : null)

  if (query.status === 'loading') {
    return <EditorSkeleton notice={<WaitNotice slow={query.slow} onRetry={query.retry} />} />
  }

  if (query.status === 'error') {
    return (
      <>
        <PageHeader
          title="Could not load the workflow"
          actions={<ButtonLink href="/workflows">Back to workflows</ButtonLink>}
        />
        <WaitNotice error={query.error} onRetry={query.retry} />
      </>
    )
  }

  if (!query.data) {
    return (
      <PageHeader
        title="Workflow not found"
        description="It may have been deleted, or the link is incomplete."
        actions={<ButtonLink href="/workflows">Back to workflows</ButtonLink>}
      />
    )
  }

  // The workbench keeps its own editing state; a reload after Save does not reset it.
  return (
    <ReactFlowProvider>
      <EditorWorkbench key={query.data.id} workflow={query.data} />
    </ReactFlowProvider>
  )
}
