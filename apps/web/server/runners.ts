import { createHash, randomBytes } from 'node:crypto'
import { desc } from 'drizzle-orm'
import { runners, type RunnerRow } from '@/db/schema'
import type { Runner, RunnerStatus } from '@/lib/data/types'
import { iso, requireDb } from './http'

// Server only. security.md 8: tokens are per runner and stored hashed.

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

/** Never includes the token hash. */
function toRunner(row: RunnerRow): Runner {
  return {
    id: row.id,
    name: row.name,
    status: row.status as RunnerStatus,
    lastSeenAt: iso(row.lastSeenAt),
    createdAt: row.createdAt.toISOString(),
    tokenPreview: row.tokenPreview,
  }
}

export async function listRunners(): Promise<Runner[]> {
  const db = requireDb()
  const rows = await db.select().from(runners).orderBy(desc(runners.createdAt))
  return rows.map(toRunner)
}

/** Returns the plain token once. Only its hash and a preview are stored. */
export async function createRunnerToken(name: string): Promise<{ runner: Runner; token: string }> {
  const db = requireDb()
  const token = `fpr_${randomBytes(24).toString('hex')}`
  const [row] = await db
    .insert(runners)
    .values({
      name: name || 'New runner',
      status: 'offline',
      tokenHash: hashToken(token),
      tokenPreview: `fpr_…${token.slice(-4)}`,
    })
    .returning()
  return { runner: toRunner(row), token }
}
