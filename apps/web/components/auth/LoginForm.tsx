'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { DEMO_ACCOUNT, checkCredentials, startSession } from '@/lib/auth/demo'
import styles from './LoginForm.module.css'

interface LoginFormProps {
  /** Already validated with safeNext on the server. */
  next: string
}

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const submitRef = useRef<HTMLButtonElement>(null)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }
    if (!checkCredentials(email, password)) {
      setError('That email and password do not match the demo account. Use the demo account below.')
      return
    }
    setError(null)
    setPending(true)
    startSession()
    router.replace(next)
    router.refresh()
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
      <form className={styles.form} onSubmit={onSubmit} noValidate aria-describedby={error ? 'login-error' : undefined}>
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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

        <Button ref={submitRef} type="submit" variant="primary" size="lg" disabled={pending} className={styles.submit}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <section className={styles.demo} aria-labelledby="demo-account-title">
        <h2 id="demo-account-title" className={styles.demoTitle}>
          Demo account
        </h2>
        <p className={styles.demoText}>Public test credentials for judges. Data stays in this browser.</p>
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
        <Button onClick={fillDemo} className={styles.useDemo}>
          Use demo account
        </Button>
      </section>
    </>
  )
}
