import type { Metadata } from 'next'
import { WorkflowList } from '@/components/workflows/WorkflowList'

export const metadata: Metadata = {
  title: 'Workflows · FlowPilot',
}

export default function WorkflowsPage() {
  return <WorkflowList />
}
