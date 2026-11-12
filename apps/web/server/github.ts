import { randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'
import type { GithubSettingsPatch } from 'shared'
import { githubSettings, type GithubSettingsRow } from '@/db/schema'
import type { GithubSettings } from '@/lib/data/types'
import { iso, requireDb } from './http'

// Server only. One settings row (id = 1) for the demo account.

const ROW_ID = 1
export const WEBHOOK_PATH = '/api/github/webhook'

const newSecret = () => `whsec_${randomBytes(20).toString('hex')}`

function toSettings(row: GithubSettingsRow): GithubSettings {
  return {
    repository: row.repository,
    connectedAt: iso(row.connectedAt),
    webhookPath: WEBHOOK_PATH,
    webhookSecret: row.webhookSecret,
    triggers: { push: row.triggerPush, pullRequest: row.triggerPullRequest },
  }
}

export async function getGithubSettings(): Promise<GithubSettings> {
  const db = requireDb()
  // Create the row on first use, with a fresh webhook secret.
  await db.insert(githubSettings).values({ id: ROW_ID, webhookSecret: newSecret() }).onConflictDoNothing()
  const [row] = await db.select().from(githubSettings).where(eq(githubSettings.id, ROW_ID)).limit(1)
  return toSettings(row)
}

export async function patchGithubSettings(patch: GithubSettingsPatch): Promise<GithubSettings> {
  const db = requireDb()
  await getGithubSettings()
  const now = new Date()
  const set =
    patch.action === 'connect'
      ? { repository: patch.repository, connectedAt: now }
      : patch.action === 'disconnect'
        ? { repository: null, connectedAt: null }
        : { triggerPush: patch.triggers.push, triggerPullRequest: patch.triggers.pullRequest }
  const [row] = await db
    .update(githubSettings)
    .set({ ...set, updatedAt: now })
    .where(eq(githubSettings.id, ROW_ID))
    .returning()
  return toSettings(row)
}
