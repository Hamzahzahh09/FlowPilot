import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

type Db = PostgresJsDatabase<typeof schema>

// One pool per process. Next.js dev reloads modules, so the pool is kept on
// globalThis to avoid opening a new set of connections on every edit.
const globalForDb = globalThis as unknown as { flowpilotDb?: Db }

function create(url: string): Db {
  // prepare: false is required by Neon's pooled (PgBouncer) endpoint.
  return drizzle(postgres(url, { prepare: false, max: 5, onnotice: () => {} }), { schema })
}

/** Null when DATABASE_URL is not set; the API then answers 503. */
export const db: Db | null = connectionString
  ? (globalForDb.flowpilotDb ??= create(connectionString))
  : null
