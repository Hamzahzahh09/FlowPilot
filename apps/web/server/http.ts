import { NextResponse } from 'next/server'
import type { z } from 'zod'
import { db } from '@/db/client'

// Server only. Shared helpers for app/api route handlers.

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: string[],
  ) {
    super(message)
  }
}

export const notFound = (what: string) => new ApiError(404, `${what} not found`)

export function requireDb() {
  if (!db) throw new ApiError(503, 'The database is not configured. Set DATABASE_URL.')
  return db
}

/** Parses a JSON body with a shared Zod schema. Invalid input is a 400. */
export async function parseBody<S extends z.ZodTypeAny>(request: Request, schema: S): Promise<z.output<S>> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    throw new ApiError(400, 'The request body must be JSON.')
  }
  const result = schema.safeParse(body)
  if (!result.success) {
    const details = result.error.issues.map((issue) =>
      issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message,
    )
    throw new ApiError(400, 'The request is not valid.', details)
  }
  return result.data
}

// Socket-level failures: Node codes plus postgres-js connection codes.
const CONNECTION_CODES = new Set([
  'ECONNRESET',
  'EPIPE',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'CONNECTION_CLOSED',
  'CONNECTION_ENDED',
  'CONNECTION_DESTROYED',
  'CONNECT_TIMEOUT',
])

export function isConnectionError(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code
  return typeof code === 'string' && CONNECTION_CODES.has(code)
}

/**
 * Runs an idempotent database call, retrying once on a dropped connection
 * (the pool then opens a fresh one). Only for reads and updates that give
 * the same result when repeated; never for inserts.
 */
export async function retryOnDrop<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (!isConnectionError(error)) throw error
    console.warn('Database connection dropped, retrying once')
    return fn()
  }
}

/** Runs a handler and turns thrown errors into JSON responses. */
export async function handle(fn: () => Promise<unknown>): Promise<NextResponse> {
  try {
    const body = await fn()
    return NextResponse.json(body)
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message, ...(error.details ? { details: error.details } : {}) },
        { status: error.status },
      )
    }
    if (isConnectionError(error)) {
      console.warn('API database connection error:', (error as { code: string }).code)
      return NextResponse.json(
        { error: 'The database connection dropped or is still waking up. Try again.' },
        { status: 503 },
      )
    }
    // Log the cause on the server only; the client gets a generic message.
    console.error('API error:', error)
    return NextResponse.json({ error: 'Something went wrong on the server.' }, { status: 500 })
  }
}

export const iso = (date: Date | null): string | null => (date ? date.toISOString() : null)

/** Ids in the URL must be UUIDs; anything else cannot exist. */
export function idParam(value: string, what: string): string {
  if (!UUID.test(value)) throw notFound(what)
  return value
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
