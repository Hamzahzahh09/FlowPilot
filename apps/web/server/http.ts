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
