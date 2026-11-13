import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

type Db = PostgresJsDatabase<typeof schema>

// One pool per process. Next.js dev reloads modules, so the pool is kept on
// globalThis to avoid opening a new set of connections on every edit.
const globalForDb = globalThis as unknown as { flowpilotDb?: Db }

function create(url: string): Db {
  const client = postgres(url, {
    // Neon's pooler (PgBouncer 1.22+) supports protocol-level prepared
    // statements, so prepared queries are safe on the pooled endpoint.
    prepare: true,
    max: 5,
    // Neon drops idle connections (compute suspend, pooler timeouts). Close
    // them on our side first, so a request never gets a dead socket
    // (ECONNRESET on the first query after a quiet period).
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    // A suspended compute takes a few seconds to wake up.
    connect_timeout: 15,
    onnotice: () => {},
  })

  // drizzle-orm 0.30 runs every query through client.unsafe(), which ignores
  // the `prepare` option above. Unprepared queries with parameters cost two
  // round trips (describe, then execute); prepared ones cost one after the
  // first use per connection. Measured from here: ~540 ms -> ~270 ms.
  const unsafe = client.unsafe
  client.unsafe = ((query: string, args?: unknown[], options?: { prepare?: boolean }) =>
    unsafe(query, args as never, { prepare: true, ...options })) as typeof client.unsafe

  return drizzle(client, { schema })
}

/** Null when DATABASE_URL is not set; the API then answers 503. */
export const db: Db | null = connectionString
  ? (globalForDb.flowpilotDb ??= create(connectionString))
  : null
