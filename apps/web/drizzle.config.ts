import type { Config } from 'drizzle-kit'
import { existsSync } from 'node:fs'

// drizzle-kit does not read .env.local on its own (Node >= 20.12)
if (existsSync('.env.local')) process.loadEnvFile('.env.local')

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    // Migrations use the direct (non-pooled) connection
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || '',
  },
} as Config
