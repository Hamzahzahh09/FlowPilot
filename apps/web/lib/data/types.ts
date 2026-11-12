import type { Edge as SharedEdge, Node as SharedNode } from 'shared'
import type { NodeStatus } from '@/lib/workflow/types'

// Graph types mirror packages/shared WorkflowData, so a saved graph can be
// sent to /api/workflows unchanged once the real backend is wired in.
export type GraphNode = SharedNode & {
  /** Optional custom title; falls back to the node type's default title. */
  title?: string
}
export type GraphEdge = SharedEdge
export type WorkflowGraph = { nodes: GraphNode[]; edges: GraphEdge[] }

export type TriggerType = 'github_push' | 'manual_simulate'

/** Mirrors the `workflows` table in db/schema.ts (data -> graph). */
export type Workflow = {
  id: string
  name: string
  description: string
  graph: WorkflowGraph
  createdAt: string
  updatedAt: string
}

/** Run statuses from .kiro/steering/tech.md. */
export const RUN_STATUSES = [
  'queued',
  'running',
  'awaiting_approval',
  'succeeded',
  'failed',
  'cancelled',
  'timed_out',
] as const
export type RunStatus = (typeof RUN_STATUSES)[number]

export type RunDecision = 'approved' | 'rejected'

export type LogLevel = 'info' | 'ai' | 'pass' | 'fail' | 'wait'

export type Finding = {
  file: string
  line: number
  message: string
  severity: 'suggestion' | 'warning'
}

export type CheckResult = {
  check: 'lint' | 'test'
  command: string
  passed: boolean
  summary: string
  details: string[]
}

export type NodeStatusEvent = { at: number; kind: 'node'; nodeId: string; status: NodeStatus }

/**
 * Ordered run events. `at` is the offset in ms from run start.
 * The mock timeline and a future SSE stream produce the same shape.
 */
export type RunEvent =
  | { at: number; kind: 'run'; status: RunStatus }
  | NodeStatusEvent
  | { at: number; kind: 'log'; level: LogLevel; nodeId?: string; text: string }
  | { at: number; kind: 'finding'; nodeId: string; finding: Finding }
  | { at: number; kind: 'check'; nodeId: string; result: CheckResult }
  | { at: number; kind: 'decision'; decision: RunDecision }

export type Run = {
  id: string
  workflowId: string
  workflowName: string
  trigger: TriggerType
  startedAt: string
  /** Snapshot of the graph at start, so later edits do not change past runs. */
  graph: WorkflowGraph
  events: RunEvent[]
}

export type LastRun = { id: string; status: RunStatus; startedAt: string }

export type WorkflowSummary = {
  id: string
  name: string
  description: string
  trigger: TriggerType | null
  nodeCount: number
  updatedAt: string
  lastRun: LastRun | null
}

export type RunSummary = {
  id: string
  workflowId: string
  workflowName: string
  status: RunStatus
  startedAt: string
}

export type RunnerStatus = 'online' | 'offline'

export type Runner = {
  id: string
  name: string
  status: RunnerStatus
  lastSeenAt: string | null
  createdAt: string
  /** Prefix and last 4 characters only. The full token is never stored. */
  tokenPreview: string
}

export type GithubSettings = {
  repository: string | null
  connectedAt: string | null
  /** Path appended to the site origin by the UI. */
  webhookPath: string
  webhookSecret: string
  triggers: { push: boolean; pullRequest: boolean }
}
