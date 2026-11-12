'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDownIcon } from '@/components/icons'
import { DEMO_ACCOUNT, endSession } from '@/lib/auth/demo'
import { useNavigate } from '@/lib/navigation'
import styles from './UserMenu.module.css'

// Disclosure (button + panel), not an ARIA menu: Tab moves through the panel.
export function UserMenu() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Full load: drops the client router cache, so Back does not show app
  // pages from before sign-out.
  const signOut = () => {
    endSession()
    navigate.assign('/login')
  }

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.avatar} aria-hidden="true">
          D
        </span>
        <span className={styles.email}>{DEMO_ACCOUNT.email}</span>
        <span className="sr-only">Account menu</span>
        <ChevronDownIcon size={16} />
      </button>

      <div id={panelId} className={styles.panel} hidden={!open}>
        <p className={styles.signedIn}>
          Signed in as
          <br />
          <strong>{DEMO_ACCOUNT.email}</strong>
        </p>
        <p className={styles.note}>Demo account. Workflows and runs are shared demo data.</p>
        <button type="button" className={styles.signOut} onClick={signOut}>
          Sign out
        </button>
      </div>
    </div>
  )
}
