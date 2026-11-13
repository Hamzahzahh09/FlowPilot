import { randomUUID } from 'node:crypto'
import { desc, eq, sql } from 'drizzle-orm'
import { workflows, type WorkflowRow } from '@/db/schema'
import { newWorkflowGraph, triggerOf } from '@/lib/data/demo'
import type { Workflow, WorkflowGraph, WorkflowSummary } from '@/lib/data/types'
import { notFound, requireDb } from './http'
import { latestRunPerWorkflow } from './runs'

// Server only.

export function toWorkflow(row: WorkflowRow): Workflow {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    // Written only through workflowGraphSchema (or the seed), so the shape holds.
    graph: row.data as WorkflowGraph,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listWorkflows(): Promise<WorkflowSummary[]> {
  const db = requireDb()
  // Independent queries: run them together instead of one after another.
  const [rows, last] = await Promise.all([
    db.select().from(workflows).orderBy(desc(workflows.updatedAt)),
    latestRunPerWorkflow(),
  ])
  return rows.map((row) => {
    const graph = row.data as WorkflowGraph
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      trigger: triggerOf(graph),
      nodeCount: graph.nodes.length,
      updatedAt: row.updatedAt.toISOString(),
      lastRun: last.get(row.id) ?? null,
    }
  })
}

export async function getWorkflow(id: string): Promise<Workflow | null> {
  const db = requireDb()
  const [row] = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1)
  return row ? toWorkflow(row) : null
}

export async function createWorkflow(input: { name?: string }): Promise<Workflow> {
  const db = requireDb()
  const [row] = await db
    .insert(workflows)
    .values({
      name: input.name || 'Untitled workflow',
      description: '',
      data: newWorkflowGraph(randomUUID),
    })
    .returning()
  return toWorkflow(row)
}

export async function saveWorkflow(
  id: string,
  input: { name?: string; graph: WorkflowGraph },
): Promise<Workflow> {
  const db = requireDb()
  const [row] = await db
    .update(workflows)
    .set({
      ...(input.name ? { name: input.name } : {}),
      data: input.graph,
      updatedAt: sql`now()`,
    })
    .where(eq(workflows.id, id))
    .returning()
  if (!row) throw notFound('Workflow')
  return toWorkflow(row)
}

/** The workflow, or a 404 ApiError. */
export async function requireWorkflow(id: string): Promise<Workflow> {
  const workflow = await getWorkflow(id)
  if (!workflow) throw notFound('Workflow')
  return workflow
}
