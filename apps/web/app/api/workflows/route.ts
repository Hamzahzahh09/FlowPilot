import { NextResponse } from 'next/server'
import { db } from '@/db/client'
import { workflows } from '@/db/schema'
import { workflowDataSchema } from 'shared'

export async function GET() {
  if (!db) {
    return NextResponse.json({
      workflows: [
        {
          id: 'demo',
          name: 'Automated Code Review (Sample)',
          description: 'AI code review with lint, tests, and human approval.',
          updatedAt: new Date().toISOString(),
        },
      ],
    })
  }

  try {
    const rows = await db.select().from(workflows)
    return NextResponse.json({ workflows: rows })
  } catch (error) {
    console.warn('DB query failed, returning fallback list:', error)
    return NextResponse.json({
      workflows: [
        {
          id: 'demo',
          name: 'Automated Code Review (Sample)',
          description: 'AI code review with lint, tests, and human approval.',
          updatedAt: new Date().toISOString(),
        },
      ],
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parseResult = workflowDataSchema.safeParse(body.data)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid workflow data structure', details: parseResult.error },
        { status: 400 }
      )
    }

    const workflowId = body.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'demo')

    if (db) {
      try {
        await db
          .insert(workflows)
          .values({
            id: workflowId,
            name: body.name || `Workflow ${workflowId}`,
            description: body.description || '',
            data: body.data,
          })
          .onConflictDoUpdate({
            target: workflows.id,
            set: {
              name: body.name || `Workflow ${workflowId}`,
              data: body.data,
              updatedAt: new Date(),
            },
          })
      } catch (err) {
        console.warn('DB save warning:', err)
      }
    }

    return NextResponse.json({ success: true, id: workflowId })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process workflow', details: String(err) }, { status: 500 })
  }
}

