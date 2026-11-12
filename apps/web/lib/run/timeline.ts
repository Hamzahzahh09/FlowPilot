import type {
  CheckResult,
  Finding,
  GraphNode,
  LogLevel,
  NodeStatusEvent,
  RunDecision,
  RunEvent,
  RunStatus,
  WorkflowGraph,
} from '@/lib/data/types'
import { DEMO_ACCOUNT } from '@/lib/auth/demo'

// Mock run timeline. Deterministic: the same graph (and decision) always
// gives the same events, so a decision can rebuild the full list without
// changing anything that already happened. A real SSE stream will deliver
// the same RunEvent objects.

const START = 300
const GAP = 250

/** Seed data for the sample repo: one lint error and one failing test. */
export const DEMO_FINDINGS: readonly Finding[] = [
  {
    file: 'src/cart.ts',
    line: 42,
    severity: 'warning',
    message: 'items can be undefined when the cart is empty. Add a guard before items.map.',
  },
  {
    file: 'src/cart.ts',
    line: 12,
    severity: 'suggestion',
    message: 'discount is computed but never applied to the total.',
  },
]

const LINT_DETAIL = "src/cart.ts:12:7  'discount' is assigned a value but never used  no-unused-vars"
const TEST_DETAIL = 'cart.test.ts > applies a 10% discount: expected 90, received 100'

type Outcome = { end: number; branch?: 'passed' | 'failed' }

/** Kahn's algorithm. Nodes in a cycle are left out (saved graphs have none). */
function topoOrder(graph: WorkflowGraph): GraphNode[] {
  const indegree = new Map(graph.nodes.map((n) => [n.id, 0]))
  for (const e of graph.edges) indegree.set(e.target, (indegree.get(e.target) ?? 0) + 1)
  const byId = new Map(graph.nodes.map((n) => [n.id, n]))
  const queue = graph.nodes.filter((n) => indegree.get(n.id) === 0)
  const order: GraphNode[] = []
  while (queue.length > 0) {
    const node = queue.shift() as GraphNode
    order.push(node)
    for (const e of graph.edges) {
      if (e.source !== node.id) continue
      const left = (indegree.get(e.target) ?? 0) - 1
      indegree.set(e.target, left)
      const target = byId.get(e.target)
      if (left === 0 && target) queue.push(target)
    }
  }
  return order
}

function commandOf(node: GraphNode, fallback: string): string {
  const command = (node.config as { command?: unknown }).command
  return typeof command === 'string' ? command : fallback
}

