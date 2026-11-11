import WorkflowCanvas from '../[id]/edit/components/WorkflowCanvas'
import type { WorkflowData } from 'shared'

const EMPTY_WORKFLOW: WorkflowData = {
  nodes: [],
  edges: [],
}

export default function NewWorkflowPage() {
  return <WorkflowCanvas workflowId="new" initialData={EMPTY_WORKFLOW} />
}
