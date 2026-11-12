'use client'

import { useState, type FormEvent } from 'react'
import { PageHeader } from '@/components/app/PageHeader'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/CopyButton'
import { Badge } from '@/components/ui/StatusBadge'
import { Switch } from '@/components/ui/Switch'
import { TextField } from '@/components/ui/TextField'
import { data, type GithubSettings } from '@/lib/data'
import { useAction, useQuery } from '@/lib/data/hooks'
import { absoluteTime } from '@/lib/format'
import styles from './Settings.module.css'

function mask(secret: string): string {
  return `${secret.slice(0, 6)}${'•'.repeat(16)}${secret.slice(-4)}`
}

export function GithubSettingsPage() {
  const query = useQuery('github', () => data.github.get())

  return (
    <>
      <PageHeader
        title="GitHub settings"
        description="Connect a repository and choose which GitHub events start a run."
      />
      {query.status === 'loading' && (
        <p className={styles.muted} role="status">
          Loading settings…
        </p>
      )}
      {query.status === 'error' && <p className={styles.error}>Could not load settings: {query.error}</p>}
      {query.status === 'ready' && <GithubForm settings={query.data} />}
    </>
  )
}

function GithubForm({ settings }: { settings: GithubSettings }) {
  const [repo, setRepo] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const connect = useAction((value: string) => data.github.connect(value))
  const disconnect = useAction(() => data.github.disconnect())
  const triggers = useAction((next: GithubSettings['triggers']) => data.github.setTriggers(next))
  const webhookUrl = `${window.location.origin}${settings.webhookPath}`

  const onConnect = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void connect.run(repo).then((result) => {
      if (result) setRepo('')
    })
  }

  return (
    <div className={styles.stack}>
      <section className={styles.card} aria-labelledby="repo-title">
        <h2 id="repo-title" className={styles.cardTitle}>
          Repository
        </h2>
        {settings.repository ? (
          <>
            <div className={styles.item}>
              <span className={`${styles.itemName}`}>{settings.repository}</span>
              <Badge tone="ok" label="Connected" />
              {settings.connectedAt && (
                <span className={styles.itemMeta}>Connected {absoluteTime(settings.connectedAt)}</span>
              )}
            </div>
            <div>
              <Button onClick={() => void disconnect.run()} disabled={disconnect.pending}>
                Disconnect repository
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.muted}>Not connected. Pushes only start runs once a repository is connected.</p>
            <form className={styles.row} onSubmit={onConnect}>
              <TextField
                label="Repository"
                placeholder="owner/repository"
                autoComplete="off"
                spellCheck={false}
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                error={connect.error}
              />
              <Button type="submit" variant="primary" disabled={connect.pending || !repo.trim()}>
                {connect.pending ? 'Connecting…' : 'Connect repository'}
              </Button>
            </form>
          </>
        )}
      </section>

      <section className={styles.card} aria-labelledby="webhook-title">
        <h2 id="webhook-title" className={styles.cardTitle}>
          Webhook
        </h2>
        <p className={styles.muted}>
          In GitHub, open Settings, then Webhooks, add this URL with content type application/json, and
          paste the secret. FlowPilot rejects deliveries with a wrong signature.
        </p>
        <div className={styles.row}>
          <TextField label="Webhook URL" value={webhookUrl} readOnly />
          <CopyButton value={webhookUrl} what="webhook URL" />
        </div>
        <div className={styles.row}>
          <TextField
            label="Webhook secret"
            value={showSecret ? settings.webhookSecret : mask(settings.webhookSecret)}
            readOnly
            hint="Hidden by default. Never share it or put it in a prompt."
          />
          <Button onClick={() => setShowSecret((v) => !v)} aria-pressed={showSecret}>
            {showSecret ? 'Hide' : 'Show'}
            <span className="sr-only"> webhook secret</span>
          </Button>
          <CopyButton value={settings.webhookSecret} what="webhook secret" />
        </div>
      </section>

      <section className={styles.card} aria-labelledby="triggers-title">
        <h2 id="triggers-title" className={styles.cardTitle}>
          Triggers
        </h2>
        <Switch
          label="Push"
          description="Start a run for every push to the default branch."
          checked={settings.triggers.push}
          disabled={triggers.pending}
          onChange={(push) => void triggers.run({ ...settings.triggers, push })}
        />
        <Switch
          label="Pull request"
          description="Start a run when a pull request is opened or updated."
          checked={settings.triggers.pullRequest}
          disabled={triggers.pending}
          onChange={(pullRequest) => void triggers.run({ ...settings.triggers, pullRequest })}
        />
        <p role="alert" className={styles.error}>
          {triggers.error}
        </p>
      </section>
    </div>
  )
}
