'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { WaitNotice } from '@/components/ui/WaitNotice'
import { finishNavigation, isNewLocation, startNavigation, useNavigationState } from '@/lib/navigation'
import { useSlow } from '@/lib/useSlow'
import styles from './NavigationProgress.module.css'

const FADE_MS = 400

/** Starts the bar for a click on an internal link that Next will handle. */
function onDocumentClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const target = event.target
  if (!(target instanceof Element)) return
  const link = target.closest('a[href]')
  if (!(link instanceof HTMLAnchorElement)) return
  if (link.hasAttribute('download')) return
  if (link.target && link.target !== '_self') return
  if (!isNewLocation(link.href)) return
  startNavigation(link.href)
}

/**
 * Top progress bar for page transitions. Mounted once in the root layout
 * inside <Suspense> (useSearchParams).
 */
export function NavigationProgress() {
  const { active, href, startedAt } = useNavigationState()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [fading, setFading] = useState(false)
  const wasActive = useRef(false)
  const slow = useSlow(active, startedAt)

  // Capture phase: runs before Link's own click handler.
  useEffect(() => {
    document.addEventListener('click', onDocumentClick, true)
    return () => document.removeEventListener('click', onDocumentClick, true)
  }, [])

  // The new route has rendered once the URL the router renders has changed.
  useEffect(() => {
    finishNavigation()
  }, [pathname, searchParams])

  // Fade out only when a navigation just finished.
  useEffect(() => {
    const finished = wasActive.current && !active
    wasActive.current = active
    if (!finished) {
      setFading(false)
      return
    }
    setFading(true)
    const timer = window.setTimeout(() => setFading(false), FADE_MS)
    return () => window.clearTimeout(timer)
  }, [active])

  return (
    <>
      {(active || fading) && (
        <div aria-hidden="true" className={`${styles.bar} ${active ? styles.loading : styles.done}`} />
      )}
      <div className={styles.notice}>
        {/* Retry: a full load of the target, in case the client navigation is stuck. */}
        <WaitNotice
          pendingText={active ? 'Loading page…' : null}
          slow={slow}
          onRetry={href ? () => window.location.assign(href) : undefined}
          className={styles.noticeBox}
        />
      </div>
    </>
  )
}
