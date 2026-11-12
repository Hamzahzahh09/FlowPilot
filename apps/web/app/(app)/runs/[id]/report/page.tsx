import type { Metadata } from 'next'
import { ReportView } from '@/components/run/ReportView'

export const metadata: Metadata = {
  title: 'Autopsy report · FlowPilot',
}

export default function ReportPage({ params }: { params: { id: string } }) {
  return <ReportView id={params.id} />
}
