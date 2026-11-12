'use client'

import { useState, type FormEvent } from 'react'
import { PageHeader } from '@/components/app/PageHeader'
import { PlusIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/CopyButton'
import { Badge } from '@/components/ui/StatusBadge'
import { TextField } from '@/components/ui/TextField'
import { WaitNotice } from '@/components/ui/WaitNotice'
import { data } from '@/lib/data'
import { useAction, useQuery } from '@/lib/data/hooks'
import { absoluteTime, relativeTime } from '@/lib/format'
import styles from './Settings.module.css'

// The local runner (packages/runner) has no CLI yet; these are the planned commands.
const SETUP_STEPS = [
  {
    title: 'Install the runner',
    text: 'Needs Node.js 20 or later.',
    command: 'npm install --global flowpilot-runner',
  },
  {
    title: 'Paste your token',
    text: 'The command asks for the token, so it never ends up in your shell history.',
    command: 'flowpilot-runner login',
  },
  {
    title: 'Run it in your project folder',
    text: 'It only runs allowlisted commands such as npm run lint and npm test.',
    command: 'cd path/to/your-repo\nflowpilot-runner start',
  },
] as const

export function RunnersPage() {
  const list = useQuery('runners', () => data.runners.list())
  const [name, setName] = useState('')
  const [created, setCreated] = useState<{ name: string; token: string } | null>(null)
  const create = useAction((runnerName: string) => data.runners.createToken(runnerName), {
    onSuccess: (result) => {
      setCreated({ name: result.runner.name, token: result.token })
      setName('')
    },
  })

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void create.run(name)
  }

  return (
    <>
      <PageHeader
        title="Runners"
        description="A runner executes lint and test steps. Use the hosted sandbox, or connect a runner on your own machine."
      />

      <div className={styles.stack}>
        <section className={styles.card} aria-labelledby="runner-list-title">
          <h2 id="runner-list-title" className={styles.cardTitle}>
            Your runners
          </h2>
          {list.status === 'loading' && (
            <p className={styles.muted} role="status">
              Loading runners…
            </p>
          )}
          {list.status === 'loading' && <WaitNotice slow={list.slow} onRetry={list.retry} />}
          {list.status === 'error' && (
            <WaitNotice error={`Could not load runners: ${list.error}`} onRetry={list.retry} />
          )}
          {list.status === 'ready' && (
            <ul className={styles.list}>
              {list.data.map((runner) => (
                <li key={runner.id} className={styles.item}>
                  <span className={styles.itemName}>{runner.name}</span>
                  {runner.status === 'online' ? (
                    <Badge tone="ok" label="Online" />
                  ) : (
                    <Badge tone="muted" label="Offline" />
                  )}
                  <span className={styles.itemMeta}>
                    Token {runner.tokenPreview} ·{' '}
                    {runner.lastSeenAt ? (
                      <>
                        last seen{' '}
                        <time dateTime={runner.lastSeenAt} title={absoluteTime(runner.lastSeenAt)}>
                          {relativeTime(runner.lastSeenAt)}
                        </time>
                      </>
                    ) : (
                      'never connected'
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.card} aria-labelledby="token-title">
          <h2 id="token-title" className={styles.cardTitle}>
            Create runner token
          </h2>
          <p className={styles.muted}>
            Each runner gets its own token. Only a hash is stored, so the token is shown once.
          </p>
          <form className={styles.row} onSubmit={onSubmit}>
            <TextField
              label="Runner name"
              placeholder="My laptop"
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit" variant="primary" icon={<PlusIcon />} disabled={create.pending}>
              {create.pending ? 'Creating…' : 'Create runner token'}
            </Button>
          </form>
          <p role="alert" className={styles.error}>
            {create.error}
          </p>

          <p role="status" className="sr-only">
            {created ? `Token for ${created.name} created. Copy it now, it is shown once.` : ''}
          </p>

          {created && (
            <div className={styles.notice}>
              <p>
                <strong>Token for {created.name}.</strong> Copy it now. It will not be shown again.
              </p>
              <div className={styles.code}>
                <pre aria-label="Runner token">{created.token}</pre>
                <CopyButton value={created.token} what="runner token" />
              </div>
              <Button onClick={() => setCreated(null)}>I saved it, hide the token</Button>
            </div>
          )}
        </section>

        <section className={styles.card} aria-labelledby="setup-title">
          <h2 id="setup-title" className={styles.cardTitle}>
            Set up a local runner
          </h2>
          <p className={styles.muted}>
            Planned commands. The local runner is not published yet, so use the hosted sandbox for the
            demo.
          </p>
          <ol className={styles.steps}>
            {SETUP_STEPS.map((step) => (
              <li key={step.title}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.muted}>{step.text}</p>
                <div className={styles.code}>
                  <pre>{step.command}</pre>
                  <CopyButton value={step.command} what={`command: ${step.title}`} />
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  )
}
