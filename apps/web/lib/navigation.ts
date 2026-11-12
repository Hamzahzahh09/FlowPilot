'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useSyncExternalStore } from 'react'

// Navigation progress for the App Router in Next 14 (no router events, no
// useLinkStatus). Link clicks and useNavigate() call startNavigation;
// NavigationProgress calls finishNavigation when the new route renders.

export type NavigationState = {
  active: boolean
  /** Target URL, used by Retry for a full load. */
  href: string | null
  /** performance.now() at start. */
  startedAt: number
}

const IDLE: NavigationState = { active: false, href: null, startedAt: 0 }
let state: NavigationState = IDLE
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** True when `href` leads to a different page of this site (not just a #hash). */
export function isNewLocation(href: string): boolean {
  let url: URL
  try {
    url = new URL(href, window.location.href)
  } catch {
    return false
  }
  if (url.origin !== window.location.origin) return false
  return url.pathname !== window.location.pathname || url.search !== window.location.search
}

export function startNavigation(href: string): void {
  if (!isNewLocation(href)) return
  state = { active: true, href: new URL(href, window.location.href).href, startedAt: performance.now() }
  emit()
}

export function finishNavigation(): void {
  if (!state.active) return
  const { href, startedAt } = state
  const ms = Math.round(performance.now() - startedAt)
  // Visible in the DevTools Performance panel in every build.
  try {
    performance.measure(`navigation ${href}`, { start: startedAt })
  } catch {
    // Older browsers without the options form: skip the measure.
  }
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[nav] ${href} rendered in ${ms} ms`)
  }
  state = IDLE
  emit()
}

export function useNavigationState(): NavigationState {
  return useSyncExternalStore(subscribe, () => state, () => IDLE)
}

/** router.push/replace that also starts the progress bar. */
export function useNavigate() {
  const router = useRouter()
  return useMemo(
    () => ({
      push(href: string) {
        startNavigation(href)
        router.push(href)
      },
      replace(href: string) {
        startNavigation(href)
        router.replace(href)
      },
      /** Full page load, for leaving or entering the logged-in app. */
      assign(href: string) {
        startNavigation(href)
        window.location.assign(href)
      },
    }),
    [router],
  )
}
