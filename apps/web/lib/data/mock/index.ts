import { newId, randomHex, sha256Hex } from '../ids'
import { elapsedMs, runStatusAt } from '../runStatus'
import type { DataSource } from '../source'
import type {
  GithubSettings,
  Run,
  RunEvent,
  RunSummary,
  Runner,
  Workflow,
  WorkflowGraph,
  WorkflowSummary,
  TriggerType,
} from '../types'
import { readState, subscribe, writeState } from './store'
import type { MockState, RunnerRecord } from './seed'

// Small latency so loading states are exercised like a real backend.
const LATENCY_MS = 120
const wait = () => new Promise<void>((resolve) => setTimeout(resolve, LATENCY_MS))

function update(fn: (draft: MockState) => MockState): MockState {
  const next = fn(readState())
  writeState(next)
  return next
}

function triggerOf(graph: WorkflowGraph): TriggerType | null {
  const spark = graph.nodes.find((node) => node.type === 'Spark')
  if (!spark) return null
  const config = spark.config as { triggerType?: TriggerType }
  return config.triggerType ?? 'manual_simulate'
}

function summarize(workflow: Workflow, runs: Run[]): WorkflowSummary {
  const last = runs
    .filter((run) => run.workflowId === workflow.id)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]
  return {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    trigger: triggerOf(workflow.graph),
    nodeCount: workflow.graph.nodes.length,
    updatedAt: workflow.updatedAt,
    lastRun: last ? { id: last.id, status: runStatusAt(last), startedAt: last.startedAt } : null,
  }
}

function publicRunner(record: RunnerRecord): Runner {
  // Never hand the token hash to the UI.
  return {
    id: record.id,
    name: record.name,
    status: record.status,
    lastSeenAt: record.lastSeenAt,
    createdAt: record.createdAt,
    tokenPreview: record.tokenPreview,
  }
}

/**
 * Builds the timed events for a new run. Replaced by the real mock timeline
 * in app-pages task 5 (lib/run/timeline.ts).
 */
export type TimelineBuilder = (graph: WorkflowGraph) => RunEvent[]
export type DecisionBuilder = (run: Run, decision: 'approved' | 'rejected', at: number) => RunEvent[]

let buildTimeline: TimelineBuilder = () => [{ at: 0, kind: 'run', status: 'queued' }]
let buildDecision: DecisionBuilder = (_run, decision, at) => [{ at, kind: 'decision', decision }]

export function configureRunEngine(timeline: TimelineBuilder, decision: DecisionBuilder): void {
  buildTimeline = timeline
  buildDecision = decision
}

export const mockSource: DataSource = {
  subscribe,

  workflows: {
    async list() {
      await wait()
      const state = readState()
      return state.workflows
        .map((workflow) => summarize(workflow, state.runs))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    },

    async get(id) {
      await wait()
      return readState().workflows.find((workflow) => workflow.id === id) ?? null
    },

    async create(input) {
      await wait()
      const now = new Date().toISOString()
      const spark = newId()
      const report = newId()
      const workflow: Workflow = {
        id: newId(),
        name: input?.name?.trim() || 'Untitled workflow',
        description: '',
        graph: {
          nodes: [
            { id: spark, type: 'Spark', position: { x: 0, y: 0 }, config: { triggerType: 'manual_simulate' } },
            { id: report, type: 'Autopsy Report', position: { x: 400, y: 0 }, config: { format: 'markdown' } },
          ],
          edges: [{ id: newId(), source: spark, target: report }],
        },
        createdAt: now,
        updatedAt: now,
      }
      update((s) => ({ ...s, workflows: [workflow, ...s.workflows] }))
      return workflow
    },

    async save(id, input) {
      await wait()
      const existing = readState().workflows.find((workflow) => workflow.id === id)
      if (!existing) throw new Error('Workflow not found')
      const saved: Workflow = {
        ...existing,
        name: input.name?.trim() || existing.name,
        graph: input.graph,
        updatedAt: new Date().toISOString(),
      }
      update((s) => ({ ...s, workflows: s.workflows.map((w) => (w.id === id ? saved : w)) }))
      return saved
    },
  },

  runs: {
    async list() {
      await wait()
      return readState()
        .runs.map(
          (run): RunSummary => ({
            id: run.id,
            workflowId: run.workflowId,
            workflowName: run.workflowName,
            status: runStatusAt(run),
            startedAt: run.startedAt,
          }),
        )
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    },

    async get(id) {
      await wait()
      return readState().runs.find((run) => run.id === id) ?? null
    },

    async start(workflowId) {
      await wait()
      const workflow = readState().workflows.find((w) => w.id === workflowId)
      if (!workflow) throw new Error('Workflow not found')
      const run: Run = {
        id: newId(),
        workflowId,
        workflowName: workflow.name,
        trigger: triggerOf(workflow.graph) ?? 'manual_simulate',
        startedAt: new Date().toISOString(),
        graph: structuredClone(workflow.graph),
        events: buildTimeline(workflow.graph),
      }
      update((s) => ({ ...s, runs: [run, ...s.runs] }))
      return run
    },

    async decide(runId, decision) {
      await wait()
      const run = readState().runs.find((r) => r.id === runId)
      if (!run) throw new Error('Run not found')
      if (runStatusAt(run) !== 'awaiting_approval') throw new Error('This run is not waiting for approval')
      const at = elapsedMs(run)
      const decided: Run = { ...run, events: [...run.events, ...buildDecision(run, decision, at)] }
      update((s) => ({ ...s, runs: s.runs.map((r) => (r.id === runId ? decided : r)) }))
      return decided
    },
  },

  runners: {
    async list() {
      await wait()
      return readState().runners.map(publicRunner)
    },

    async createToken(name) {
      await wait()
      const token = `fpr_${randomHex(24)}`
      const record: RunnerRecord = {
        id: newId(),
        name: name.trim() || 'New runner',
        status: 'offline',
        lastSeenAt: null,
        createdAt: new Date().toISOString(),
        tokenPreview: `fpr_…${token.slice(-4)}`,
        // security.md: tokens are stored hashed, never in plain text.
        tokenHash: await sha256Hex(token),
      }
      update((s) => ({ ...s, runners: [record, ...s.runners] }))
      return { runner: publicRunner(record), token }
    },
  },

  github: {
    async get() {
      await wait()
      return readState().github
    },

    async connect(repository) {
      await wait()
      const repo = repository.trim()
      if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
        throw new Error('Use the form owner/repository, for example octo-org/shop-api.')
      }
      const github: GithubSettings = {
        ...readState().github,
        repository: repo,
        connectedAt: new Date().toISOString(),
      }
      update((s) => ({ ...s, github }))
      return github
    },

    async disconnect() {
      await wait()
      const github: GithubSettings = { ...readState().github, repository: null, connectedAt: null }
      update((s) => ({ ...s, github }))
      return github
    },

    async setTriggers(triggers) {
      await wait()
      const github: GithubSettings = { ...readState().github, triggers }
      update((s) => ({ ...s, github }))
      return github
    },
  },
}
