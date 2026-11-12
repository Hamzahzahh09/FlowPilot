import type { ReactNode } from 'react'
import { PageHeader } from '@/components/app/PageHeader'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { EmptyState } from '@/components/ui/EmptyState'

interface ComingLaterProps {
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
}

/** P2 pages: the route exists, the feature does not yet. */
export function ComingLater({ title, description, icon, children }: ComingLaterProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState
        title="Coming later"
        icon={icon}
        action={<ButtonLink href="/workflows">Go to workflows</ButtonLink>}
      >
        {children}
      </EmptyState>
    </>
  )
}
