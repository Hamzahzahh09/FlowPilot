import type { ComponentType } from 'react'
import { RunnerIcon, RunsIcon, SettingsIcon, WorkflowsIcon, type IconProps } from '@/components/icons'

export type NavItem = {
  href: string
  label: string
  /** Paths that mark this item as current. */
  match: string
  icon: ComponentType<IconProps>
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/workflows', label: 'Workflows', match: '/workflows', icon: WorkflowsIcon },
  { href: '/runs', label: 'Runs', match: '/runs', icon: RunsIcon },
  { href: '/runners', label: 'Runners', match: '/runners', icon: RunnerIcon },
  { href: '/settings/github', label: 'Settings', match: '/settings', icon: SettingsIcon },
]

/** Templates is reachable but not in the nav (P2). */
const EXTRA_SECTIONS: Record<string, string> = { '/templates': 'Templates' }

export function isCurrent(pathname: string, match: string): boolean {
  return pathname === match || pathname.startsWith(`${match}/`)
}

export function sectionTitle(pathname: string): string {
  const item = NAV_ITEMS.find((i) => isCurrent(pathname, i.match))
  if (item) return item.label
  const extra = Object.keys(EXTRA_SECTIONS).find((p) => isCurrent(pathname, p))
  return extra ? EXTRA_SECTIONS[extra] : 'FlowPilot'
}
