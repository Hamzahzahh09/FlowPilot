import type { Metadata } from 'next'
import { GithubSettingsPage } from '@/components/settings/GithubSettingsPage'

export const metadata: Metadata = {
  title: 'GitHub settings · FlowPilot',
}

export default function Page() {
  return <GithubSettingsPage />
}
