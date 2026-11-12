import type { Metadata } from 'next'
import { RunnersPage } from '@/components/settings/RunnersPage'

export const metadata: Metadata = {
  title: 'Runners · FlowPilot',
}

export default function Page() {
  return <RunnersPage />
}
