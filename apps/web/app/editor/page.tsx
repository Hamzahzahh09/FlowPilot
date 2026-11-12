import { redirect } from 'next/navigation'
import { DEMO_WORKFLOW_ID } from '@/lib/data/demo'

// The editor moved to /workflows/[id]; old links land on the demo workflow.
export default function EditorRedirect() {
  redirect(`/workflows/${DEMO_WORKFLOW_ID}`)
}
