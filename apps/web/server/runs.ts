import { and, desc, eq, isNull, sql } from 'drizzle-orm'
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

type StatusRow = { id: string; status: RunStatus; liveStatus: RunStatus }

/**
 * Current status from the stored timeline, computed in Postgres so lists do
 * not download the events (the largest column). The last `run` event whose
 * offset has passed wins; events are stored sorted by offset. Handles both
 * jsonb shapes: drizzle 0.30 with postgres-js stores the array as a JSON
 * string scalar.
 *
 * Uses the app's clock, not Postgres now(): startedAt is written by the app
 * and runStatusAt (getRun, decideRun) also uses the app clock, so all three
 * agree even when the machine clock drifts from the database's.
 */
const liveStatus = (nowMs: number = Date.now()) => sql<RunStatus>`coalesce((
  select e.v->>'status'
  from jsonb_array_elements(
    case jsonb_typeof(${runs.events}) when 'string' then (${runs.events} #>> '{}')::jsonb else ${runs.events} end
  ) with ordinality as e(v, i)
  where e.v->>'kind' = 'run'
    and (e.v->>'at')::double precision <= ${String(nowMs)}::double precision - extract(epoch from ${runs.startedAt}) * 1000
  order by e.i desc
  limit 1
), 'queued')`

/** Writes the live status back for rows where the stored one lags. */
async function syncStatus(rows: StatusRow[]): Promise<void> {
  const db = requireDb()
  const stale = rows.filter((row) => row.liveStatus !== row.status)
  await Promise.all(
    stale.map((row) =>
      db.update(runs).set({ status: row.liveStatus, updatedAt: new Date() }).where(eq(runs.id, row.id)),
    ),
  )
}

function statusOf(row: Pick<RunRow, 'startedAt' | 'events'>): RunStatus {
  return runStatusAt({ startedAt: row.startedAt.toISOString(), events: row.events as RunEvent[] })
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
      liveStatus: liveStatus(),
      startedAt: runs.startedAt,
    })
    .from(runs)
    .orderBy(desc(runs.startedAt))
    .limit(LIST_LIMIT)
  await syncStatus(rows)
  return rows.map((row) => ({
    id: row.id,
    workflowId: row.workflowId,
    workflowName: row.workflowName,
    status: row.liveStatus,
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
      liveStatus: liveStatus(),
      startedAt: runs.startedAt,
    })
    .from(runs)
    .orderBy(runs.workflowId, desc(runs.startedAt))
  await syncStatus(rows)
  return new Map(
    rows.map((row) => [
      row.workflowId,
      { id: row.id, status: row.liveStatus, startedAt: row.startedAt.toISOString() },
    ]),
  )
}

export async function getRun(id: string): Promise<Run | null> {
  const db = requireDb()
  const [row] = await db.select().from(runs).where(eq(runs.id, id)).limit(1)
  if (!row) return null
  await syncStatus([{ id: row.id, status: row.status, liveStatus: statusOf(row) }])
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