export function simulateRun(
  graph: WorkflowGraph,
  decision?: { decision: RunDecision; at: number },
): RunEvent[] {
  const events: RunEvent[] = []
  const run = (at: number, status: RunStatus) => events.push({ at, kind: 'run', status })
  const node = (at: number, nodeId: string, status: NodeStatusEvent['status']) =>
    events.push({ at, kind: 'node', nodeId, status })
  const log = (at: number, level: LogLevel, text: string, nodeId?: string) =>
    events.push({ at, kind: 'log', level, text, nodeId })
  const check = (at: number, nodeId: string, result: CheckResult) =>
    events.push({ at, kind: 'check', nodeId, result })

  run(0, 'queued')
  run(START - 100, 'running')
  log(START - 100, 'info', 'Run started on the hosted sandbox runner')

  const failedChecksAt: number[] = []

  const step = (n: GraphNode, s: number): Outcome | null => {
    switch (n.type) {
      case 'Spark': {
        const manual = (n.config as { triggerType?: string }).triggerType !== 'github_push'
        node(s, n.id, 'running')
        log(s + 100, 'info', `${manual ? 'Simulated push' : 'Push'} on main: commit f8a12c3, 3 files changed`, n.id)
        node(s + 400, n.id, 'ok')
        return { end: s + 400 }
      }
      case 'Brain':
      case 'Eyes': {
        node(s, n.id, 'running')
        log(s + 300, 'ai', 'read_diff: 3 files, +42 -7', n.id)
        log(s + 900, 'ai', 'read_file src/cart.ts', n.id)
        log(s + 1500, 'ai', 'read_file src/cart.test.ts', n.id)
        for (const finding of DEMO_FINDINGS) {
          events.push({ at: s + 2100, kind: 'finding', nodeId: n.id, finding })
          log(s + 2100, 'ai', `${finding.file}:${finding.line} ${finding.message}`, n.id)
        }
        log(s + 2400, 'ai', `Review done: ${DEMO_FINDINGS.length} suggestions, nothing was changed`, n.id)
        node(s + 2400, n.id, 'ok')
        return { end: s + 2400 }
      }
      case 'Scalpel': {
        const command = commandOf(n, 'npm run lint')
        node(s, n.id, 'running')
        log(s + 100, 'info', `$ ${command}`, n.id)
        log(s + 1500, 'fail', LINT_DETAIL, n.id)
        log(s + 1500, 'fail', 'Lint failed: 1 error, 0 warnings', n.id)
        check(s + 1500, n.id, {
          check: 'lint',
          command,
          passed: false,
          summary: '1 error, 0 warnings',
          details: [LINT_DETAIL],
        })
        node(s + 1500, n.id, 'fail')
        failedChecksAt.push(s + 1500)
        return { end: s + 1500 }
      }
      case 'Heart': {
        const command = commandOf(n, 'npm test')
        node(s, n.id, 'running')
        log(s + 100, 'info', `$ ${command}`, n.id)
        log(s + 2000, 'fail', TEST_DETAIL, n.id)
        log(s + 2000, 'fail', 'Tests failed: 11 passed, 1 failed', n.id)
        check(s + 2000, n.id, {
          check: 'test',
          command,
          passed: false,
          summary: '11 passed, 1 failed',
          details: [TEST_DETAIL],
        })
        node(s + 2000, n.id, 'fail')
        failedChecksAt.push(s + 2000)
        return { end: s + 2000 }
      }
      case 'Fork': {
        const branch = failedChecksAt.some((t) => t <= s) ? 'failed' : 'passed'
        node(s, n.id, 'running')
        log(
          s + 300,
          'info',
          branch === 'failed'
            ? 'Fork: a check failed, taking the Failed branch'
            : 'Fork: all checks passed, taking the Passed branch',
          n.id,
        )
        node(s + 300, n.id, 'ok')
        return { end: s + 300, branch }
      }
      case 'Lightning Lever': {
        node(s, n.id, 'wait')
        run(s, 'awaiting_approval')
        log(s, 'wait', 'Lightning Lever: waiting for your approval', n.id)
        if (!decision) return null
        // One decision answers every lever in the run (the demo has one).
        const at = Math.max(decision.at, s + 1)
        const approved = decision.decision === 'approved'
        events.push({ at, kind: 'decision', decision: decision.decision })
        node(at, n.id, approved ? 'ok' : 'fail')
        log(at, approved ? 'pass' : 'fail', `${approved ? 'Approved' : 'Rejected'} by ${DEMO_ACCOUNT.email}`, n.id)
        run(at, 'running')
        return { end: at }
      }
      case 'Autopsy Report': {
        node(s, n.id, 'running')
        log(s + 800, 'pass', 'Autopsy report written', n.id)
        node(s + 800, n.id, 'ok')
        return { end: s + 800 }
      }
    }
  }

  const byId = new Map(graph.nodes.map((n) => [n.id, n]))
  const done = new Map<string, Outcome>()
  const blocked = new Set<string>()
  let lastEnd = START

  for (const n of topoOrder(graph)) {
    const incoming = graph.edges.filter((e) => e.target === n.id)
    if (incoming.some((e) => blocked.has(e.source))) {
      blocked.add(n.id)
      continue
    }
    let start: number
    if (incoming.length === 0) {
      if (n.type !== 'Spark') continue // unconnected nodes never run
      start = START
    } else {
      // Wait for every reached predecessor; a Fork only feeds its taken branch.
      const ends = incoming.flatMap((e) => {
        const outcome = done.get(e.source)
        if (!outcome) return []
        if (byId.get(e.source)?.type === 'Fork' && (e.sourceHandle ?? 'passed') !== outcome.branch) return []
        return [outcome.end]
      })
      if (ends.length === 0) continue
      start = Math.max(...ends) + GAP
    }
    const outcome = step(n, start)
    if (outcome === null) blocked.add(n.id)
    else {
      done.set(n.id, outcome)
      lastEnd = Math.max(lastEnd, outcome.end)
    }
  }

  if (blocked.size === 0) {
    const at = lastEnd + GAP
    const succeeded = decision ? decision.decision === 'approved' : failedChecksAt.length === 0
    run(at, succeeded ? 'succeeded' : 'failed')
    log(at, succeeded ? 'pass' : 'fail', succeeded ? 'Run succeeded' : 'Run failed')
  }

  // Stable sort keeps insertion order for events at the same time.
  return events.sort((a, b) => a.at - b.at)
}
