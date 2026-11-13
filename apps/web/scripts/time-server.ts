// Times the server data functions directly against Neon (no HTTP).
//   npx tsx --env-file=.env.local scripts/time-server.ts
import { sql } from 'drizzle-orm'
import { db } from '../db/client'
import { DEMO_WORKFLOW_ID } from '../lib/data/demo'
import { getRun, latestRunPerWorkflow, listRuns } from '../server/runs'
import { getWorkflow, listWorkflows } from '../server/workflows'

async function time(name: string, fn: () => Promise<unknown>, n = 4) {
  const ms: number[] = []
  for (let i = 0; i < n; i++) {
    const t = performance.now()
    await fn()
    ms.push(Math.round(performance.now() - t))
  }
  console.log(`${name.padEnd(24)} ${ms.join('  ')} ms`)
}

async function main() {
  if (!db) throw new Error('DATABASE_URL is required')
  await time('select 1', () => db!.execute(sql`select 1`))
  await time('getWorkflow', () => getWorkflow(DEMO_WORKFLOW_ID))
  await time('listWorkflows', listWorkflows)
  await time('latestRunPerWorkflow', latestRunPerWorkflow)
  await time('listRuns', listRuns)
  const [{ id }] = (await db.execute(sql`select id from runs order by started_at desc limit 1`)) as unknown as {
    id: string
  }[]
  await time('getRun', () => getRun(id))
  const [{ count }] = (await db.execute(sql`select count(*)::int as count from runs`)) as unknown as {
    count: number
  }[]
  console.log(`runs in table: ${count}`)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
