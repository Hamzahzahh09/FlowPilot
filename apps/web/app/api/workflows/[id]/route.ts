import { NextResponse } from 'next/server'
import { db } from '@/db/client'
import { workflows } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { workflowDataSchema } from 'shared'

interface RouteProps {
  params: {
    id: string
  }
}

export async function GET(_: Request, { params }: RouteProps) {
  if (!db) {
    return NextResponse.json({ id: params.id, status: 'ok' })
  }

  try {
    const rows = await db.select().from(workflows).where(eq(workflows.id, params.id)).limit(1)
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }
    return NextResponse.json({ workflow: rows[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Database error', details: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const body = await request.json()
    const parseResult = workflowDataSchema.safeParse(body.data)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid workflow data structure', details: parseResult.error },
        { status: 400 }
      )
    }

    if (db) {
      try {
        await db
          .insert(workflows)
          .values({
            id: params.id,
            name: body.name || `Workflow ${params.id}`,
            description: body.description || '',
            data: body.data,
          })
          .onConflictDoUpdate({
            target: workflows.id,
            set: {
              name: body.name || `Workflow ${params.id}`,
              data: body.data,
              updatedAt: new Date(),
            },
          })
      } catch (err) {
        console.warn('DB upsert error (continuing with local confirmation):', err)
      }
    }

    return NextResponse.json({ success: true, id: params.id })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save workflow', details: String(err) }, { status: 500 })
  }
}

