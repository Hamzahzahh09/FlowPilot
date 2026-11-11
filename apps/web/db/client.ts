import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

// If DATABASE_URL is not set, db client is null and app operates in offline/demo mode
export const db = connectionString
  ? drizzle(postgres(connectionString, { prepare: false }), { schema })
  : null
