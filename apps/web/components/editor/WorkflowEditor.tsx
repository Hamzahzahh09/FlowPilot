'use client'

import { ReactFlowProvider } from '@xyflow/react'
import { PageHeader } from '@/components/app/PageHeader'
import { useSetTopBarDetail } from '@/components/app/TopBarContext'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { data } from '@/lib/data'
import { useQuery } from '@/lib/data/hooks'
import { EditorWorkbench } from './EditorWorkbench'
import styles from './WorkflowEditor.module.css'

export function WorkflowEditor({ id }: { id: string }) {
  const query = useQuery(`workflow:${id}`, () => data.workflows.get(id))
  useSetTopBarDetail(query.status === 'ready' && query.data ? query.data.name : null)

  if (query.status === 'loading') {
    return (
      <p className={styles.loading} role="status">
        Loading workflow…
      </p>
    )
  }

  if (query.status === 'error' || !query.data) {
    return (
      <PageHeader
        title="Workflow not found"
        description={
          query.status === 'error'
            ? `Could not load it: ${query.error}`
            : 'It may have been created in another browser. Workflows are stored in this browser only.'
        }
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
