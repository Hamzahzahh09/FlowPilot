import { and, desc, eq, isNull } from 'drizzle-orm'
import { workflowGraphSchema } from 'shared'
import { runs, type RunRow } from '@/db/schema'
import { triggerOf } from '@/lib/data/demo'
import { elapsedMs, runStatusAt } from '@/lib/data/runStatus'
import type {
  LastRun,
  Run,
  RunDecision,
  RunEvent,
  RunStatus,
  RunSummary,
  TriggerType,
  WorkflowGraph,
} from '@/lib/data/types'
import { simulateRun } from '@/lib/run/timeline'
import { ApiError, notFound, requireDb } from './http'
import { requireWorkflow } from './workflows'

// Server only. Runs still follow the deterministic mock timeline
// (lib/run/timeline.ts); the server computes and stores it so every browser
// sees the same run. The real runner will append events instead.

const LIST_LIMIT = 100

type TimedRow = Pick<RunRow, 'id' | 'status' | 'startedAt' | 'events'>

function statusOf(row: TimedRow): RunStatus {
  return runStatusAt({ startedAt: row.startedAt.toISOString(), events: row.events as RunEvent[] })
}

/**
 * The stored status lags the timeline, so it is refreshed on read. Writes
 * only rows whose status changed.
 */
async function syncStatus(rows: TimedRow[]): Promise<Map<string, RunStatus>> {
  const db = requireDb()
  const current = new Map(rows.map((row) => [row.id, statusOf(row)]))
  const stale = rows.filter((row) => current.get(row.id) !== row.status)
  await Promise.all(
    stale.map((row) =>
      db
        .update(runs)
        .set({ status: current.get(row.id), updatedAt: new Date() })
        .where(eq(runs.id, row.id)),
    ),
  )
  return current
}

function toRun(row: RunRow): Run {
  return {
    id: row.id,
    workflowId: row.workflowId,
    workflowName: row.workflowName,
    trigger: row.trigger as TriggerType,
    startedAt: row.startedAt.toISOString(),
    graph: row.graph as WorkflowGraph,
    events: row.events as RunEvent[],
  }
}

export async function listRuns(): Promise<RunSummary[]> {
  const db = requireDb()
  const rows = await db
    .select({
      id: runs.id,
      workflowId: runs.workflowId,
      workflowName: runs.workflowName,
      status: runs.status,
      startedAt: runs.startedAt,
      events: runs.events,
    })
    .from(runs)
    .orderBy(desc(runs.startedAt))
    .limit(LIST_LIMIT)
  const status = await syncStatus(rows)
  return rows.map((row) => ({
    id: row.id,
    workflowId: row.workflowId,
    workflowName: row.workflowName,
    status: status.get(row.id) ?? row.status,
    startedAt: row.startedAt.toISOString(),
  }))
}

/** Newest run of each workflow, for the workflow cards. */
export async function latestRunPerWorkflow(): Promise<Map<string, LastRun>> {
  const db = requireDb()
  const rows = await db
    .selectDistinctOn([runs.workflowId], {
      id: runs.id,
      workflowId: runs.workflowId,
      status: runs.status,
      startedAt: runs.startedAt,
      events: runs.events,
    })
    .from(runs)
    .orderBy(runs.workflowId, desc(runs.startedAt))
  const status = await syncStatus(rows)
  return new Map(
    rows.map((row) => [
      row.workflowId,
      { id: row.id, status: status.get(row.id) ?? row.status, startedAt: row.startedAt.toISOString() },
    ]),
  )
}

export async function getRun(id: string): Promise<Run | null> {
  const db = requireDb()
  const [row] = await db.select().from(runs).where(eq(runs.id, id)).limit(1)
  if (!row) return null
  await syncStatus([row])
  return toRun(row)
}

export async function startRun(workflowId: string): Promise<Run> {
  const db = requireDb()
  const workflow = await requireWorkflow(workflowId)
  // The run snapshots the graph, so it has to be a valid one.
  const checked = workflowGraphSchema.safeParse(workflow.graph)
  if (!checked.success) {
    throw new ApiError(
      400,
      'Fix the workflow in the editor before running it.',
      checked.error.issues.map((issue) => issue.message),
    )
  }
  const graph = workflow.graph
  const [row] = await db
    .insert(runs)
    .values({
      workflowId,
      workflowName: workflow.name,
      trigger: triggerOf(graph) ?? 'manual_simulate',
      status: 'queued',
      graph,
      events: simulateRun(graph),
      startedAt: new Date(),
    })
    .returning()
  return toRun(row)
}

export async function decideRun(id: string, decision: RunDecision): Promise<Run> {
  const db = requireDb()
  const [row] = await db.select().from(runs).where(eq(runs.id, id)).limit(1)
  if (!row) throw notFound('Run')
  const run = toRun(row)
  if (runStatusAt(run) !== 'awaiting_approval') {
    throw new ApiError(409, 'This run is not waiting for approval.')
  }
  // Same rebuild as the mock: past events stay identical, the decision and
  // what follows the lever are added at the current offset.
  const events = simulateRun(run.graph, { decision, at: elapsedMs(run) })
  const now = new Date()
  // `decision is null` makes a second, concurrent decision a no-op.
  const [decided] = await db
    .update(runs)
    .set({ events, decision, decidedAt: now, status: 'running', updatedAt: now })
    .where(and(eq(runs.id, id), isNull(runs.decision)))
    .returning()
  if (!decided) throw new ApiError(409, 'This run was already decided.')
  return toRun(decided)
}
