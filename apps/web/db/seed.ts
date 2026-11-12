import { createHash, randomBytes } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { DEMO_WORKFLOW, demoGraph } from '../lib/data/demo'
import { db } from './client'
import { githubSettings, runners, workflows } from './schema'

/**
 * Demo data for the hosted demo. Safe to run again:
 * - the demo workflow is reset to the default graph (name, description, graph),
 * - runners and GitHub settings are created once and then left alone.
 * Other workflows and all runs are not touched.
 */
const unusableTokenHash = () => createHash('sha256').update(randomBytes(32)).digest('hex')

const DEMO_RUNNERS = [
  { id: '750e8400-e29b-41d4-a716-446655440001', name: 'Hosted sandbox', status: 'online', tokenPreview: 'fpr_…sbx1' },
  { id: '750e8400-e29b-41d4-a716-446655440002', name: 'My laptop', status: 'offline', tokenPreview: 'fpr_…7c2e' },
] as const

async function seed() {
  if (!db) throw new Error('DATABASE_URL is required to seed the database')
  console.log('Seeding database...')

  const values = { ...DEMO_WORKFLOW, data: demoGraph() }
  await db
    .insert(workflows)
    .values(values)
    .onConflictDoUpdate({
      target: workflows.id,
      set: { name: values.name, description: values.description, data: values.data, updatedAt: sql`now()` },
    })
  console.log(`Demo workflow "${values.name}" (${values.id})`)

  for (const runner of DEMO_RUNNERS) {
    await db
      .insert(runners)
      .values({
        ...runner,
        // Demo rows have no real token: the hash matches nothing.
        tokenHash: unusableTokenHash(),
        lastSeenAt: runner.status === 'online' ? new Date() : null,
      })
      .onConflictDoNothing()
  }
  console.log(`Demo runners: ${DEMO_RUNNERS.map((r) => r.name).join(', ')}`)

  await db
    .insert(githubSettings)
    .values({ id: 1, webhookSecret: `whsec_${randomBytes(20).toString('hex')}` })
    .onConflictDoNothing()
  console.log('GitHub settings row')
}

seed()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error('Seed failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  })
