import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

// Migrations use the direct (non-pooled) Neon connection.
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL_UNPOOLED or DATABASE_URL is required')

const client = postgres(url, { max: 1 })

migrate(drizzle(client), { migrationsFolder: './drizzle' })
  .then(() => console.log('Migrations applied'))
  .catch((err: unknown) => {
    console.error('Migration failed:', err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(() => client.end())
