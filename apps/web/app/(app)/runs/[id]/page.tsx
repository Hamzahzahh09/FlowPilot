import type { Metadata } from 'next'
import { RunLiveView } from '@/components/run/RunView'

export const metadata: Metadata = {
  title: 'Run · FlowPilot',
}

export default function RunPage({ params }: { params: { id: string } }) {
  return <RunLiveView id={params.id} />
}
