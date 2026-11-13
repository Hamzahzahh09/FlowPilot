// Compares this machine's clock with Postgres now() and checks that a
// timestamptz round-trips unchanged through drizzle.
//   npx tsx --env-file=.env.local scripts/check-clock.ts
import { desc, sql } from 'drizzle-orm'
import { db } from '../db/client'
import { runs } from '../db/schema'

async function main() {
  if (!db) throw new Error('DATABASE_URL is required')
  await db.execute(sql`select 1`) // warm up: connect and wake the compute
  for (let i = 0; i < 3; i++) {
    const before = Date.now()
    const [r] = (await db.execute(sql`select now() as now`)) as unknown as { now: string }[]
    const after = Date.now()
    const offset = Math.round((before + after) / 2 - Date.parse(r.now))
    console.log(`local - db ${offset} ms (round trip ${after - before} ms)`)
  }
  const before = Date.now()
  const [row] = (await db.execute(sql`select now() as now`)) as unknown as { now: string }[]
  const after = Date.now()
  const local = (before + after) / 2
  const server = Date.parse(row.now)
  console.log(`db now()      ${row.now}`)
  console.log(`local         ${new Date(local).toISOString()}`)
  console.log(`local - db    ${Math.round(local - server)} ms (round trip ${after - before} ms)`)
  const [last] = await db
    .select({ startedAt: runs.startedAt, raw: sql<string>`${runs.startedAt}::text` })
    .from(runs)
    .orderBy(desc(runs.startedAt))
    .limit(1)
  console.log(`latest run    drizzle ${last.startedAt.toISOString()}  raw ${last.raw}`)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
