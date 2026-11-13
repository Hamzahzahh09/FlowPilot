// Dev check: terminates this role's other Postgres sessions on Neon, the way
// a compute suspend or pooler timeout does. The app must recover on the next
// request. Only touches sessions of the same user, never this one.
//   node --env-file=.env.local scripts/drop-connections.mjs
import postgres from 'postgres'

const url = process.env.DATABASE_URL_UNPOOLED
if (!url) throw new Error('DATABASE_URL_UNPOOLED is required')
const sql = postgres(url, { max: 1, onnotice: () => {} })
try {
  const rows = await sql`
    select pg_terminate_backend(pid) as ok
    from pg_stat_activity
    where usename = current_user and pid <> pg_backend_pid() and backend_type = 'client backend'`
  console.log(`terminated ${rows.filter((r) => r.ok).length} sessions`)
} finally {
  await sql.end()
}
