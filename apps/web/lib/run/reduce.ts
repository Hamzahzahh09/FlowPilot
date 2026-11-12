import type {
  CheckResult,
  Finding,
  LogLevel,
  Run,
  RunDecision,
  RunStatus,
} from '@/lib/data/types'
import type { NodeStatus } from '@/lib/workflow/types'

export type EdgeState = 'idle' | 'active' | 'done'

export type LogEntry = { at: number; level: LogLevel; text: string; nodeId?: string }

export type RunView = {
  status: RunStatus
  nodeStatus: Record<string, NodeStatus>
  edgeState: Record<string, EdgeState>
  log: LogEntry[]
  findings: Finding[]
  checks: (CheckResult & { nodeId: string })[]
  decision: RunDecision | null
  /** Node currently waiting at a Lightning Lever, if any. */
  waitingNodeId: string | null
  /** Offset (ms) of the next event still in the future, or null. */
  nextAt: number | null
  /** Offset (ms) of the final run status, once the run has finished. */
  endedAt: number | null
}

const FINAL: ReadonlySet<RunStatus> = new Set(['succeeded', 'failed', 'cancelled', 'timed_out'])
const isDone = (s: NodeStatus | undefined) => s === 'ok' || s === 'fail'

/** Pure: the state of a run after `elapsed` ms. The single source of run state for the UI. */
export function reduceRun(run: Run, elapsed: number): RunView {
  const nodeStatus: Record<string, NodeStatus> = {}
  for (const n of run.graph.nodes) nodeStatus[n.id] = 'idle'

  const view: RunView = {
    status: 'queued',
    nodeStatus,
    edgeState: {},
    log: [],
    findings: [],
    checks: [],
    decision: null,
    waitingNodeId: null,
    nextAt: null,
    endedAt: null,
  }

  for (const event of run.events) {
    if (event.at > elapsed) {
      if (view.nextAt === null || event.at < view.nextAt) view.nextAt = event.at
      continue
    }
    switch (event.kind) {
      case 'run':
        view.status = event.status
        if (FINAL.has(event.status)) view.endedAt = event.at
        break
      case 'node':
        nodeStatus[event.nodeId] = event.status
        break
      case 'log':
        view.log.push({ at: event.at, level: event.level, text: event.text, nodeId: event.nodeId })
        break
      case 'finding':
        view.findings.push(event.finding)
        break
      case 'check':
        view.checks.push({ ...event.result, nodeId: event.nodeId })
        break
      case 'decision':
        view.decision = event.decision
        break
    }
  }

  view.waitingNodeId = Object.keys(nodeStatus).find((id) => nodeStatus[id] === 'wait') ?? null

  // Active: the step that edge feeds is running or waiting. Done: both ends finished.
  for (const edge of run.graph.edges) {
    const source = nodeStatus[edge.source]
    const target = nodeStatus[edge.target]
    view.edgeState[edge.id] = !isDone(source)
      ? 'idle'
      : target === 'running' || target === 'wait'
        ? 'active'
        : isDone(target)
          ? 'done'
          : 'idle'
  }

  return view
}

export const LOG_TAG: Record<LogLevel, string> = {
  info: 'Info',
  ai: 'AI',
  pass: 'Pass',
  fail: 'Fail',
  wait: 'Wait',
}

/** "00:04.2" from a millisecond offset. */
export function formatOffset(ms: number): string {
  const total = ms / 1000
  const minutes = Math.floor(total / 60)
  const seconds = (total % 60).toFixed(1).padStart(4, '0')
  return `${String(minutes).padStart(2, '0')}:${seconds}`
}
