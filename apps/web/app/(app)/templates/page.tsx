import type { Metadata } from 'next'
import { ComingLater } from '@/components/app/ComingLater'
import { WorkflowsIcon } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Templates · FlowPilot',
}

export default function TemplatesPage() {
  return (
    <ComingLater
      title="Templates"
      description="Ready-made workflows you can copy and adjust."
      icon={<WorkflowsIcon size={26} />}
    >
      Templates are planned. The Automated code review workflow in your list is a good starting point
      today.
    </ComingLater>
  )
}
