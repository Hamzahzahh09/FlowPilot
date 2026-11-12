import type { Metadata } from 'next'
import { ComingLater } from '@/components/app/ComingLater'
import { RunsIcon } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Runs · FlowPilot',
}

export default function RunsPage() {
  return (
    <ComingLater
      title="Runs"
      description="Every run of every workflow, newest first."
      icon={<RunsIcon size={26} />}
    >
      Run history with filters is planned. For now, start a run from a workflow and open its live view
      and report from there.
    </ComingLater>
  )
}
