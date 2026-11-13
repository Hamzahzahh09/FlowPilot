'use client'

import { useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { TextField } from '@/components/ui/TextField'
import { WaitNotice } from '@/components/ui/WaitNotice'
import { DEMO_ACCOUNT, checkCredentials, startSession } from '@/lib/auth/demo'
import { useNavigate } from '@/lib/navigation'
import { useSlow } from '@/lib/useSlow'
import styles from './LoginForm.module.css'

interface LoginFormProps {
  /** Already validated with safeNext on the server. */
  next: string
}

type Phase = 'idle' | 'signing-in' | 'loading-workspace'

const PHASE_TEXT: Record<Phase, string> = {
  idle: '',
  'signing-in': 'Signing in as demo…',
  'loading-workspace': 'Loading your workspace…',
}

/** Lets the browser paint the current status before the next step. */
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

export function LoginForm({ next }: LoginFormProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [attempt, setAttempt] = useState(0)
  const submitRef = useRef<HTMLButtonElement>(null)
  const pending = phase !== 'idle'
  const slow = useSlow(pending, attempt)

  // A full page load, not router.replace: the router may hold a prefetched
  // redirect to /login from before the session existed (production only),
  // and the app has its own shell anyway.
  const openWorkspace = () => {
    setAttempt((n) => n + 1)
    setPhase('loading-workspace')
    navigate.assign(next)
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending) return
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }
    if (!checkCredentials(email, password)) {
      setError('That email and password do not match the demo account. Use the demo account below.')
      return
    }
    setError(null)
    setPhase('signing-in')
    await nextFrame()
    try {
      startSession()
    } catch {
      setPhase('idle')
      setError('Could not save the session. Allow cookies for this site and try again.')
      return
    }
    openWorkspace()
  }

  const fillDemo = () => {
    setEmail(DEMO_ACCOUNT.email)
    setPassword(DEMO_ACCOUNT.password)
    setError(null)
    // Next step for keyboard users is signing in.
    submitRef.current?.focus()
  }

  return (
    <>
      <form
        className={styles.form}
        onSubmit={(event) => void onSubmit(event)}
        noValidate
        aria-describedby={error ? 'login-error' : undefined}
        aria-busy={pending || undefined}
      >
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          readOnly={pending}
          required
        />
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          readOnly={pending}
          required
          trailing={
            <button
              type="button"
              className={styles.reveal}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? 'Hide' : 'Show'}
              <span className="sr-only"> password</span>
            </button>
          }
        />

        <div role="alert" id="login-error" className={styles.error}>
          {error}
        </div>

        <p role="status" aria-live="polite" className={styles.status}>
          {pending && (
            <>
              <Spinner className={styles.statusSpinner} />
              <span>{PHASE_TEXT[phase]}</span>
            </>
          )}
        </p>

        <WaitNotice slow={slow} onRetry={openWorkspace} />

        <Button
          ref={submitRef}
          type="submit"
          variant="primary"
          size="lg"
          pending={pending}
          pendingLabel="Signing in…"
          className={styles.submit}
        >
          Sign in
        </Button>
      </form>

      <section className={styles.demo} aria-labelledby="demo-account-title">
        <h2 id="demo-account-title" className={styles.demoTitle}>
          Demo account
        </h2>
        <p className={styles.demoText}>Public test credentials for judges. Workflows and runs are shared demo data.</p>
        <dl className={styles.creds}>
          <div>
            <dt>Email</dt>
            <dd>{DEMO_ACCOUNT.email}</dd>
          </div>
          <div>
            <dt>Password</dt>
            <dd>{DEMO_ACCOUNT.password}</dd>
          </div>
        </dl>
        <Button onClick={fillDemo} className={styles.useDemo} disabled={pending}>
          Use demo account
        </Button>
      </section>
    </>
  )
}
