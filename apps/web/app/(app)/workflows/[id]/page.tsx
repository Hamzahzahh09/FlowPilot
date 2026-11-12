import type { Metadata } from 'next'
import { WorkflowEditor } from '@/components/editor/WorkflowEditor'

export const metadata: Metadata = {
  title: 'Workflow editor · FlowPilot',
}

export default function WorkflowPage({ params }: { params: { id: string } }) {
  return <WorkflowEditor id={params.id} />
}
